"use client";

import { useMemo, useState } from "react";

type Listing = {
  name: string;
  category: string;
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

export default function Home() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All Ethiopia");
  const [activeCategory, setActiveCategory] = useState("All");
  const [language, setLanguage] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => listings.filter((item) => {
    const searchable = `${item.name} ${item.category} ${item.city} ${item.neighborhood}`.toLowerCase();
    return (!query || searchable.includes(query.toLowerCase())) &&
      (city === "All Ethiopia" || item.city === city) &&
      (activeCategory === "All" || item.category === activeCategory);
  }), [query, city, activeCategory]);

  const runSearch = (event: React.FormEvent) => event.preventDefault();

  return (
    <main className="site-shell">
      <div className="announcement"><span>✦</span> Discover Ethiopia, one local business at a time <a href="#featured">Explore featured places →</a></div>
      <header className="nav-wrap">
        <nav className="nav container">
          <a className="brand" href="#top" aria-label="EthioPages home"><span className="brand-mark">E</span><span>Ethio<span>Pages</span></span></a>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            <a href="#explore">Explore</a><a href="#categories">Categories</a><a href="#cities">Cities</a><a href="#about">About us</a>
          </div>
          <div className="nav-actions"><select aria-label="Choose language" value={language} onChange={(e) => setLanguage(e.target.value)}><option>EN</option><option>አማ</option><option>OM</option><option>عربي</option><option>中文</option></select><a className="add-listing" href="mailto:hello@ethiopages.com">Add a business <span>↗</span></a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">☰</button></div>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="container hero-inner">
          <div className="eyebrow"><span className="eyebrow-dot" /> Ethiopia&apos;s local guide</div>
          <h1>Find your <em>people.</em><br />Find your place.</h1>
          <p className="hero-copy">The trusted directory for discovering the businesses, services and experiences that make Ethiopia extraordinary.</p>
          <form className="search-bar" onSubmit={runSearch}>
            <span className="search-icon">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search restaurants, hotels, salons..." aria-label="Search businesses" /><span className="search-divider" /><span className="pin-icon">⌖</span><select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Choose a city"><option>All Ethiopia</option>{cities.map((item) => <option key={item}>{item}</option>)}</select><button type="submit">Search</button>
          </form>
          <div className="popular"><span>Popular:</span>{["Restaurants", "Hotels", "Beauty", "Nightlife"].map((item) => <button key={item} onClick={() => setActiveCategory(item === "Hotels" ? "Hotels & stays" : item === "Beauty" ? "Beauty & wellness" : item)}>{item}</button>)}</div>
          <div className="hero-proof"><div className="avatar-stack"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div><span><strong>10,000+</strong> places to discover <b>·</b> <strong>All across Ethiopia</strong></span></div>
        </div>
      </section>

      <section className="section container" id="categories"><div className="section-heading"><div><span className="kicker">Browse by interest</span><h2>What are you looking for?</h2></div><a className="text-link" href="#explore">View all categories <span>↗</span></a></div><div className="category-grid">{categories.map(([icon, name, count]) => <button className="category-card" key={name} onClick={() => { setActiveCategory(name); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}><span className="category-icon">{icon}</span><span className="category-name">{name}</span><span className="category-count">{count}</span><span className="category-arrow">↗</span></button>)}</div></section>

      <section className="featured-band" id="featured"><div className="container"><div className="section-heading light"><div><span className="kicker">Handpicked for you</span><h2>Places worth knowing.</h2></div><a className="text-link" href="#explore">See all places <span>↗</span></a></div><div className="listing-grid">{listings.slice(0, 3).map((item) => <ListingCard item={item} key={item.name} />)}</div></div></section>

      <section className="section container explore-section" id="explore"><div className="section-heading"><div><span className="kicker">Explore the directory</span><h2>{activeCategory === "All" ? "Popular near you" : activeCategory}</h2></div><div className="filter-row"><button className={`filter ${activeCategory === "All" ? "selected" : ""}`} onClick={() => setActiveCategory("All")}>All places</button><button className="filter" onClick={() => setActiveCategory("Restaurants")}>Open now <span>⌄</span></button></div></div>{filtered.length ? <div className="listing-grid">{filtered.map((item) => <ListingCard item={item} key={item.name} />)}</div> : <div className="empty-state"><span>⌕</span><h3>No places found</h3><p>Try a different search or city.</p><button onClick={() => { setQuery(""); setCity("All Ethiopia"); setActiveCategory("All"); }}>Clear filters</button></div>}</section>

      <section className="city-section" id="cities"><div className="container city-inner"><div><span className="kicker">Everywhere you go</span><h2>Explore Ethiopia<br /><em>your way.</em></h2><p>From the energy of Addis to lakeside Hawassa, find the local places that make every city feel like home.</p><a className="dark-link" href="#explore">Explore all cities <span>↗</span></a></div><div className="city-list">{cities.map((item, index) => <button key={item} onClick={() => { setCity(item); document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }); }}><span>0{index + 1}</span><strong>{item}</strong><i>↗</i></button>)}</div></div></section>

      <section className="owner-cta" id="about"><div className="container owner-inner"><div><span className="kicker">Own a business?</span><h2>Be where Ethiopia<br /><em>is looking.</em></h2></div><div><p>Claim your listing, share what makes you special, and connect with more customers every day.</p><a className="cta-button" href="mailto:hello@ethiopages.com">List your business <span>↗</span></a></div></div></section>

      <footer><div className="container footer-top"><a className="brand footer-brand" href="#top"><span className="brand-mark">E</span><span>Ethio<span>Pages</span></span></a><p>Ethiopia, made discoverable.</p><div className="footer-links"><a href="#about">About</a><a href="#cities">Cities</a><a href="mailto:hello@ethiopages.com">Contact</a><a href="#">Privacy</a></div></div><div className="container footer-bottom"><span>© 2025 EthioPages. Built for Ethiopia.</span><span>Want to be shown first? <a href="https://t.me/EthioPages" target="_blank" rel="noreferrer">Contact us on Telegram <b>@EthioPages</b> ↗</a></span></div></footer>
    </main>
  );
}

function ListingCard({ item }: { item: Listing }) {
  return <article className="listing-card"><div className="listing-image"><img src={item.image} alt={item.name} /><span className={`image-tag ${item.color}`}>{item.badge || "Verified"}</span><button className="save-button" aria-label={`Save ${item.name}`}>♡</button></div><div className="listing-body"><div className="listing-meta"><span>{item.category}</span><span>·</span><span>{item.city}</span></div><h3>{item.name}</h3><p>{item.description}</p><div className="listing-rating"><strong>★ {item.rating}</strong><span>({item.reviews} reviews)</span><span className="open-status">● {item.hours}</span></div><div className="listing-footer"><span>⌖ {item.neighborhood}</span><a href={`tel:${item.phone || ""}`}>View details <span>↗</span></a></div></div></article>;
}
