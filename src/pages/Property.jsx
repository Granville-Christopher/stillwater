import { Link } from "react-router-dom";
import { EstCard, FactStrip, PropertyBody, useTitle } from "../components.jsx";
import { LISTING_ESTIMATE, PRICE, usd } from "../data.js";

export function PropertyPage() {
  useTitle("2120 Marquis Ct — Stillwater");
  return (
    <main className="wrap property-page">
      <header className="property-hero">
        <div>
          <p className="eyebrow">Single family · Active · New Port Richey</p>
          <h1>2120 Marquis Ct</h1>
          <p className="address">New Port Richey, FL 34655 · Cornett Woods · Pasco County</p>
          <p className="price">{usd(PRICE)}</p>
          <ul className="pills">
            <li>5 beds</li>
            <li>4 full baths, 1 half</li>
            <li>4,870 sq ft</li>
          </ul>
          <FactStrip />
          <p className="fine">Listed 148 days, since June 5, 2026.</p>
          <div className="hero-actions">
            <Link to="/prequalify" className="btn btn-primary">Get pre-qualified</Link>
            <Link to="/dashboard/property" className="btn btn-ghost">Open it on your desk</Link>
          </div>
        </div>
        <EstCard
          total={LISTING_ESTIMATE}
          to="/prequalify"
          action="Get pre-qualified"
          note="Estimate at 20% down. Taxes included. HOA $0. Insurance is an allowance until a flood quote exists."
        />
      </header>
      <PropertyBody />
    </main>
  );
}
