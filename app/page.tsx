"use client";

import { useMemo, useState } from "react";
import discoveryData from "./data/publicDiscovery.json";

type Listing = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  city: string;
  neighborhood: string;
  rating: string;
  reviews: string;
  image: string;
  badge?: string;
  phone?: string;
  hours: string;
  description: string;
  color: string;
};

const categories = [
  ["🍽️", "Restaurants", "1,240 places"],
  ["🏨", "Hotels & stays", "380 places"],
  ["💆", "Beauty & wellness", "620 places"],
  ["🛍️", "Shopping", "2,100 places"],
  ["🎵", "Nightlife", "190 places"],
  ["🩺", "Health & medical", "540 places"],
  ["🚗", "Automotive", "760 places"],
  ["💼", "Professional services", "1,080 places"],
];

const listings: Listing[] = [
  { name: "Habesha 2000 Restaurant", category: "Restaurants", city: "Addis Ababa", neighborhood: "Bole", rating: "4.8", reviews: "128", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85", badge: "Top rated", phone: "+251 911 234 567", hours: "Open until 11:00 PM", description: "Modern Ethiopian dining, coffee ceremony and live music in the heart of Bole.", color: "sage" },
  { name: "Kuriftu Resort & Spa", category: "Hotels & stays", city: "Bishoftu", neighborhood: "Lake Bishoftu", rating: "4.7", reviews: "94", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85", badge: "Featured", phone: "+251 116 676 767", hours: "Open 24 hours", description: "A peaceful lakeside escape with spa treatments, dining and unforgettable views.", color: "gold" },
  { name: "Shoa Shopping Center", category: "Shopping", city: "Adama", neighborhood: "Kebele 14", rating: "4.5", reviews: "61", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=85", phone: "+251 922 345 678", hours: "Open until 8:00 PM", description: "Everyday essentials, fashion and local brands under one roof.", color: "terracotta" },
  { name: "Zanzibar Lounge", category: "Nightlife", city: "Hawassa", neighborhood: "Tabor", rating: "4.6", reviews: "47", image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=900&q=85", badge: "Popular", phone: "+251 933 456 789", hours: "Open until 2:00 AM", description: "Cocktails, DJs and a vibrant late-night atmosphere by the lake.", color: "plum" },
];

const cities = ["Addis Ababa", "Bishoftu", "Hawassa", "Adama", "Dire Dawa", "Mekelle"];

const liveRecords = discoveryData as Array<Record<string, string>>;
const isBusinessRecord = (item: Record<string, string>) => {
  const title = `${item.name || ""} ${item.category || ""}`.toLowerCase().trim();
  return title && !/companies? in ethiopia|businesses in ethiopia|exporters? .*(companies|supplier)|supplier companies|contact us|^2merkato$|^engocha ethiopian marketplace$/.test(title);
};
const classifyCategory = (item: Record<string, string>) => {
  const exactCategories = ["Restaurants", "Hotels & stays", "Shopping", "Manufacturers", "Real estate", "Agriculture", "Electronics", "Wholesale", "Repair services", "Pet care", "Law & attorneys", "Plumbing", "Health & medical", "Professional services", "Education", "Finance & insurance", "Travel & tourism", "Nightlife", "Beauty & wellness", "Automotive", "Construction", "Government services"];
  if (exactCategories.includes(item.category || "")) return item.category;
  const text = `${item.name || ""} ${item.category || ""} ${item.subcategory || ""} ${item.description || ""}`.toLowerCase();
  if (/restaurant|cafe|coffee|hotel|resort|lodge|guest house/.test(text)) return /hotel|resort|lodge|guest house/.test(text) ? "Hotels & stays" : "Restaurants";
  if (/law|attorney|legal/.test(text)) return "Law & attorneys";
  if (/plumb|pipe|water system/.test(text)) return "Plumbing";
  if (/agric|farm|fertiliz|seed|livestock|animal feed|coffee|grain|flower|dairy/.test(text)) return "Agriculture";
  if (/manufactur|factory|industrial|aluminium|chemical|building material/.test(text)) return "Manufacturers";
  if (/electronic|computer|mobile|telecom/.test(text)) return "Electronics";
  if (/wholesale|supplier|distributor|exporter|importer/.test(text)) return "Wholesale";
  if (/repair|maintenance|service center/.test(text)) return "Repair services";
  if (/medical|hospital|clinic|pharmacy|health/.test(text)) return "Health & medical";
  if (/school|education|college|university|training/.test(text)) return "Education";
  if (/real estate|property|house for sale|rent/.test(text)) return "Real estate";
  if (/beauty|cosmetic|salon|spa/.test(text)) return "Beauty & wellness";
  if (/travel|tour|hotel|ticket|car rental/.test(text)) return "Travel & tourism";
  return item.category || "Professional services";
};
const liveListings: Listing[] = liveRecords.filter(isBusinessRecord).map((item, index) => ({
  id: item.external_id || `${item.source || "source"}-${index}`,
  name: item.name,
  category: classifyCategory(item),
  subcategory: item.subcategory || "",
  city: item.city,
  neighborhood: item.neighborhood || item.address || "Ethiopia",
  rating: item.rating || "",
  reviews: item.review_count || "",
  image: item.image_url_1 || "",
  badge: item.source === "OpenStreetMap" ? "Open data" : "Draft listing",
  phone: item.phone || "",
  hours: item.opening_hours || "",
  description: item.description || `${item.subcategory || item.category} in ${item.city}.`,
  color: ["sage", "gold", "terracotta", "plum"][index % 4],
  website: item.website || "",
  source: item.source || "Public source",
}));
const liveCategoryIcons: Record<string, string> = { Restaurants: "restaurant", "Hotels & stays": "hotel", Shopping: "shopping", Manufacturers: "factory", "Real estate": "home", Agriculture: "leaf", Electronics: "laptop", Wholesale: "box", "Repair services": "wrench", "Pet care": "paw", "Law & attorneys": "scale", Plumbing: "pipe", "Health & medical": "health", "Professional services": "briefcase", Education: "education", "Finance & insurance": "finance", "Travel & tourism": "compass", Nightlife: "nightlife", "Beauty & wellness": "beauty", Automotive: "automotive", Construction: "construction", "Government services": "government" };
const agricultureSubcategories = Array.from(new Set(liveRecords
  .filter((item) => /agric|dairy|animal feed|coffee|flower|fruit|vegetable|fertilizer|seed/i.test(`${item.name} ${item.category}`))
  .map((item) => (item.category || item.name).replace(/^Exporters\s+/i, "").replace(/\s+Companies.*$/i, "").trim())
  .filter((item) => item && item.length < 70))).slice(0, 18);
const categorySubcategories = Object.fromEntries(Object.keys(liveCategoryIcons).map((name) => [name, Array.from(new Set(liveListings.filter((item) => item.category === name && item.subcategory).map((item) => item.subcategory))).sort()]));
const liveCategories = Object.keys(liveCategoryIcons).map((name) => [liveCategoryIcons[name], name, `${liveListings.filter((item) => item.category === name).length} places`]);
const liveCities = Array.from(new Set(["All Ethiopia", ...liveListings.map((item) => item.city).filter(Boolean)])).slice(0, 11);
const featuredListings = [...liveListings.filter((item) => item.image), ...liveListings.filter((item) => !item.image)].slice(0, 3);
const translations: Record<string, Record<string, string>> = { EN: { explore: "Explore", categories: "Categories", cities: "Cities", about: "About us", find: "Find your place.", search: "Search restaurants, hotels, salons...", popular: "Popular:", all: "All places" }, "አማ": { explore: "ያስሱ", categories: "ምድቦች", cities: "ከተሞች", about: "ስለ እኛ", find: "ቦታዎን ያግኙ።", search: "ምግብ ቤቶችን እና ሆቴሎችን ይፈልጉ...", popular: "ታዋቂ:", all: "ሁሉም ቦታዎች" }, OM: { explore: "Sakatta'i", categories: "Ramaddii", cities: "Magaalota", about: "Waa'ee keenya", find: "Bakka kee argadhu.", search: "Mana nyaataa fi hoteela barbaadi...", popular: "Beekamaa:", all: "Bakkoota hunda" }, عربي: { explore: "استكشف", categories: "الفئات", cities: "المدن", about: "من نحن", find: "اعثر على مكانك.", search: "ابحث عن المطاعم والفنادق...", popular: "شائع:", all: "كل الأماكن" }, 中文: { explore: "探索", categories: "类别", cities: "城市", about: "关于我们", find: "找到你的地方。", search: "搜索餐厅和酒店...", popular: "热门:", all: "所有地点" } };

export default function Home() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All Ethiopia");
  const [activeCategory, setActiveCategory] = useState("All");
  const [language, setLanguage] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = (key: string) => translations[language]?.[key] || translations.EN[key] || key;

  const filtered = useMemo(() => liveListings.filter((item) => {
    const searchable = `${item.name} ${item.category} ${item.subcategory} ${item.city} ${item.neighborhood}`.toLowerCase();
    const normalizedCity = (item.city || "").toLowerCase().replace(/\s*\/\s*(awassa|nazreth|gondar|bishoftu)/g, "").trim();
    const selectedCity = city.toLowerCase().replace(/\s*\/\s*(awassa|nazreth|gondar|bishoftu)/g, "").trim();
    return (!query || searchable.includes(query.toLowerCase())) &&
      (city === "All Ethiopia" || normalizedCity === selectedCity || (selectedCity === "addis ababa" && /addis|shegar|shaggar|mercato/i.test(item.city || ""))) &&
      (activeCategory === "All" || item.category === activeCategory);
  }), [query, city, activeCategory]);
  const showAgricultureSubcategories = activeCategory === "Agriculture" && agricultureSubcategories.length > 0;

  const runSearch = (event: React.FormEvent) => { event.preventDefault(); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <main className="site-shell">
      <div className="announcement"><span>✦</span> Discover Ethiopia, one local business at a time <a href="#featured">Explore featured places →</a></div>
      <header className="nav-wrap">
        <nav className="nav container">
          <a className="brand" href="#top" aria-label="EthioPages home"><span className="brand-mark">E</span><span>Ethio<span>Pages</span></span></a>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            <a href="#explore">{t("explore")}</a><a href="#categories">{t("categories")}</a><a href="#cities">{t("cities")}</a><a href="#about">{t("about")}</a>
          </div>
          <div className="nav-actions"><select aria-label="Choose language" value={language} onChange={(e) => setLanguage(e.target.value)}><option>EN</option><option>አማ</option><option>OM</option><option>عربي</option><option>中文</option></select><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">☰</button></div>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="container hero-inner">
          <div className="eyebrow"><span className="eyebrow-dot" /> Ethiopia&apos;s local guide</div>
          <h1>Find your <em>people.</em><br />{t("find")}</h1>
          <p className="hero-copy">The trusted directory for discovering the businesses, services and experiences that make Ethiopia extraordinary.</p>
          <form className="search-bar" onSubmit={runSearch}>
            <span className="search-icon">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search restaurants, hotels, salons..." aria-label="Search businesses" /><span className="search-divider" /><span className="pin-icon">⌖</span><select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Choose a city">{liveCities.map((item) => <option key={item}>{item}</option>)}</select><button type="submit">Search</button>
          </form>
          <div className="popular"><span>{t("popular")}</span>{["Restaurants", "Hotels & stays", "Shopping", "Health & medical"].map((item) => <button key={item} onClick={() => { setActiveCategory(item); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>{item}</button>)}</div>
          <div className="hero-proof"><div className="avatar-stack"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div><span><strong>Explore Ethiopia</strong> <b>·</b> <strong>Directory coming soon</strong></span></div>
        </div>
      </section>

      <section className="section container" id="categories"><div className="section-heading"><div><span className="kicker">Browse by interest</span><h2>What are you looking for?</h2></div><a className="text-link" href="#explore">View all categories <span>↗</span></a></div><div className="category-grid">{liveCategories.map(([icon, name, count]) => <button className="category-card" key={name} onClick={() => { setActiveCategory(name); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}><span className="category-icon"><CategoryIcon name={String(icon)} /></span><span className="category-name">{name}</span><span className="category-count">{count}</span><span className="category-arrow">↗</span></button>)}</div>{activeCategory !== "All" && (categorySubcategories[activeCategory] || []).length > 0 && <div className="subcategory-panel"><span className="kicker">{activeCategory} directory</span><h3>Browse by subcategory</h3><div className="subcategory-list">{categorySubcategories[activeCategory].map((item) => <button key={item} onClick={() => { setQuery(item); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}>{item} <span>↗</span></button>)}</div></div>}</section>

      <section className="featured-band" id="featured"><div className="container"><div className="section-heading light"><div><span className="kicker">Public-source discovery test</span><h2>Places worth knowing.</h2></div><a className="text-link" href="#explore">See all places <span>↗</span></a></div><div className="listing-grid">{featuredListings.map((item) => <ListingCard item={item} key={item.id} />)}</div></div></section>

      <section className="section container explore-section" id="explore"><div className="section-heading"><div><span className="kicker">Explore the directory</span><h2>{activeCategory === "All" ? "Popular near you" : activeCategory}</h2></div><div className="filter-row"><button className={`filter ${activeCategory === "All" ? "selected" : ""}`} onClick={() => setActiveCategory("All")}>All places</button><button className="filter" onClick={() => setActiveCategory("Restaurants")}>Open now <span>⌄</span></button></div></div>{filtered.length ? <><div className="result-note">Showing {Math.min(filtered.length, 120)} of {filtered.length} imported draft listings</div><div className="listing-grid">{filtered.slice(0, 120).map((item) => <ListingCard item={item} key={item.id} />)}</div></> : showAgricultureSubcategories ? <div className="subcategory-panel"><span className="kicker">Agriculture directory</span><h3>Select an agricultural sector</h3><p>These are source categories awaiting individual business listings.</p><div className="subcategory-list">{agricultureSubcategories.map((item) => <button key={item} onClick={() => setQuery(item)}>{item} <span>↗</span></button>)}</div></div> : <div className="empty-state"><span>⌕</span><h3>No places found</h3><p>Try a different search or city.</p><button onClick={() => { setQuery(""); setCity("All Ethiopia"); setActiveCategory("All"); }}>Clear filters</button></div>}</section>

      <section className="city-section" id="cities"><div className="container city-inner"><div><span className="kicker">Everywhere you go</span><h2>Explore Ethiopia<br /><em>your way.</em></h2><p>From the energy of Addis to lakeside Hawassa, find the local places that make every city feel like home.</p><a className="dark-link" href="#explore">Explore all cities <span>↗</span></a></div><div className="city-list">{liveCities.filter((item) => item !== "All Ethiopia").slice(0, 6).map((item, index) => <button key={item} onClick={() => { setCity(item); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}><span>0{index + 1}</span><strong>{item}</strong><i>↗</i></button>)}</div></div></section>

      <section className="owner-cta" id="about"><div className="container owner-inner"><div><span className="kicker">Own a business?</span><h2>Be where Ethiopia<br /><em>is looking.</em></h2></div><div><p>Claim your listing, share what makes you special, and connect with more customers every day.</p><a className="cta-button" href="mailto:hello@ethiopages.com">List your business <span>↗</span></a></div></div></section>

      <footer><div className="container footer-top"><a className="brand footer-brand" href="#top"><span className="brand-mark">E</span><span>Ethio<span>Pages</span></span></a><p>Ethiopia, made discoverable.</p><div className="footer-links"><a href="#about">About</a><a href="#cities">Cities</a><a href="mailto:hello@ethiopages.com">Contact</a><a href="#">Privacy</a></div></div><div className="container footer-bottom"><span>© 2025 EthioPages. Built for Ethiopia.</span><span>Want to be shown first? <a href="https://t.me/EthioPages" target="_blank" rel="noreferrer">Contact us on Telegram <b>@EthioPages</b> ↗</a></span></div></footer>
    </main>
  );
}

function ListingCard({ item }: { item: Listing }) {
  return <article className="listing-card"><div className={`listing-image ${item.image ? "" : "no-photo"}`}>{item.image ? <img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.classList.add("no-photo"); }} /> : <span className="no-photo-label">No source photo</span>}<span className={`image-tag ${item.color}`}>{item.badge || "Verified"}</span><button className="save-button" aria-label={`Save ${item.name}`}>♡</button></div><div className="listing-body"><div className="listing-meta"><span>{item.category}</span><span>·</span><span>{item.city}</span></div><h3>{item.name}</h3><p>{item.description}</p><div className="listing-rating"><strong>{item.rating ? `★ ${item.rating}` : "Draft listing"}</strong><span>{item.reviews ? `(${item.reviews} reviews)` : "Public source"}</span><span className="open-status">● {item.hours || "Hours unavailable"}</span></div><div className="listing-footer"><span>⌖ {item.neighborhood}</span><a href={item.website || `tel:${item.phone || ""}`} target={item.website ? "_blank" : undefined} rel={item.website ? "noreferrer" : undefined}>View details <span>↗</span></a></div></div></article>;
}

function CategoryIcon({ name }: { name: string }) {
  const common = { width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<string, React.ReactNode> = {
    restaurant: <><path d="M5 3v8"/><path d="M3 3v5a2 2 0 0 0 4 0V3"/><path d="M5 11v10"/><path d="M16 3v18"/><path d="M16 3c3 2 3 6 0 8"/></>,
    hotel: <><path d="M3 20V5l9-2 9 2v15"/><path d="M3 10h18"/><path d="M7 7h2"/><path d="M15 7h2"/><path d="M7 14h2v3H7z"/><path d="M15 14h2v3h-2z"/></>,
    shopping: <><path d="M3 9h18l-2 11H5L3 9Z"/><path d="M8 9a4 4 0 0 1 8 0"/></>,
    factory: <><path d="M3 21V8l7 4V8l7 4V5h4v16"/><path d="M3 21h18"/><path d="M7 17h2"/><path d="M13 17h2"/></>,
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/></>,
    leaf: <><path d="M20 4C10 4 4 9 4 17c0 2 1 3 3 3 8 0 13-6 13-16Z"/><path d="M4 20c3-5 7-8 12-10"/></>,
    laptop: <><rect x="5" y="4" width="14" height="11" rx="1"/><path d="M3 19h18"/><path d="M8 19l1-2h6l1 2"/></>,
    box: <><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z"/><path d="M12 11v10"/></>,
    wrench: <><path d="m14 6 4-3 3 3-3 4"/><path d="m13 7-9 9a2 2 0 1 0 3 3l9-9"/><path d="m16 13 5 5"/></>,
    paw: <><circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="5" cy="14" r="2"/><circle cx="19" cy="14" r="2"/><path d="M12 12c-4 0-6 3-5 6 1 2 3 1 5 0 2 1 4 2 5 0 1-3-1-6-5-6Z"/></>,
    scale: <><path d="M12 4v16"/><path d="M5 7h14"/><path d="M5 7 2 14h6L5 7Z"/><path d="m19 7-3 7h6l-3-7Z"/><path d="M8 20h8"/></>,
    pipe: <><path d="M4 4h6v6H4z"/><path d="M10 7h7a3 3 0 0 1 3 3v10"/><path d="M16 20h4"/></>,
    health: <><path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"/><path d="M12 8v6M9 11h6"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5h8v2M3 12h18M10 12v2h4v-2"/></>,
    education: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5"/><path d="M21 9v6"/></>,
    finance: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/></>,
    nightlife: <><path d="m8 3 8 8-4 4-8-8 4-4Z"/><path d="m13 14 5 5M7 21h10"/></>,
    beauty: <><path d="M12 3v18M5 8h14M7 8c0 5 2 8 5 8s5-3 5-8"/></>,
    automotive: <><path d="m5 16 1-6h12l1 6"/><path d="M7 10 9 6h6l2 4"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></>,
    construction: <><path d="m4 20 8-8"/><path d="m6 6 12 12"/><path d="M3 3h6v6H3z"/><path d="M15 15h6v6h-6z"/></>,
    government: <><path d="m3 9 9-5 9 5"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/></>
  };
  return <svg {...common}>{paths[name] || <circle cx="12" cy="12" r="8" />}</svg>;
}
