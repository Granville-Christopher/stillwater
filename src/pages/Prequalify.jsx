import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { enterBuyer, registerBuyer } from "../buyers.js";
import { CheckList, useTitle } from "../components.jsx";
import {
  CLOSING_COST,
  LISTING_ESTIMATE,
  PRICE,
  usd,
} from "../data.js";
import { useAccount } from "../store.jsx";

function Shell({ step, title, lede, children }) {
  return (
    <main className="prequal">
      <div className="prequal-card">
        <Link to="/" className="home-chip">
          <img src="/photos/01.webp" alt="" />
          <span>
            <strong>2120 Marquis Ct</strong>
            <em>{usd(PRICE)} · Est. {usd(LISTING_ESTIMATE)}/mo</em>
          </span>
        </Link>
        {step && <p className="step-label">Step {step} of 4</p>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
    </main>
  );
}

export function PrequalIntro() {
  useTitle("Get pre-qualified — Stillwater");
  return (
    <Shell
      title="Get clear on costs for the home you're buying"
      lede="Your estimate breaks down what buying Marquis Court actually costs. Your desk then keeps the down payment, the monthly number, and the crypto you already hold in one place."
    >
      <h2>What can change, home to home</h2>
      <div className="check-card">
        <CheckList
          items={[
            "Property tax and HOA fees",
            "Homeowners insurance",
            "Down payment and closing costs",
            "Your monthly payment",
          ]}
        />
      </div>
      <Link to="/prequalify/costs" className="btn btn-primary btn-wide">Get started</Link>
      <p className="center fine">Takes about 5 minutes. No credit impact.</p>
      <p className="center fine">Your information stays in this account.</p>
      <hr />
      <section className="q-card">
        <div className="q-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#0c4f86" />
            <path d="M10 13.5h12M10 17.5h8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2>Questions?</h2>
          <p>A person can walk the same numbers with you. Hours are Monday to Friday, 8am–6pm ET, and Saturday, 9am–1pm ET.</p>
          <Link to="/prequalify/account" className="btn btn-line">Create your account</Link>
        </div>
      </section>
      <p className="fine">The {usd(LISTING_ESTIMATE)} figure is an estimate for this home at 20% down. It is not a loan approval.</p>
    </Shell>
  );
}

export function PrequalCosts() {
  useTitle("What changes the cost — Stillwater");
  const { figures } = useAccount();
  return (
    <Shell
      step="1"
      title="What can change on this house"
      lede="Same four lines as the start page, filled in for 2120 Marquis Court."
    >
      <article className="panel slim">
        <h2>Property tax and HOA fees</h2>
        <p>2025 property tax is $10,592.51, about {usd(figures.parts.tax, 2)} a month. The public tax table lists a 2025 assessment of $658,570, and the listing facts also show a tax assessed value of $1,061,159. HOA fees are $0. There is no association and no deed restriction.</p>
      </article>
      <article className="panel slim">
        <h2>Homeowners insurance</h2>
        <p>The estimate carries an allowance of {usd(figures.parts.ins, 2)} a month so the payment can be read as a whole. The lot is flood zone AE, on a well and septic. A binder from an insurer can replace this allowance. Utilities are not included.</p>
      </article>
      <article className="panel slim">
        <h2>Down payment and closing costs</h2>
        <p>Pre-qualified funds are {usd(figures.prequalifiedCap)} toward this purchase. The down payment is {usd(figures.downPayment)}. Closing costs are estimated at 3%, {usd(CLOSING_COST)}. The remaining balance can be paid monthly until the down payment is complete.</p>
      </article>
      <article className="panel slim">
        <h2>Your monthly payment</h2>
        <p>Est. {usd(LISTING_ESTIMATE)}/mo at 20% down, 7.50%, and 30 years. That splits into principal and interest, the tax bill, and the insurance allowance. Mortgage insurance stays at zero while the down payment is at least 20%.</p>
      </article>
      <div className="btn-row">
        <Link to="/prequalify" className="btn btn-ghost">Back</Link>
        <Link to="/prequalify/funds" className="btn btn-primary">Set the down payment</Link>
      </div>
    </Shell>
  );
}

export function PrequalFunds() {
  useTitle("Pre-qualified funds — Stillwater");
  const { figures } = useAccount();
  return (
    <Shell
      step="2"
      title="Pre-qualified funds"
      lede={`These funds are ${usd(figures.prequalifiedCap)} toward this purchase. The down payment on the file is ${usd(figures.downPayment)}.`}
    >
      <div className="fund-readout">
        <span>Pre-qualified funds</span>
        <strong>{usd(figures.prequalifiedFunds)}</strong>
        <em>{usd(figures.prequalifiedCap)} toward this purchase</em>
      </div>
      <dl className="mini-stats">
        <div><dt>Down payment</dt><dd>{usd(figures.downPayment)}</dd></div>
        <div><dt>Balance to complete it</dt><dd>{usd(figures.remainingDown)}</dd></div>
        <div><dt>Loan amount</dt><dd>{usd(figures.loan)}</dd></div>
        <div><dt>Payment</dt><dd>{usd(figures.total)}/mo</dd></div>
      </dl>
      <p className="note">Deposits already received are counted here, up to {usd(figures.prequalifiedCap)}. The remaining balance can be paid monthly until the {usd(figures.downPayment)} down payment is complete. The {usd(LISTING_ESTIMATE)} listing figure is still the 20% estimate.</p>
      <div className="btn-row">
        <Link to="/prequalify/costs" className="btn btn-ghost">Back</Link>
        <Link to="/prequalify/monthly" className="btn btn-primary">See the monthly payment</Link>
      </div>
    </Shell>
  );
}

export function PrequalMonthly() {
  useTitle("Monthly payment — Stillwater");
  const { figures, signedIn } = useAccount();
  const rows = [
    ["Principal and interest", figures.parts.pi],
    ["Property tax", figures.parts.tax],
    ["Insurance allowance", figures.parts.ins],
    ["Mortgage insurance", figures.parts.pmi],
    ["HOA", 0],
  ];
  return (
    <Shell
      step="3"
      title="Your monthly payment"
      lede={`${usd(figures.downPayment)} down on Marquis Court, 30 years at 7.50%.`}
    >
      <div className="fund-readout">
        <span>Est.</span>
        <strong>{usd(Math.round(figures.total))}<i>/mo</i></strong>
        {Math.abs(figures.total - LISTING_ESTIMATE) > 1 && (
          <em>The listing estimate at 20% down is {usd(LISTING_ESTIMATE)}/mo.</em>
        )}
      </div>
      <div className="panel breakdown">
        {rows.map(([label, value]) => (
          <div className="row" key={label}>
            <strong>{label}</strong>
            <b>{usd(value, 2)}</b>
          </div>
        ))}
        <div className="breakdown-total">
          <span>Total</span>
          <strong>{usd(figures.total, 2)}</strong>
        </div>
      </div>
      <p className="fine">Down payment {usd(figures.plannedDown)} · loan {usd(figures.loan)} · closing costs {usd(CLOSING_COST)}. Utilities not included.</p>
      <div className="btn-row">
        <Link to="/prequalify/funds" className="btn btn-ghost">Back</Link>
        <Link to={signedIn ? "/prequalify/done" : "/prequalify/account"} className="btn btn-primary">
          {signedIn ? "Finish" : "Create your account"}
        </Link>
      </div>
    </Shell>
  );
}

export function PrequalDetails() {
  return <Navigate to="/prequalify/account" replace />;
}

export function BuyerAuthPage({ next = "/dashboard", step, backTo }) {
  useTitle(step ? "Create your account — Stillwater" : "Your account — Stillwater");
  const { signedIn, acceptBuyer } = useAccount();
  const navigate = useNavigate();
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (signedIn) {
    return <Navigate to={next} replace />;
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    let result;
    try {
      result = mode === "register"
        ? await registerBuyer({ name, email, password, confirm, phone })
        : await enterBuyer({ email, password });
    } catch {
      result = { ok: false, error: "The account could not be opened." };
    }
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    acceptBuyer(result.buyer);
    navigate(next);
  }

  const form = (
    <form className="stack-form" onSubmit={submit}>
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
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </label>
      )}
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
      </label>
      {mode === "register" && (
        <label>
          Phone, if you want a call back
          <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" />
        </label>
      )}
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
      {step ? (
        <div className="btn-row">
          <Link to={backTo || "/prequalify/monthly"} className="btn btn-ghost">Back</Link>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </div>
      ) : (
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
        </button>
      )}
    </form>
  );

  if (!step) {
    return (
      <main className="admin-shell">
        <header className="admin-bar">
          <Link to="/" className="brand-link">Stillwater</Link>
          <Link to="/prequalify">Pre-qualify</Link>
        </header>
        <section className="panel stack-form admin-card">
          <p className="eyebrow">Buyer</p>
          <h1>{mode === "register" ? "Create your account" : "Sign in"}</h1>
          <p>
            {mode === "register"
              ? "Your desk, funds, and payments stay on this account. Another buyer starts from a clean file."
              : "Sign in to open the desk that belongs to this email."}
          </p>
          {form}
        </section>
      </main>
    );
  }

  return (
    <Shell
      step={step}
      title={mode === "register" ? "Create your account" : "Sign in"}
      lede={mode === "register"
        ? "Your desk and pre-qualified funds stay on this account. Another person who registers gets their own file."
        : "Sign in to open the desk that belongs to this email."}
    >
      {form}
    </Shell>
  );
}

