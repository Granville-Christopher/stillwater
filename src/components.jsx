import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  LISTING_FACTS,
  PHOTOS,
  PRICE_HISTORY,
  SCHOOLS,
  TAX_HISTORY,
  SPEC_GROUPS,
  previewPhotos,
  usd,
} from "./data.js";

export function useTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function Logo({ light = false }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? "#d7ebf8" : "#0c4f86"} />
        <path d="M5 21c4.2-6.2 6.2-6.2 11 0s6.8 6.2 11 0" fill="none" stroke={light ? "#0c4f86" : "#d6ebf8"} strokeWidth="2" strokeLinecap="round" />
        <path d="M5 14c4.2-6.2 6.2-6.2 11 0s6.8 6.2 11 0" fill="none" stroke={light ? "#1574b8" : "#8ec4ea"} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>
        <strong>Stillwater</strong>
        <em>Buyer financing</em>
      </span>
    </span>
  );
}

export function SiteChrome() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand-link" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
          <nav className={open ? "nav-links open" : "nav-links"}>
            <Link to="/property" onClick={() => setOpen(false)}>The home</Link>
            <Link to="/#payment" onClick={() => setOpen(false)}>Monthly cost</Link>
            <Link to="/prequalify" onClick={() => setOpen(false)}>Pre-qualify</Link>
            <Link to="/dashboard" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
              Your desk
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <Footer />
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Logo light />
          <p>
            Stillwater is an independent desk for a buyer who has already chosen a home.
            It is not the listing brokerage, and a figure on this site is not a commitment to lend.
          </p>
        </div>
        <div>
          <h2>This file</h2>
          <Link to="/property">2120 Marquis Ct</Link>
          <Link to="/prequalify">Get pre-qualified</Link>
          <Link to="/dashboard">Your desk</Link>
          <Link to="/dashboard/pay">Pay</Link>
        </div>
        <div>
          <h2>Plain language</h2>
          <p>Estimates use public tax records, a 7.50% rate, and a 30-year term. Insurance in flood zone AE has to be quoted for real. Crypto payments spend the balance already on your desk. No seed phrase is ever requested.</p>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>2120 Marquis Ct, New Port Richey, FL 34655 · MLS W7886474</span>
        <span>Photos: listing gallery. One or more may be virtually staged.</span>
      </div>
    </footer>
  );
}

export function FactStrip() {
  return (
    <dl className="fact-strip">
      {LISTING_FACTS.map(([label, value, amountFirst]) => (
        <div key={label} className={amountFirst ? "amount-first" : undefined}>
          {amountFirst ? (
            <dd>{value} {label}</dd>
          ) : (
            <>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </>
          )}
        </div>
      ))}
    </dl>
  );
}

export function Gallery({ featured = false, preview = 0 }) {
  const [index, setIndex] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const shown = preview > 0 && !expanded ? previewPhotos(preview) : PHOTOS;
  const hidden = PHOTOS.length - shown.length;

  useEffect(() => {
    if (index === null) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % PHOTOS.length);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [index]);

  return (
    <>
      <div className={featured ? "mosaic" : "photo-grid"}>
        {shown.map((photo) => (
          <button
            key={photo.src}
            type="button"
            className={photo.plan ? "shot plan" : "shot"}
            onClick={() => setIndex(PHOTOS.findIndex((item) => item.src === photo.src))}
          >
            <img src={photo.src} alt={photo.alt} />
            <span>{photo.plan ? "Plan" : PHOTOS.findIndex((item) => item.src === photo.src) + 1}</span>
          </button>
        ))}
      </div>
      {hidden > 0 && (
        <button type="button" className="view-all" onClick={() => setExpanded(true)}>
          View all +{hidden} images
        </button>
      )}
      {expanded && preview > 0 && (
        <button type="button" className="view-all quiet" onClick={() => setExpanded(false)}>
          Show fewer
        </button>
      )}
      {index !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Listing photos" onClick={() => setIndex(null)}>
          <button type="button" className="lightbox-close" onClick={() => setIndex(null)}>Close</button>
          <button type="button" className="lightbox-nav prev" aria-label="Previous photo" onClick={(event) => { event.stopPropagation(); setIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length); }}>‹</button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img className={PHOTOS[index].plan ? "plan" : undefined} src={PHOTOS[index].src} alt={PHOTOS[index].alt} />
            <figcaption>Photo {index + 1} of {PHOTOS.length}</figcaption>
          </figure>
          <button type="button" className="lightbox-nav next" aria-label="Next photo" onClick={(event) => { event.stopPropagation(); setIndex((i) => (i + 1) % PHOTOS.length); }}>›</button>
        </div>
      )}
    </>
  );
}

export function Filmstrip() {
  const [index, setIndex] = useState(null);
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % PHOTOS.length);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <>
      <div className="film">
        {PHOTOS.map((photo, i) => (
          <button key={photo.src} type="button" className={photo.plan ? "plan" : undefined} onClick={() => setIndex(i)}>
            <img src={photo.src} alt={photo.alt} />
          </button>
        ))}
      </div>
      {index !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Listing photos" onClick={() => setIndex(null)}>
          <button type="button" className="lightbox-close" onClick={() => setIndex(null)}>Close</button>
          <button type="button" className="lightbox-nav prev" aria-label="Previous photo" onClick={(event) => { event.stopPropagation(); setIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length); }}>‹</button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img className={PHOTOS[index].plan ? "plan" : undefined} src={PHOTOS[index].src} alt={PHOTOS[index].alt} />
            <figcaption>Photo {index + 1} of {PHOTOS.length}</figcaption>
          </figure>
          <button type="button" className="lightbox-nav next" aria-label="Next photo" onClick={(event) => { event.stopPropagation(); setIndex((i) => (i + 1) % PHOTOS.length); }}>›</button>
        </div>
      )}
    </>
  );
}

