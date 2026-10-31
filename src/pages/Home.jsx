import { Link } from "react-router-dom";
import {
  EstCard,
  FactStrip,
  Gallery,
  PriceHistory,
  SchoolTable,
  TaxHistory,
  useTitle,
} from "../components.jsx";
import { buildFigures, CLOSING_COST, freshAccount, LISTING_ESTIMATE, PRICE, usd } from "../data.js";

const published = buildFigures(freshAccount());

export function HomePage() {
  useTitle("Stillwater — 2120 Marquis Court");

  return (
    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">Selected home · Cornett Woods</p>
          <h1>Finish buying 2120 Marquis Court.</h1>
          <p className="lede">
            A five-bedroom house on 1.46 acres in New Port Richey, already chosen.
            Stillwater holds the monthly cost, the down payment, and the crypto already in your balance.
          </p>
          <div className="hero-actions">
            <Link to="/prequalify" className="btn btn-primary">Get pre-qualified</Link>
            <Link to="/property" className="btn btn-ghost">View the house</Link>
          </div>
          <dl className="hero-points">
            <div><dt>List price</dt><dd>{usd(PRICE)}</dd></div>
            <div><dt>House</dt><dd>5 bd · 4.5 ba</dd></div>
            <div><dt>Living area</dt><dd>4,870 sq ft</dd></div>
            <div><dt>Lot</dt><dd>1.46 acres</dd></div>
          </dl>
        </div>
        <div className="hero-frame">
          <img src="/photos/01.webp" alt="Front of 2120 Marquis Court at dusk, stone and blue siding under palms" />
          <EstCard
            total={LISTING_ESTIMATE}
            to="/prequalify"
            action="Get pre-qualified"
            note="20% down · 30 years at 7.50% · tax and insurance included · HOA $0"
          />
        </div>
      </section>

      <section className="ribbon facts">
        <div className="wrap">
          <FactStrip />
          <p className="fine">The house has been listed since June 5, 2026.</p>
        </div>
      </section>

      <section className="ribbon">
        <div className="wrap ribbon-row">
          <span><b>2025 tax</b> $10,593</span>
          <span><b>Flood zone</b> AE</span>
          <span><b>Garage</b> 4 cars</span>
          <span><b>Pool</b> Saltwater, screened</span>
          <span><b>Water</b> Well and septic</span>
        </div>
      </section>

      <section className="section wrap" id="house">
        <div className="section-head">
          <p className="eyebrow">The house</p>
          <h2>Private acreage, two primary suites, and a pool under screen.</h2>
        </div>
        <div className="split">
          <div className="story">
            <p>
              Marquis Court sits on a quiet cul-de-sac in Cornett Woods, next to a bird sanctuary. The 1984 house has been updated with a 2021 roof, 2020 air conditioning, hurricane-impact windows and doors, and a kitchen finished in quartz and shaker cabinets.
            </p>
            <p>
              Inside: five bedrooms, four full baths, one half bath, two wood-burning fireplaces, and an in-law suite with a private entrance. Outside: about 3,000 square feet of screen, an in-ground saltwater pool, and a four-car garage with RV parking.
            </p>
            <p className="fine">Listed at {usd(PRICE)} · $200 per square foot · MLS W7886474 · Re/Max Marketing Specialists. The house is unfurnished. Some photos are virtually staged.</p>
            <Link to="/property" className="text-link">All facts, schools, and price history</Link>
          </div>
          <div className="pair">
            <figure>
              <img src="/photos/20.webp" alt="Great room with a stone fireplace, spiral stair, and doors toward the pool" />
              <figcaption>Great room, opening toward the pool</figcaption>
            </figure>
            <figure>
              <img src="/photos/36.webp" alt="Screened saltwater pool and covered patio at 2120 Marquis Court" />
              <figcaption>Screened saltwater pool</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section wrap" id="gallery">
        <div className="section-head">
          <p className="eyebrow">Gallery</p>
          <h2>Photos of the house.</h2>
          <p className="section-lead">Eight to start, including the floor plan. Furnishings in a staged photo may not come with the house.</p>
        </div>
        <Gallery featured preview={8} />
      </section>

      <section className="section wrap" id="payment">
        <div className="section-head">
          <p className="eyebrow">Monthly cost</p>
          <h2>Est. {usd(LISTING_ESTIMATE)} a month at 20% down.</h2>
          <p className="section-lead">
            This is the published estimate for this house, rebuilt from the price, the 2025 tax bill, and an insurance allowance. Utilities are not included. Your own number updates if you change the down payment.
          </p>
        </div>
        <div className="pay-layout">
          <div className="panel breakdown">
            <Row label="Principal and interest" value={published.parts.pi} hint="30-year fixed at 7.50% after a 20% down payment" />
            <Row label="Property tax" value={published.parts.tax} hint="$10,592.51 for 2025, spread across the year" />
            <Row label="Home insurance allowance" value={published.parts.ins} hint="The piece that makes the estimate add to $6,698. Flood zone AE can move a real quote." />
            <Row label="Mortgage insurance" value={published.parts.pmi} hint="None at 20% down" />
            <Row label="HOA" value={0} hint="No association fee" />
            <div className="breakdown-total">
              <span>Estimated payment</span>
              <strong>{usd(published.total, 2)}/mo</strong>
            </div>
          </div>
          <aside className="panel aside-note">
            <p className="eyebrow">At 20% down</p>
            <h3>{usd(LISTING_ESTIMATE)}/mo</h3>
            <p>The down payment at 20% is {usd(published.plannedDown)}. Estimated closing costs are {usd(CLOSING_COST)}. Cash to finish those two is {usd(published.plannedDown + CLOSING_COST)}.</p>
            <Link to="/prequalify" className="btn btn-primary">Get pre-qualified</Link>
            <Link to="/dashboard" className="btn btn-line">See it on your desk</Link>
          </aside>
        </div>
      </section>

      <section className="section wrap" id="funds">
        <div className="section-head">
          <p className="eyebrow">Pre-qualified funds</p>
          <h2>Pre-qualified funds are {usd(250000)} toward this purchase.</h2>
        </div>
        <div className="three">
          <article className="panel">
            <h3>What it is</h3>
            <p>Pre-qualified funds on this house are {usd(250000)}. That is the amount already approved toward the purchase.</p>
          </article>
          <article className="panel">
            <h3>The down payment</h3>
            <p>The down payment on this house is {usd(700000)}. Funds already on the file count toward it. The remainder is the balance still due.</p>
          </article>
          <article className="panel">
            <h3>Monthly payments</h3>
            <p>That remaining balance can be paid monthly until the down payment is complete. Closing costs stay beside it, estimated at {usd(CLOSING_COST)}.</p>
          </article>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <p className="eyebrow">The path</p>
          <h2>Four steps from the listing to a funded down payment.</h2>
        </div>
        <ol className="steps">
          <li><span>01</span><h3>Keep the house in view</h3><p>Address, photos, tax, flood zone, and the $6,698 estimate stay attached to your file.</p></li>
          <li><span>02</span><h3>Get pre-qualified</h3><p>About five minutes. Pre-qualified funds are $250,000 toward this purchase. The down payment on the file is $700,000.</p></li>
          <li><span>03</span><h3>Read your monthly cost</h3><p>Principal, tax, insurance allowance, and mortgage insurance if the down payment is under 20%.</p></li>
          <li><span>04</span><h3>Pay from crypto you hold</h3><p>USDC, Bitcoin, or Ethereum already on the desk. The ledger records where each dollar went.</p></li>
        </ol>
      </section>

      <section className="section band">
        <div className="wrap split">
          <div>
            <p className="eyebrow">Balance already on the desk</p>
            <h2>Pay the down payment without leaving the account.</h2>
            <p className="section-lead">Quotes used to value the coins are from {`October 31, 2026`}: Bitcoin at $77,369 and Ethereum at $2,244.92. USD Coin is one dollar. Nothing asks for a seed phrase, and nothing is sent to an outside wallet.</p>
            <Link to="/dashboard/balance" className="btn btn-primary">Open your balance</Link>
          </div>
          <div className="coin-list">
            <div><b>USDC</b><span>Stable dollars, ready to apply</span></div>
            <div><b>BTC</b><span>Valued at the quoted dollar rate</span></div>
            <div><b>ETH</b><span>Valued at the quoted dollar rate</span></div>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <p className="eyebrow">Around the house</p>
          <h2>Schools, taxes, and how the asking price got here.</h2>
        </div>
        <div className="split split-start">
          <div className="column-stack">
            <SchoolTable />
            <h3>Public tax history</h3>
            <TaxHistory />
          </div>
          <div>
            <PriceHistory />
            <p className="fine">The June 5 ask was $1,290,000. The October 15 ask is $974,900, which is $315,100 lower. The 2025 tax assessment on the public table is $658,570. The listing facts also show a tax assessed value of $1,061,159.</p>
          </div>
        </div>
      </section>

      <section className="section wrap" id="questions">
        <div className="section-head">
          <p className="eyebrow">Questions</p>
          <h2>Before you treat the estimate as a payment.</h2>
        </div>
        <div className="faq">
          <details open>
            <summary>Is $6,698 the payment I will actually have?</summary>
            <p>It is the estimate at 20% down, 7.50%, and 30 years, with 2025 taxes and an insurance allowance included. A lender rate, a flood quote, or a different down payment will change it. Utilities are not in the number.</p>
          </details>
          <details>
            <summary>What are pre-qualified funds?</summary>
            <p>They are $250,000 toward this purchase. The down payment is $700,000. The remaining balance can be paid monthly until that amount is complete.</p>
          </details>
          <details>
            <summary>Does this check my credit?</summary>
            <p>No. Walking through the estimate does not pull credit and is not an approval.</p>
          </details>
          <details>
            <summary>How does crypto payment work?</summary>
            <p>You spend USDC, Bitcoin, or Ethereum that is already on the desk. The payment lands on the down payment first, then estimated closing costs, then extra principal. It is recorded in your activity.</p>
          </details>
          <details>
            <summary>Is there an HOA?</summary>
            <p>No. The listing shows no association and no deed restriction. That line on the estimate stays at zero.</p>
          </details>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <p className="eyebrow">2120 Marquis Ct</p>
          <h2>Get clear on the cost, then fund the down payment.</h2>
          <div className="hero-actions">
            <Link to="/prequalify" className="btn btn-primary">Get pre-qualified</Link>
            <Link to="/dashboard" className="btn btn-ghost light">Go to your desk</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value, hint }) {
  return (
    <div className="row">
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <b>{usd(value, 2)}</b>
    </div>
  );
}

export function MissingPage() {
  useTitle("Stillwater");
  return (
    <main className="wrap missing">
      <p className="eyebrow">Missing page</p>
      <h1>That page is not on this desk.</h1>
      <Link to="/" className="btn btn-primary">Back to Marquis Court</Link>
    </main>
  );
}