export function PrequalAccount() {
  return <BuyerAuthPage next="/prequalify/done" step="4" backTo="/prequalify/monthly" />;
}

export function AccountPage() {
  return <BuyerAuthPage next="/dashboard" />;
}

export function PrequalDone() {
  useTitle("Pre-qualified — Stillwater");
  const { figures, signedIn } = useAccount();
  const covered = figures.usdBalance + 0.01 >= figures.cashToClose;
  return (
    <Shell
      title={signedIn ? "Your funds are set" : "Create your account first"}
      lede={signedIn ? "Marquis Court is on your desk with a down payment and a monthly cost that belong to this account." : "Create an account so this file stays yours."}
    >
      <div className="done-grid">
        <div>
          <span>Pre-qualified funds</span>
          <strong>{usd(figures.prequalifiedCap)}</strong>
          <em>{usd(figures.prequalifiedFunds)} deposited · down payment {usd(figures.downPayment)}</em>
        </div>
        <div>
          <span>Est.</span>
          <strong>{usd(Math.round(figures.total))}<i>/mo</i></strong>
          <em>30 years · 7.50%</em>
        </div>
      </div>
      <p>
        {covered
          ? `Your balance of ${usd(figures.usdBalance)} can cover this down payment and the ${usd(figures.closing)} closing-cost estimate.`
          : `Your balance of ${usd(figures.usdBalance)} can pay part of the ${usd(figures.cashToClose)} still due for the down payment and closing costs.`}
      </p>
      <div className="btn-row">
        <Link to="/dashboard" className="btn btn-primary">Open your desk</Link>
        <Link to="/dashboard/pay" className="btn btn-line">Make a payment</Link>
      </div>
    </Shell>
  );
}
