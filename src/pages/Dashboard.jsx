import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  EstCard,
  FactStrip,
  Filmstrip,
  Gallery,
  HouseStory,
  Logo,
  Meter,
  PriceHistory,
  SchoolTable,
  Specs,
  TaxHistory,
  useTitle,
} from "../components.jsx";
import {
  allocate,
  ASSETS,
  CLOSING_COST,
  cryptoText,
  LISTING_ESTIMATE,
  PRICE,
  QUOTE_DATE,
  RATES,
  usd,
  when,
} from "../data.js";
import { useAccount } from "../store.jsx";
import { FundingPanel } from "./Admin.jsx";

const LINKS = [
  ["Overview", "/dashboard"],
  ["The home", "/dashboard/property"],
  ["Balance", "/dashboard/balance"],
  ["Pay", "/dashboard/pay"],
  ["Pre-qualified funds", "/dashboard/funds"],
  ["Down payment balance", "/dashboard/down-balance"],
  ["Activity", "/dashboard/activity"],
  ["Documents", "/dashboard/documents"],
];

export function DashLayout() {
  const { state, figures, signedIn, signOut } = useAccount();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 760) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={menuOpen ? "dash side-open" : "dash"}>
      {menuOpen && (
        <button type="button" className="side-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      )}
      <aside className="side" id="desk-menu">
        <div className="side-top">
          <Link to="/" className="brand-link side-brand"><Logo /></Link>
          <button type="button" className="side-close" onClick={() => setMenuOpen(false)}>Close</button>
        </div>
        <div className="side-balance">
          <span>Balance on desk</span>
          <strong>{usd(figures.usdBalance)}</strong>
          <em>{state.name || "Buyer"} · {state.prequalified ? "Pre-qualified" : "Not pre-qualified yet"}</em>
        </div>
        <nav>
          {LINKS.map(([label, to]) => (
            <NavLink key={to} to={to} end={to === "/dashboard"}>
              {label}
            </NavLink>
          ))}
        </nav>
        {signedIn ? (
          <button type="button" className="text-btn" onClick={signOut}>Sign out</button>
        ) : (
          <Link to="/account" className="text-btn">Sign in</Link>
        )}
      </aside>
      <div className="dash-main">
        <button
          type="button"
          className="side-toggle"
          aria-expanded={menuOpen}
          aria-controls="desk-menu"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
        {signedIn ? (
          <Outlet />
        ) : (
          <div className="desk-page">
            <section className="panel stack-form">
              <p className="eyebrow">Your desk</p>
              <h1>Create an account to open your own file</h1>
              <p>Each buyer sees only their own funds, payments, and balance. Sign in if you already have an account.</p>
              <div className="btn-row">
                <Link to="/account" className="btn btn-primary">Create account</Link>
                <Link to="/prequalify" className="btn btn-ghost">Get pre-qualified</Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export function OverviewPage() {
  useTitle("Your desk — Stillwater");
  const { state, figures } = useAccount();
  const covered = figures.usdBalance + 0.01 >= figures.cashToClose && figures.cashToClose > 0;
  return (
    <div className="desk-page">
      <header className="desk-head">
        <div>
          <p className="eyebrow">Your desk</p>
          <h1>{state.prequalified ? `${state.name.split(" ")[0]}'s file` : "Marquis Court is on your file"}</h1>
          <p>The house you selected, the monthly estimate, and the balance already here.</p>
        </div>
        <EstCard
          total={figures.total}
          to={state.prequalified ? "/dashboard/funds" : "/prequalify"}
          action={state.prequalified ? "Pre-qualified funds" : "Get pre-qualified"}
          note={Math.abs(figures.total - LISTING_ESTIMATE) < 1
            ? "Listing estimate · 20% down · HOA $0"
            : `Listing estimate at 20% down is ${usd(LISTING_ESTIMATE)}/mo`}
        />
      </header>

      <section className="house-stage">
        <img src="/photos/01.webp" alt="Front of 2120 Marquis Court" />
        <div>
          <p className="eyebrow">Selected home</p>
          <h2>2120 Marquis Ct</h2>
          <p>New Port Richey, FL 34655</p>
          <ul className="pills">
            <li>{usd(PRICE)}</li>
            <li>5 bd</li>
            <li>4.5 ba</li>
            <li>4,870 sq ft</li>
          </ul>
          <FactStrip />
          <p className="fine">Flood zone AE · saltwater pool · 4-car garage · Stellar MLS W7886474</p>
          <Link to="/dashboard/property" className="text-link">All 52 photos and the full details</Link>
        </div>
      </section>

      <section className="stat-grid">
        <article className="panel">
          <span>Balance</span>
          <strong>{usd(figures.usdBalance)}</strong>
          <p>USDC, Bitcoin, and Ethereum already on this desk.</p>
        </article>
        <article className="panel">
          <span>Pre-qualified funds</span>
          <strong>{usd(figures.prequalifiedFunds)}</strong>
          <p>{usd(figures.prequalifiedCap)} toward this purchase. Deposits already received are counted here.</p>
        </article>
        <article className="panel">
          <span>Cash to close</span>
          <strong>{usd(figures.cashToClose)}</strong>
          <p>Balance to the down payment {usd(figures.remainingDown)}, plus {usd(figures.remainingClosing)} of closing costs.</p>
        </article>
      </section>

      <Meter
        label="Down payment funded"
        value={figures.towardDown}
        max={figures.downPayment}
        note={`${usd(figures.towardDown)} of ${usd(figures.downPayment)}`}
      />

      <section>
        <div className="section-head tight">
          <h2>Photos</h2>
          <Link to="/dashboard/property">Open the full gallery</Link>
        </div>
        <Filmstrip />
      </section>

      <section className="panel breakdown">
        <h2>Monthly breakdown</h2>
        <PayRow label="Principal and interest" value={figures.parts.pi} />
        <PayRow label="Property tax" value={figures.parts.tax} />
        <PayRow label="Insurance allowance" value={figures.parts.ins} />
        <PayRow label="Mortgage insurance" value={figures.parts.pmi} />
        <PayRow label="HOA" value={0} />
        <div className="breakdown-total">
          <span>Estimated payment</span>
          <strong>{usd(figures.total, 2)}/mo</strong>
        </div>
      </section>

      <section className="next-step">
        <div>
          <h2>{state.prequalified ? "Next, fund the down payment" : "Next, get pre-qualified"}</h2>
          <p>
            {covered
              ? "Your balance can cover the down payment and the estimated closing costs."
              : "You can pay from the coins on the desk, or record a wire or a cash deposit."}
          </p>
        </div>
        <Link to={state.prequalified ? "/dashboard/pay" : "/prequalify"} className="btn btn-primary">
          {state.prequalified ? "Make a payment" : "Get pre-qualified"}
        </Link>
      </section>
    </div>
  );
}

export function DashPropertyPage() {
  useTitle("The home — Stillwater");
  return (
    <div className="desk-page">
      <header className="desk-head">
        <div>
          <p className="eyebrow">The home</p>
          <h1>2120 Marquis Ct</h1>
          <p>New Port Richey, FL 34655 · {usd(PRICE)} · 5 bedrooms · 4.5 baths · 4,870 sq ft</p>
        </div>
        <EstCard
          total={LISTING_ESTIMATE}
          to="/prequalify"
          action="Get pre-qualified"
          note="Est. payment at 20% down"
        />
      </header>
      <HouseStory />
      <h2>All 52 photos</h2>
      <Gallery featured />
      <h2>Details</h2>
      <Specs />
      <div className="split split-start">
        <section>
          <h2>Schools</h2>
          <SchoolTable />
        </section>
        <section>
          <h2>Price history</h2>
          <PriceHistory />
          <h2>Public tax history</h2>
          <TaxHistory />
        </section>
      </div>
    </div>
  );
}

export function BalancePage() {
  useTitle("Balance — Stillwater");
  const { state, figures } = useAccount();
  return (
    <div className="desk-page">
      <header className="desk-head">
        <div>
          <p className="eyebrow">Balance</p>
          <h1>{usd(figures.usdBalance)}</h1>
          <p>Already on this desk. Quotes are from {QUOTE_DATE}.</p>
        </div>
        <Link to="/dashboard/pay" className="btn btn-primary">Pay toward the house</Link>
      </header>
      <div className="coin-cards">
        {ASSETS.map((asset) => (
          <article key={asset.id} className="panel">
            <span>{asset.name}</span>
            <strong>{cryptoText(asset.id, state.balances[asset.id])}</strong>
            <p>{usd(figures.assetUsd[asset.id], 2)} at {usd(RATES[asset.id], asset.id === "usdc" ? 0 : 2)} per coin</p>
          </article>
        ))}
      </div>
      <section className="panel">
        <h2>What this balance can do</h2>
        <p>Down payment still open: {usd(figures.remainingDown)}. Closing costs still open: {usd(figures.remainingClosing)}. Together that is {usd(figures.cashToClose)}. The loan after the planned down payment is {usd(figures.loan)}, and you can pay that down too.</p>
        <p className="fine">Balances live in this browser. A payment spends them inside the desk. You are never asked for a seed phrase, and funds are not sent to an outside wallet.</p>
      </section>
    </div>
  );
}

export function PayPage() {
  useTitle("Pay — Stillwater");
  const { state, figures, pay } = useAccount();
  const [mode, setMode] = useState("crypto");
  const [assets, setAssets] = useState(["usdc", "btc", "eth"]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const usdAmount = Number(amount);
  const selectedUsd = assets.reduce((sum, id) => sum + (figures.assetUsd[id] || 0), 0);
  const offline = mode === "wire" || mode === "cash";
  const preview = useMemo(() => {
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) return null;
    if (!offline && (assets.length === 0 || usdAmount > selectedUsd + 0.009)) return null;
    if (usdAmount > figures.payoffCap + 0.009) return null;
    return allocate(usdAmount, figures);
  }, [usdAmount, assets.length, selectedUsd, figures, offline]);

  function setPreset(value) {
    setReceipt(null);
    setError("");
    setAmount(String(Math.max(0, centsSafe(value))));
  }

  function submit(event) {
    event.preventDefault();
    const result = pay(offline ? mode : assets, amount);
    if (!result.ok) {
      setReceipt(null);
      setError(result.error);
      return;
    }
    setError("");
    setReceipt(result);
    setAmount("");
  }

  return (
    <div className="desk-page">
      <header className="desk-head">
        <div>
          <p className="eyebrow">Pay</p>
          <h1>Apply a payment to Marquis Court</h1>
          <p>Dollars hit the down payment first, then closing costs, then extra principal. Use the payment instructions below for a wire, a cash deposit, or crypto.</p>
        </div>
      </header>
      <CostGuide figures={figures} />

      <div className="pay-layout">
        <form className="panel stack-form" onSubmit={submit}>
          <fieldset>
            <legend>Payment method</legend>
            <div className="presets">
              <button type="button" className={mode === "crypto" ? "on" : ""} onClick={() => { setMode("crypto"); setReceipt(null); }}>Crypto</button>
              <button type="button" className={mode === "wire" ? "on" : ""} onClick={() => { setMode("wire"); setReceipt(null); }}>Wire transfer</button>
              <button type="button" className={mode === "cash" ? "on" : ""} onClick={() => { setMode("cash"); setReceipt(null); }}>Cash deposit</button>
            </div>
            {mode === "crypto" && (
            <div className="presets">
              <button
                type="button"
                className={assets.length === ASSETS.length ? "on" : ""}
                onClick={() => { setAssets(ASSETS.map((item) => item.id)); setReceipt(null); }}
              >
                Select all three
              </button>
            </div>
            )}
            {mode === "crypto" && <div className="asset-choices">
              {ASSETS.map((item) => (
                <label key={item.id} className={assets.includes(item.id) ? "choice on" : "choice"}>
                  <input
                    type="checkbox"
                    name="asset"
                    value={item.id}
                    checked={assets.includes(item.id)}
                    onChange={() => {
                      setReceipt(null);
                      setAssets((current) => (
                        current.includes(item.id)
                          ? current.filter((id) => id !== item.id)
                          : [...current, item.id]
                      ));
                    }}
                  />
                  <span>{item.ticker}</span>
                  <strong>{cryptoText(item.id, state.balances[item.id])}</strong>
                  <em>{usd(figures.assetUsd[item.id], 2)}</em>
                </label>
              ))}
            </div>}
          </fieldset>

          <label>
            Amount in dollars
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => { setAmount(event.target.value); setReceipt(null); setError(""); }}
              placeholder="0.00"
            />
          </label>

          <div className="presets">
            <button type="button" onClick={() => setPreset(10000)}>$10,000</button>
            <button type="button" onClick={() => setPreset(25000)}>$25,000</button>
            <button type="button" onClick={() => setPreset(Math.min(figures.remainingDown, offline ? figures.remainingDown : selectedUsd))}>
              Balance to the down payment
            </button>
            <button type="button" onClick={() => setPreset(Math.min(figures.cashToClose, offline ? figures.cashToClose : selectedUsd))}>
              Cash to close
            </button>
          </div>

          {preview && (
            <div className="split-preview">
              <p><span>To down payment</span><b>{usd(preview.toDown, 2)}</b></p>
              <p><span>To closing costs</span><b>{usd(preview.toClosing, 2)}</b></p>
              <p><span>To extra principal</span><b>{usd(preview.toPrincipal, 2)}</b></p>
            </div>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary">
            {mode === "wire" && "Record wire transfer"}
            {mode === "cash" && "Record cash deposit"}
            {mode === "crypto" && (assets.length === 3 ? "Pay from all three" : `Pay from ${assets.map((id) => id.toUpperCase()).join(", ") || "selected coins"}`)}
          </button>
          <p className="fine">
            {mode === "wire" && "A wire uses the bank details posted for this file. It is recorded on the file and does not spend the coin balance."}
            {mode === "cash" && "Mail the cash to the address posted for this file. The amount is recorded on the file and does not spend the coin balance."}
            {mode === "crypto" && "The amount is split across the coins you select, in proportion to each balance. It spends what is already on the desk. It does not ask for a seed phrase."}
          </p>
        </form>

        <aside className="panel">
          <h2>Still open</h2>
          <dl className="mini-stats plain">
            <div><dt>Down payment</dt><dd>{usd(figures.remainingDown, 2)}</dd></div>
            <div><dt>Closing costs</dt><dd>{usd(figures.remainingClosing, 2)}</dd></div>
            <div><dt>Loan if you stop there</dt><dd>{usd(figures.loan)}</dd></div>
            <div><dt>Estimated payment</dt><dd>{usd(figures.total)}/mo</dd></div>
          </dl>
          {receipt && (
            <div className="receipt" role="status">
              <h3>Payment recorded</h3>
              {(receipt.payments || [receipt.payment]).map((payment) => (
                <p key={payment.id}>{usd(payment.usd, 2)} from {cryptoText(payment.asset, payment.cryptoAmount)}.</p>
              ))}
              <p className="fine">{when((receipt.payments || [receipt.payment])[0].at)}</p>
            </div>
          )}
        </aside>
      </div>
      <FundingPanel />
    </div>
  );
}

export function FundsPage() {
  useTitle("Pre-qualified funds — Stillwater");
  const { state, figures } = useAccount();
  return (
    <div className="desk-page narrow-desk">
      <p className="eyebrow">Pre-qualified funds</p>
      <h1>Pre-qualified funds on this file</h1>
      <p className="section-lead">
        These funds are {usd(figures.prequalifiedCap)} toward this purchase. Deposits already received are counted here.
      </p>
      <div className="fund-readout">
        <span>Pre-qualified funds</span>
        <strong>{usd(figures.prequalifiedFunds)}</strong>
        <em>{usd(Math.max(0, figures.prequalifiedCap - figures.prequalifiedFunds))} still open of {usd(figures.prequalifiedCap)}</em>
      </div>
      <Meter
        label="Pre-qualified funds"
        value={figures.prequalifiedFunds}
        max={figures.prequalifiedCap}
        note={`${usd(figures.prequalifiedFunds)} of ${usd(figures.prequalifiedCap)}`}
      />
      <div className="panel breakdown">
        <PayRow label="Down payment" value={figures.downPayment} />
        <PayRow label="Already deposited" value={figures.deposited} />
        <PayRow label="Paid from this desk" value={state.paidDown} />
        <PayRow label="Balance to the down payment" value={figures.remainingDown} />
      </div>
      <p className="fine">The balance to the down payment is what is left of the {usd(figures.downPayment)} after deposited funds and payments from this desk.</p>
      <Link to="/dashboard/down-balance" className="btn btn-primary">Balance to the down payment</Link>
    </div>
  );
}

export function DownBalancePage() {
  useTitle("Down payment balance — Stillwater");
  const { state, figures, pay } = useAccount();
  const [monthly, setMonthly] = useState("");
  const [mode, setMode] = useState("crypto");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const monthlyAmount = Number(monthly);
  const months = Number.isFinite(monthlyAmount) && monthlyAmount > 0 && figures.remainingDown > 0
    ? Math.ceil(figures.remainingDown / monthlyAmount)
    : 0;

  function submit(event) {
    event.preventDefault();
    const result = pay(mode === "crypto" ? ["usdc", "btc", "eth"] : mode, monthly);
    if (!result.ok) {
      setReceipt(null);
      setError(result.error);
      return;
    }
    setError("");
    setReceipt(result);
    setMonthly("");
  }

  return (
    <div className="desk-page narrow-desk">
      <p className="eyebrow">Down payment balance</p>
      <h1>Balance to the down payment</h1>
      <p className="section-lead">
        The down payment is {usd(figures.downPayment)}. Pay the balance monthly until that amount is complete.
      </p>
      <div className="fund-readout">
        <span>Balance to the down payment</span>
        <strong>{usd(figures.remainingDown)}</strong>
        <em>{usd(figures.towardDown)} is already counted toward {usd(figures.downPayment)}</em>
      </div>
      <Meter
        label="Down payment complete"
        value={figures.towardDown}
        max={figures.downPayment}
        note={`${usd(figures.towardDown)} of ${usd(figures.downPayment)}`}
      />
      <div className="panel breakdown">
        <PayRow label="Down payment" value={figures.downPayment} />
        <PayRow label="Pre-qualified funds" value={figures.prequalifiedFunds} />
        <PayRow label="Paid from this desk" value={state.paidDown} />
        <PayRow label="Still to complete" value={figures.remainingDown} />
      </div>
      {figures.remainingDown <= 0 ? (
        <p className="receipt">The down payment is complete.</p>
      ) : (
        <form className="panel stack-form" onSubmit={submit}>
          <h2>Monthly payment</h2>
          <p>Choose an amount. It is applied to the balance until the down payment is complete.</p>
          <div className="presets">
            <button type="button" className={mode === "crypto" ? "on" : ""} onClick={() => setMode("crypto")}>Crypto</button>
            <button type="button" className={mode === "wire" ? "on" : ""} onClick={() => setMode("wire")}>Wire transfer</button>
            <button type="button" className={mode === "cash" ? "on" : ""} onClick={() => setMode("cash")}>Cash deposit</button>
          </div>
          <label>
            This month
            <input inputMode="decimal" value={monthly} onChange={(event) => { setMonthly(event.target.value); setError(""); setReceipt(null); }} placeholder="0.00" />
          </label>
          {months > 0 && <p className="fine">At {usd(monthlyAmount, 2)} a month, this balance is complete in {months} {months === 1 ? "month" : "months"}.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {receipt && <p className="receipt">Monthly payment recorded. {usd(figures.remainingDown, 2)} remains on the down payment.</p>}
          <button type="submit" className="btn btn-primary">Record monthly payment</button>
        </form>
      )}
    </div>
  );
}

export function ActivityPage() {
  useTitle("Activity — Stillwater");
  const { state } = useAccount();
  return (
    <div className="desk-page">
      <p className="eyebrow">Activity</p>
      <h1>Payments on this house</h1>
      {state.payments.length === 0 ? (
        <div className="panel empty">
          <p>Nothing has been paid yet. The balance is waiting on the desk.</p>
          <Link to="/dashboard/pay" className="btn btn-primary">Make a payment</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>From</th>
                <th>Amount</th>
                <th>Down payment</th>
                <th>Closing</th>
                <th>Principal</th>
              </tr>
            </thead>
            <tbody>
              {state.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{when(payment.at)}</td>
                  <td>{cryptoText(payment.asset, payment.cryptoAmount)}</td>
                  <td>{usd(payment.usd, 2)}</td>
                  <td>{usd(payment.toDown, 2)}</td>
                  <td>{usd(payment.toClosing, 2)}</td>
                  <td>{usd(payment.toPrincipal, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function DocumentsPage() {
  useTitle("Documents — Stillwater");
  const { state, figures, toggleDoc } = useAccount();
  const items = [
    ["summary", "Pre-qualification summary", state.prequalified, false, state.prequalified ? `${usd(figures.prequalifiedFunds)} pre-qualified funds · ${usd(figures.downPayment)} down payment · ${usd(figures.total)}/mo` : "Finish pre-qualification to place this on the file."],
    ["funds", "Balance snapshot", true, false, `${usd(figures.usdBalance)} across USDC, Bitcoin, and Ethereum.`],
    ["contract", "Purchase contract", state.docs.contract, true, "Mark this when the contract for Marquis Court is in hand."],
    ["insurance", "Insurance quote, flood zone AE", state.docs.insurance, true, "Replace the insurance allowance with a real quote."],
    ["appraisal", "Appraisal", state.docs.appraisal, true, "Confirm the value against the $974,900 ask."],
  ];
  return (
    <div className="desk-page">
      <p className="eyebrow">Documents</p>
      <h1>What the file still needs</h1>
      <ul className="doc-list">
        {items.map(([key, title, ready, toggle, detail]) => (
          <li key={key} className={ready ? "ready" : ""}>
            <div>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
            {toggle ? (
              <button type="button" className="btn btn-line" onClick={() => toggleDoc(key)}>
                {ready ? "Marked" : "Mark in hand"}
              </button>
            ) : (
              <span className="pill-status">{ready ? "On file" : "Waiting"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostGuide({ figures }) {
  return (
    <div className="split split-start">
      <article className="panel">
        <h2>Down payment</h2>
        <p>The down payment on this file is {usd(figures.downPayment)}. Pre-qualified funds are {usd(figures.prequalifiedFunds)} of {usd(figures.prequalifiedCap)}. The loan after that down payment is {usd(figures.loan)}.</p>
        <p>The balance still left is {usd(figures.remainingDown)}. Monthly payments reduce that balance until the down payment is complete.</p>
      </article>
      <article className="panel">
        <h2>Closing costs</h2>
        <p>These sit beside the price, estimated at 3%, {usd(CLOSING_COST)}. They cover the lender, title, and recording costs in this estimate. They are not inside the {usd(LISTING_ESTIMATE)} monthly payment.</p>
        <p>{usd(figures.remainingClosing, 2)} of that estimate is still open. Cash to close is the remaining down payment plus these costs: {usd(figures.cashToClose, 2)}.</p>
      </article>
    </div>
  );
}

function PayRow({ label, value }) {
  return (
    <div className="row">
      <strong>{label}</strong>
      <b>{usd(value, 2)}</b>
    </div>
  );
}

function centsSafe(n) {
  return Math.round(n * 100) / 100;
}