export function PriceHistory() {
  const peak = Math.max(...PRICE_HISTORY.map(([, , amount]) => amount || 0));
  return (
    <ol className="history">
      {PRICE_HISTORY.map(([date, label, amount]) => (
        <li key={`${date}-${label}`}>
          <div>
            <strong>{amount == null ? "—" : usd(amount)}</strong>
            <span>{label} · {date}</span>
          </div>
          <div className="history-track" aria-hidden="true">
            <i style={{ width: `${amount ? (amount / peak) * 100 : 0}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TaxHistory() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Property tax</th>
            <th>Assessment</th>
          </tr>
        </thead>
        <tbody>
          {TAX_HISTORY.map(([year, tax, assessment]) => (
            <tr key={year}>
              <td>{year}</td>
              <td>{tax == null ? "—" : usd(tax)}</td>
              <td>{usd(assessment)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="fine">Public tax history. The monthly estimate still uses the $10,592.51 bill. The listing facts also show a tax assessed value of $1,061,159.</p>
    </div>
  );
}

export function SchoolTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>School</th>
            <th>Grades</th>
            <th>Distance</th>
            <th>Address</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {SCHOOLS.map(([name, grades, distance, address, score]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{grades}</td>
              <td>{distance}</td>
              <td>{address}</td>
              <td>{score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="fine">Pasco County schools. Distances and scores are the ones on the listing. They are a comparison, not an enrollment promise.</p>
    </div>
  );
}

export function Specs() {
  return (
    <div className="spec-grid">
      {SPEC_GROUPS.map((group) => (
        <section key={group.title} className="panel">
          <h3>{group.title}</h3>
          <dl>
            {group.rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function HouseStory() {
  return (
    <div className="story">
      <p>
        Marquis Court is a cul-de-sac in Cornett Woods. The house was built in 1984, it is not new construction, and it has been renovated since: a 2021 roof, a 2020 air conditioner, hurricane-impact windows and doors, luxury vinyl and tile, remodeled bathrooms, quartz counters, and shaker cabinets. Ceiling fans and sliding doors are throughout. Cathedral ceilings have exposed beams.
      </p>
      <p>
        The plan is five bedrooms and four and a half baths, with two primary suites and an in-law suite that has its own entrance, living room, kitchen, bedroom, and bath. Fifteen rooms in all, two wood-burning fireplaces, and cathedral ceilings with exposed beams. A 2021 tankless water heater serves the house.
      </p>
      <p>
        Outside, about 3,000 square feet is screened around an in-ground saltwater pool with commercial-grade equipment, covered seating, and a fire pit. The garage holds four cars and there is uncovered parking. RV parking has a 50-amp hookup. There is no HOA, the HOA fee is $0, the pet fee is $0, and there is no deed restriction. Water is a well, waste is septic, and cable and electric are connected. The lot is landscaped, zoned ER, and in FEMA flood zone AE, so flood insurance is required before anyone treats $6,698 as final. The whole structure is 6,694 square feet. The house has been on the market since June 5, 2026, 148 days as of October 31.
      </p>
      <p className="fine">
        The house is unfurnished. One or more listing photos are virtually staged, so furniture in a photo may not be in the house. A virtual tour is part of the listing. Listed by Nicholas Vavoulis at Re/Max Marketing Specialists, 727-234-3743, Stellar MLS W7886474. The listing was updated October 15, 2026. Last public sale was $567,000 on July 21, 2020. Earlier sales were $275,700 on May 24, 2018 and $265,000 on August 30, 2000.
      </p>
    </div>
  );
}

export function PropertyBody() {
  return (
    <div className="property-body">
      <HouseStory />
      <h2>All 52 photos</h2>
      <p className="section-lead">The full listing gallery, in order. Select any photo to open it.</p>
      <Gallery featured />
      <h2>Facts on the house</h2>
      <Specs />
      <div className="split split-start">
        <section>
          <h2>Schools nearby</h2>
          <SchoolTable />
        </section>
        <section>
          <h2>Price history</h2>
          <PriceHistory />
          <h2>Public tax history</h2>
          <TaxHistory />
        </section>
      </div>
      <p className="fine">
        Directions from the listing: Seven Springs Blvd, west on Morningsun Ct, right on Marquis Ct.{" "}
        <a href="https://www.google.com/maps/search/?api=1&query=2120+Marquis+Ct+New+Port+Richey+FL+34655" target="_blank" rel="noreferrer">Open the address on a map</a>.
      </p>
    </div>
  );
}

export function CheckList({ items }) {
  return (
    <ul className="checks">
      {items.map((item) => (
        <li key={item}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="10" fill="#d7ebf8" />
            <path d="M5.5 10.2 8.4 13.1 14.5 6.8" fill="none" stroke="#0c4f86" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Meter({ label, value, max, note }) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="meter">
      <div className="meter-top">
        <span>{label}</span>
        <strong>{note}</strong>
      </div>
      <div className="meter-track" role="meter" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EstCard({ total, to, action, note }) {
  return (
    <aside className="est-card">
      <p>Est.</p>
      <strong>{usd(Math.round(total))}<span>/mo</span></strong>
      <Link to={to} className="btn btn-primary">{action}</Link>
      <small>{note}</small>
    </aside>
  );
}
