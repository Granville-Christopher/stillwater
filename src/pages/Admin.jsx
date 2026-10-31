import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDeposit,
  adminSessionOn,
  checkAdminService,
  enterAdmin,
  leaveAdmin,
  loadAdmin,
  RAIL_IDS,
  refreshDesk,
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
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState(loadAdmin);
  const [saved, setSaved] = useState(false);
  const [downInput, setDownInput] = useState(() => String(loadAdmin().downPayment));
  const [depositInput, setDepositInput] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [service, setService] = useState({ mongo: false, admin: false });

  useEffect(() => {
    checkAdminService().then(setService);
    refreshDesk().then((desk) => {
      setData(desk);
      setDownInput(String(desk.downPayment));
    });
    const refresh = () => setData(loadAdmin());
    window.addEventListener("stillwater-admin", refresh);
    return () => window.removeEventListener("stillwater-admin", refresh);
  }, []);

  async function unlock(event) {
    event.preventDefault();
    const result = await enterAdmin(code);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    setCode("");
    setOpen(true);
    const desk = await refreshDesk();
    setData(desk);
    setDownInput(String(desk.downPayment));
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
    const result = await addDeposit(depositInput);
    if (!result.ok) {
      setFileError(result.error);
      setFileNote("");
      return;
    }
    setDepositInput("");
    setFileError("");
    setFileNote("Added to pre-qualified funds. Buyers see the new balance.");
    setData(loadAdmin());
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
        <form className="panel stack-form admin-card" onSubmit={unlock}>
          <p className="eyebrow">Admin</p>
          <h1>Open the admin desk</h1>
          <p>Enter the admin code. The server checks ADMIN_CODE on each login.</p>
          <label>
            Admin code
            <input type="password" value={code} onChange={(event) => setCode(event.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary">Open</button>
        </form>
      ) : (
        <div className="admin-body">
          <div className="desk-head">
            <div>
              <p className="eyebrow">Admin</p>
              <h1>Payment details and purchases</h1>
              <p>Set the down payment and record money already deposited. Buyers also see the wire, cash mailing address, and coin addresses you save below.</p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => { leaveAdmin(); setOpen(false); }}>Lock</button>
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

          <form className="panel stack-form" onSubmit={recordDeposit}>
            <h2>Already deposited</h2>
            <p>This amount is added to pre-qualified funds. Those funds are {usd(PREQUAL_CAP)} and cannot go higher.</p>
            <div className="fund-readout">
              <span>Pre-qualified funds</span>
              <strong>{usd(data.deposited)}</strong>
              <em>{usd(Math.max(0, PREQUAL_CAP - data.deposited))} still fits under {usd(PREQUAL_CAP)}</em>
            </div>
            <label>
              Amount to add
              <input inputMode="decimal" value={depositInput} onChange={(event) => { setDepositInput(event.target.value); setFileNote(""); }} placeholder="0.00" />
            </label>
            <button type="submit" className="btn btn-primary">Add to pre-qualified funds</button>
            {data.deposits.length > 0 && (
              <ul className="rail-list">
                {data.deposits.map((deposit) => (
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
            <h2>People who paid</h2>
            {data.purchases.length === 0 ? (
              <p>No purchase has been recorded yet.</p>
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
                    {data.purchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{when(purchase.at)}</td>
                        <td>{purchase.name}{purchase.email ? ` · ${purchase.email}` : ""}</td>
                        <td>{usd(purchase.usd, 2)}</td>
                        <td>{purchase.coins.map((coin) => cryptoText(coin.asset, coin.cryptoAmount)).join(", ")}</td>
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
