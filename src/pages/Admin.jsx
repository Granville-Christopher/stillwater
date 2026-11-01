import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDeposit,
  adminSessionOn,
  checkAdminService,
  enterAdmin,
  hasLocalAccount,
  leaveAdmin,
  listBuyers,
  loadAdmin,
  RAIL_IDS,
  refreshDesk,
  registerAdmin,
  saveDownPayment,
  savePaymentDetails,
} from "../admin.js";
import { Logo, useTitle } from "../components.jsx";
import { cryptoText, DEFAULT_DOWN_PAYMENT, PREQUAL_CAP, usd, when } from "../data.js";

const LABELS = { usdc: "USD Coin", btc: "Bitcoin", eth: "Ethereum" };

export function FundingPanel() {
  const [details, setDetails] = useState(loadAdmin);
  useEffect(() => {
    refreshDesk().then(setDetails);
    const refresh = () => setDetails(loadAdmin());
    window.addEventListener("stillwater-admin", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("stillwater-admin", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const posted = RAIL_IDS.filter((id) => details.rails[id].address.trim());
  const wirePosted = Boolean(details.wire.bank || details.wire.account || details.wire.routing);
  const cashPosted = Boolean(details.cash.address.trim());
  if (posted.length === 0 && !wirePosted && !cashPosted) {
    return (
      <section className="panel">
        <h2>Where to send a payment</h2>
        <p>Payment instructions have not been posted yet.</p>
      </section>
    );
  }
  return (
    <section className="panel">
      <h2>Where to send a payment</h2>
      <p>Use these details to send a payment.</p>
      <ul className="rail-list">
        {posted.map((id) => (
          <li key={id}>
            <strong>{LABELS[id]} · {details.rails[id].network}</strong>
            <span>{details.rails[id].address}</span>
            {details.rails[id].note && <em>{details.rails[id].note}</em>}
          </li>
        ))}
        {wirePosted && (
          <li>
            <strong>Wire transfer · {details.wire.bank || "Bank"}</strong>
            <span>{[details.wire.name, details.wire.routing && `Routing ${details.wire.routing}`, details.wire.account && `Account ${details.wire.account}`].filter(Boolean).join(" · ")}</span>
            {details.wire.reference && <em>Reference: {details.wire.reference}</em>}
          </li>
        )}
        {cashPosted && (
          <li>
            <strong>Cash deposit by mail{details.cash.name ? ` · ${details.cash.name}` : ""}</strong>
            <span>{details.cash.address}</span>
            {details.cash.note && <em>{details.cash.note}</em>}
          </li>
        )}
      </ul>
    </section>
  );
}

export function AdminPage() {
  useTitle("Admin — Stillwater");
  const [open, setOpen] = useState(adminSessionOn);
  const [mode, setMode] = useState(() => (hasLocalAccount() ? "login" : "register"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(loadAdmin);
  const [saved, setSaved] = useState(false);
  const [downInput, setDownInput] = useState(() => String(loadAdmin().downPayment));
  const [depositInput, setDepositInput] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [buyers, setBuyers] = useState([]);
  const [buyerId, setBuyerId] = useState("");

  useEffect(() => {
    checkAdminService().then((next) => {
      if (next.registered || hasLocalAccount()) setMode("login");
    });
    refreshDesk().then((desk) => {
      setData(desk);
      setDownInput(String(desk.downPayment));
    });
    listBuyers().then((next) => {
      setBuyers(next);
      setBuyerId((current) => current || next[0]?.id || next[0]?.email || "");
    });
    const refresh = () => {
      setData(loadAdmin());
      listBuyers().then(setBuyers);
    };
    window.addEventListener("stillwater-admin", refresh);
    window.addEventListener("stillwater-buyer", refresh);
    return () => {
      window.removeEventListener("stillwater-admin", refresh);
      window.removeEventListener("stillwater-buyer", refresh);
    };
  }, []);

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    let result;
    try {
      result = mode === "register"
        ? await registerAdmin({ name, email, password, confirm })
        : await enterAdmin({ email, password });
    } catch {
      result = { ok: false, error: "The admin desk could not be opened." };
    }
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setPassword("");
    setConfirm("");
    setOpen(true);
    const desk = await refreshDesk();
    setData(desk);
    setDownInput(String(desk.downPayment));
    const nextBuyers = await listBuyers();
    setBuyers(nextBuyers);
    setBuyerId(nextBuyers[0]?.id || nextBuyers[0]?.email || "");
  }

  async function saveDown(event) {
    event.preventDefault();
    const result = await saveDownPayment(downInput);
    if (!result.ok) {
      setFileError(result.error);
      setFileNote("");
      return;
    }
    setFileError("");
    setFileNote("Down payment saved. Buyers see this amount on the desk.");
    setData(loadAdmin());
  }

  async function recordDeposit(event) {
    event.preventDefault();
    const result = await addDeposit(depositInput, buyerId);
    if (!result.ok) {
      setFileError(result.error);
      setFileNote("");
      return;
    }
    setDepositInput("");
    setFileError("");
    const nextBuyers = await listBuyers();
    setBuyers(nextBuyers);
    const selected = result.buyer || nextBuyers.find((buyer) => buyer.id === buyerId || buyer.email === buyerId);
    setFileNote(selected
      ? `Added to ${selected.name || selected.email}'s pre-qualified funds.`
      : "Added to that buyer's pre-qualified funds.");
  }

  function updateRail(id, field, value) {
    setSaved(false);
    setData((current) => ({
      ...current,
      rails: { ...current.rails, [id]: { ...current.rails[id], [field]: value } },
    }));
  }

  function updateBlock(block, field, value) {
    setSaved(false);
    setData((current) => ({
      ...current,
      [block]: { ...current[block], [field]: value },
    }));
  }

  const selectedBuyer = buyers.find((buyer) => buyer.id === buyerId || buyer.email === buyerId);
  const purchaseRows = selectedBuyer
    ? (selectedBuyer.payments || []).map((payment) => ({
        ...payment,
        name: selectedBuyer.name,
        email: selectedBuyer.email,
        coins: payment.coins || [{ asset: payment.asset, usd: payment.usd, cryptoAmount: payment.cryptoAmount }],
        toDown: payment.toDown || 0,
        toClosing: payment.toClosing || 0,
        toPrincipal: payment.toPrincipal || 0,
      }))
    : data.purchases;

  async function saveDetails(event) {
    event.preventDefault();
    const result = await savePaymentDetails({ rails: data.rails, wire: data.wire, cash: data.cash });
    if (!result.ok) {
      setFileError(result.error);
      setSaved(false);
      return;
    }
    setFileError("");
    setSaved(true);
    setData(loadAdmin());
  }

  return (
    <main className="admin-shell">
      <header className="admin-bar">
        <Link to="/" className="brand-link"><Logo /></Link>
        <Link to="/dashboard">Buyer desk</Link>
      </header>
      {!open ? (
        <form className="panel stack-form admin-card" onSubmit={submitAuth}>
          <p className="eyebrow">Admin</p>
          <h1>{mode === "register" ? "Create the admin account" : "Sign in"}</h1>
          <p>
            {mode === "register"
              ? "Register with an email and password. Use those details to open the desk later."
              : "Sign in with the email and password you registered."}
          </p>
          <div className="auth-switch" role="tablist">
            <button type="button" className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setError(""); }}>
              Sign in
            </button>
            <button type="button" className={mode === "register" ? "on" : ""} onClick={() => { setMode("register"); setError(""); }}>
              Create account
            </button>
          </div>
          {mode === "register" && (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} />
          </label>
          {mode === "register" && (
            <label>
              Confirm password
              <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />
            </label>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>
      ) : (
        <div className="admin-body">
          <div className="desk-head">
            <div>
              <p className="eyebrow">Admin</p>
              <h1>Payment details and purchases</h1>
              <p>Set the down payment, then choose a buyer and add funds to that person only. Payment details below are shared.</p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => { leaveAdmin(); setOpen(false); setMode(hasLocalAccount() ? "login" : "register"); setPassword(""); setConfirm(""); }}>Sign out</button>
          </div>

          <form className="panel stack-form" onSubmit={saveDown}>
            <h2>Down payment</h2>
            <p>This starts at {usd(DEFAULT_DOWN_PAYMENT)}. Buyers use it as the amount they have to complete.</p>
            <label>
              Down payment
              <input inputMode="decimal" value={downInput} onChange={(event) => { setDownInput(event.target.value); setFileNote(""); }} />
            </label>
            <button type="submit" className="btn btn-primary">Save down payment</button>
          </form>

          <section className="panel">
            <div className="desk-head">
              <div>
                <h2>Registered buyers</h2>
                <p>{buyers.length === 0 ? "No buyer has created an account yet." : `${buyers.length} buyer${buyers.length === 1 ? "" : "s"} on file. Select a row, then add funds below.`}</p>
              </div>
            </div>
            {buyers.length > 0 && (
              <div className="table-wrap">
                <table className="people-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Buyer</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Pre-qualified funds</th>
                      <th>Payments</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyers.map((buyer) => {
                      const id = buyer.id || buyer.email;
                      const selected = id === buyerId;
                      const paid = (buyer.payments || []).reduce((sum, payment) => sum + (Number(payment.usd) || 0), 0);
                      return (
                        <tr key={id} className={selected ? "is-selected" : ""} onClick={() => { setBuyerId(id); setFileNote(""); }}>
                          <td>
                            <button type="button" className={selected ? "btn btn-primary" : "btn btn-ghost"} onClick={(event) => { event.stopPropagation(); setBuyerId(id); setFileNote(""); }}>
                              {selected ? "Selected" : "Select"}
                            </button>
                          </td>
                          <td>
                            <strong>{buyer.name || "Buyer"}</strong>
                            <em>{buyer.prequalified ? "Pre-qualified" : "Account only"}</em>
                          </td>
                          <td>{buyer.email || "—"}</td>
                          <td>{buyer.phone || "—"}</td>
                          <td>{usd(buyer.deposited || 0)}</td>
                          <td>{usd(paid, 2)}</td>
                          <td>{buyer.createdAt ? when(buyer.createdAt) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <form className="panel stack-form" onSubmit={recordDeposit}>
            <h2>Already deposited</h2>
            <p>
              {selectedBuyer
                ? `Adding only to ${selectedBuyer.name || selectedBuyer.email}. Pre-qualified funds cannot go above ${usd(PREQUAL_CAP)}.`
                : `Select a buyer in the table first. The amount is added only to that person, up to ${usd(PREQUAL_CAP)}.`}
            </p>
            <div className="fund-readout">
              <span>{selectedBuyer ? `${selectedBuyer.name || selectedBuyer.email}'s pre-qualified funds` : "Pre-qualified funds"}</span>
              <strong>{usd(selectedBuyer?.deposited || 0)}</strong>
              <em>{usd(Math.max(0, PREQUAL_CAP - (selectedBuyer?.deposited || 0)))} still fits under {usd(PREQUAL_CAP)}</em>
            </div>
            <label>
              Amount to add
              <input inputMode="decimal" value={depositInput} onChange={(event) => { setDepositInput(event.target.value); setFileNote(""); }} placeholder="0.00" disabled={!buyerId} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={!buyerId}>Add to this buyer</button>
            {selectedBuyer?.deposits?.length > 0 && (
              <ul className="rail-list">
                {selectedBuyer.deposits.map((deposit) => (
                  <li key={deposit.id}>
                    <strong>{usd(deposit.amount, 2)}</strong>
                    <span>{when(deposit.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </form>
          {fileError && <p className="form-error" role="alert">{fileError}</p>}
          {fileNote && <p className="receipt">{fileNote}</p>}

          <form className="panel stack-form" onSubmit={saveDetails}>
            <h2>Crypto payment details</h2>
            {RAIL_IDS.map((id) => (
              <fieldset key={id} className="rail-form">
                <legend>{LABELS[id]}</legend>
                <label>
                  Network
                  <input value={data.rails[id].network} onChange={(event) => updateRail(id, "network", event.target.value)} />
                </label>
                <label>
                  Address
                  <input value={data.rails[id].address} onChange={(event) => updateRail(id, "address", event.target.value)} placeholder="Paste the receiving address" />
                </label>
                <label>
                  Note for the buyer
                  <input value={data.rails[id].note} onChange={(event) => updateRail(id, "note", event.target.value)} placeholder="Optional memo or reference" />
                </label>
              </fieldset>
            ))}
            <fieldset className="rail-form">
              <legend>Wire transfer</legend>
              <label>
                Bank
                <input value={data.wire.bank} onChange={(event) => updateBlock("wire", "bank", event.target.value)} />
              </label>
              <label>
                Name on the account
                <input value={data.wire.name} onChange={(event) => updateBlock("wire", "name", event.target.value)} />
              </label>
              <label>
                Routing number or SWIFT
                <input value={data.wire.routing} onChange={(event) => updateBlock("wire", "routing", event.target.value)} />
              </label>
              <label>
                Account number
                <input value={data.wire.account} onChange={(event) => updateBlock("wire", "account", event.target.value)} />
              </label>
              <label>
                Reference the buyer should include
                <input value={data.wire.reference} onChange={(event) => updateBlock("wire", "reference", event.target.value)} />
              </label>
            </fieldset>
            <fieldset className="rail-form">
              <legend>Cash deposit by mail</legend>
              <label>
                Payable to
                <input value={data.cash.name} onChange={(event) => updateBlock("cash", "name", event.target.value)} />
              </label>
              <label>
                Mailing address
                <textarea rows={3} value={data.cash.address} onChange={(event) => updateBlock("cash", "address", event.target.value)} placeholder="Street, city, state, ZIP" />
              </label>
              <label>
                Note for the buyer
                <input value={data.cash.note} onChange={(event) => updateBlock("cash", "note", event.target.value)} placeholder="How the cash should be mailed" />
              </label>
            </fieldset>
            {saved && <p className="receipt">Saved. Buyers now see these details on the pay page.</p>}
            <button type="submit" className="btn btn-primary">Save payment details</button>
          </form>

          <section className="panel">
            <h2>{selectedBuyer ? `Payments by ${selectedBuyer.name || selectedBuyer.email}` : "People who paid"}</h2>
            {purchaseRows.length === 0 ? (
              <p>{selectedBuyer ? "This buyer has not recorded a payment yet." : "No purchase has been recorded yet."}</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Buyer</th>
                      <th>Paid</th>
                      <th>Method</th>
                      <th>Down payment</th>
                      <th>Closing</th>
                      <th>Principal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRows.map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{when(purchase.at)}</td>
                        <td>{purchase.name}{purchase.email ? ` · ${purchase.email}` : ""}</td>
                        <td>{usd(purchase.usd, 2)}</td>
                        <td>{(purchase.coins || []).map((coin) => cryptoText(coin.asset, coin.cryptoAmount)).join(", ") || "—"}</td>
                        <td>{usd(purchase.toDown, 2)}</td>
                        <td>{usd(purchase.toClosing, 2)}</td>
                        <td>{usd(purchase.toPrincipal, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
