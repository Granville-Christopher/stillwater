import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadAdmin, recordPurchase, refreshDesk } from "./admin.js";
import {
  buyerFunding,
  buyerSessionOn,
  leaveBuyer,
  loadBuyerAccount,
  refreshBuyer,
  saveBuyerDesk,
} from "./buyers.js";
import { allocate, buildFigures, cents, freshAccount, RATES, splitAcrossAssets } from "./data.js";

const AccountContext = createContext(null);

function unsignedAccount() {
  return freshAccount();
}

function termsFor(account) {
  const admin = loadAdmin();
  const funding = buyerFunding(account);
  return {
    downPayment: admin.downPayment,
    deposited: funding.deposited,
    deposits: funding.deposits,
  };
}

export function AccountProvider({ children }) {
  const [state, setState] = useState(() => loadBuyerAccount() || unsignedAccount());
  const [signedIn, setSignedIn] = useState(buyerSessionOn);
  const [terms, setTerms] = useState(() => termsFor(loadBuyerAccount()));

  function applyBuyer(account) {
    if (!account) {
      setSignedIn(false);
      setState(unsignedAccount());
      setTerms(termsFor(null));
      return;
    }
    setSignedIn(true);
    setState(account);
    setTerms(termsFor(account));
  }

  useEffect(() => {
    refreshDesk().then(() => setTerms(termsFor(loadBuyerAccount())));
    refreshBuyer().then((buyer) => {
      if (buyerSessionOn()) applyBuyer(buyer || loadBuyerAccount());
      else applyBuyer(null);
    });
    const refresh = () => {
      const account = loadBuyerAccount();
      setSignedIn(buyerSessionOn());
      if (account) {
        setState(account);
        setTerms(termsFor(account));
      } else if (!buyerSessionOn()) {
        setState(unsignedAccount());
        setTerms(termsFor(null));
      } else {
        setTerms(termsFor(loadBuyerAccount()));
      }
    };
    window.addEventListener("stillwater-admin", refresh);
    window.addEventListener("stillwater-buyer", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("stillwater-admin", refresh);
      window.removeEventListener("stillwater-buyer", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const api = useMemo(() => {
    const figures = buildFigures(state, terms);

    function setDownPercent(downPercent) {
      const next = Math.min(0.5, Math.max(0.1, downPercent));
      setState((current) => {
        const updated = { ...current, downPercent: next };
        if (buyerSessionOn()) saveBuyerDesk(updated);
        return updated;
      });
    }

    function toggleDoc(key) {
      setState((current) => {
        const updated = {
          ...current,
          docs: { ...current.docs, [key]: !current.docs[key] },
        };
        if (buyerSessionOn()) saveBuyerDesk(updated);
        return updated;
      });
    }

    function persist(updated) {
      setState(updated);
      if (buyerSessionOn()) saveBuyerDesk(updated);
    }

    function pay(assetOrAssets, usdAmount) {
      if (!buyerSessionOn()) {
        return { ok: false, error: "Create an account to use this desk." };
      }
      const chosen = (Array.isArray(assetOrAssets) ? assetOrAssets : [assetOrAssets]).filter(Boolean);
      if (chosen.length === 0) {
        return { ok: false, error: "Select at least one coin." };
      }
      const usd = cents(Number(usdAmount));
      if (!Number.isFinite(usd) || usd <= 0) {
        return { ok: false, error: "Enter an amount greater than zero." };
      }
      const snapshot = buildFigures(state, terms);
      const offline = chosen.length === 1 && (chosen[0] === "wire" || chosen[0] === "cash");
      if (!offline && chosen.some((id) => id === "wire" || id === "cash")) {
        return { ok: false, error: "Use coins, a wire, or a cash deposit on its own." };
      }
      if (offline) {
        if (usd > snapshot.payoffCap + 0.009) {
          return { ok: false, error: "That is more than the remaining price and closing costs." };
        }
        const split = allocate(usd, snapshot);
        if (split.applied <= 0) {
          return { ok: false, error: "This home is already fully funded." };
        }
        const payment = {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          asset: chosen[0],
          usd: split.applied,
          cryptoAmount: 0,
          ...split,
        };
        const updated = {
          ...state,
          paidDown: cents(state.paidDown + split.toDown),
          paidClosing: cents(state.paidClosing + split.toClosing),
          paidPrincipal: cents(state.paidPrincipal + split.toPrincipal),
          payments: [payment, ...state.payments],
        };
        persist(updated);
        recordPurchase({
          id: crypto.randomUUID(),
          at: payment.at,
          name: state.name || "Buyer",
          email: state.email || "",
          phone: state.phone || "",
          coins: [{ asset: chosen[0], usd: split.applied, cryptoAmount: 0 }],
          usd: split.applied,
          toDown: split.toDown,
          toClosing: split.toClosing,
          toPrincipal: split.toPrincipal,
        });
        return { ok: true, payment, payments: [payment] };
      }
      const available = chosen.reduce((sum, id) => sum + (snapshot.assetUsd[id] || 0), 0);
      if (usd > available + 0.009) {
        return { ok: false, error: "That amount is larger than the selected balances." };
      }
      if (usd > snapshot.payoffCap + 0.009) {
        return { ok: false, error: "That is more than the remaining price and closing costs." };
      }
      const shares = splitAcrossAssets(chosen, usd, snapshot.assetUsd);
      if (shares.length === 0) {
        return { ok: false, error: "Select a coin that still has a balance." };
      }

      let running = snapshot;
      const payments = [];
      const balances = { ...state.balances };
      let paidDown = state.paidDown;
      let paidClosing = state.paidClosing;
      let paidPrincipal = state.paidPrincipal;

      for (const share of shares) {
        const split = allocate(share.usd, running);
        if (split.applied <= 0) break;
        let cryptoAmount = split.applied / RATES[share.id];
        if (cryptoAmount > balances[share.id]) cryptoAmount = balances[share.id];
        balances[share.id] = Math.max(0, balances[share.id] - cryptoAmount);
        paidDown = cents(paidDown + split.toDown);
        paidClosing = cents(paidClosing + split.toClosing);
        paidPrincipal = cents(paidPrincipal + split.toPrincipal);
        payments.push({
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          asset: share.id,
          usd: split.applied,
          cryptoAmount,
          ...split,
        });
        running = {
          ...running,
          remainingDown: cents(running.remainingDown - split.toDown),
          remainingClosing: cents(running.remainingClosing - split.toClosing),
          loan: cents(Math.max(0, running.loan - split.toPrincipal)),
        };
      }

      if (payments.length === 0) {
        return { ok: false, error: "This home is already fully funded." };
      }

      const totals = payments.reduce(
        (sum, payment) => ({
          usd: cents(sum.usd + payment.usd),
          toDown: cents(sum.toDown + payment.toDown),
          toClosing: cents(sum.toClosing + payment.toClosing),
          toPrincipal: cents(sum.toPrincipal + payment.toPrincipal),
        }),
        { usd: 0, toDown: 0, toClosing: 0, toPrincipal: 0 },
      );

      const updated = {
        ...state,
        paidDown,
        paidClosing,
        paidPrincipal,
        balances,
        payments: [...payments, ...state.payments],
      };
      persist(updated);

      recordPurchase({
        id: crypto.randomUUID(),
        at: payments[0].at,
        name: state.name || "Buyer",
        email: state.email || "",
        phone: state.phone || "",
        coins: payments.map((payment) => ({
          asset: payment.asset,
          usd: payment.usd,
          cryptoAmount: payment.cryptoAmount,
        })),
        ...totals,
      });

      return { ok: true, payment: payments[0], payments };
    }

    function signOut() {
      leaveBuyer();
      applyBuyer(null);
    }

    function acceptBuyer(buyer) {
      applyBuyer(buyer);
    }

    return { state, figures, signedIn, setDownPercent, toggleDoc, pay, signOut, acceptBuyer };
  }, [state, terms]);

  return <AccountContext.Provider value={api}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount must be used inside AccountProvider");
  return value;
}
