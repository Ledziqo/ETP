"use client";

import { useEffect, useState } from "react";
import sourceData from "../data/publicDiscovery.json";

type AdminListing = Record<string, string> & { external_id: string; name: string; category: string; subcategory?: string };

export default function AdminPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Restaurants");
  const [subcategory, setSubcategory] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("ethiopages-owner-session") !== "active") window.location.href = "/login";
    const saved = localStorage.getItem("ethiopages-admin-listings");
    setListings(saved ? JSON.parse(saved) : sourceData as AdminListing[]);
  }, []);

  const save = (next: AdminListing[]) => { setListings(next); localStorage.setItem("ethiopages-admin-listings", JSON.stringify(next)); };
  const add = () => {
    if (!name.trim()) return;
    save([{ external_id: `MANUAL-${Date.now()}`, name: name.trim(), category, subcategory, status: "Initial verified record" }, ...listings]);
    setName(""); setSubcategory(""); setMessage("Listing added to this browser’s admin workspace.");
  };
  const remove = (id: string) => save(listings.filter((item) => item.external_id !== id));
  const logout = () => { sessionStorage.removeItem("ethiopages-owner-session"); window.location.href = "/login"; };

  return <main className="admin-page"><header className="admin-header"><a className="brand" href="/"><span className="brand-mark">E</span><span>Ethio<span>Pages</span></span></a><button className="filter" onClick={logout}>Log out</button></header><section className="admin-content"><span className="kicker">Owner dashboard</span><h1>Manage listings</h1><p className="admin-note">Add, review, edit, or remove directory records. Changes in this preview are saved in this browser.</p><div className="admin-stats"><div><strong>{listings.length}</strong><span>Total listings</span></div><div><strong>{new Set(listings.map((x) => x.category)).size}</strong><span>Categories</span></div></div><div className="admin-form"><h2>Add listing</h2><input placeholder="Business name" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} /><input placeholder="Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} /><button className="cta-button" onClick={add}>Add listing <span>↗</span></button>{message && <p className="admin-success">{message}</p>}</div><div className="admin-list">{listings.slice(0, 100).map((item) => <article key={item.external_id}><div><strong>{item.name}</strong><span>{item.category}{item.subcategory ? ` · ${item.subcategory}` : ""}</span></div><button className="filter" onClick={() => remove(item.external_id)}>Delete</button></article>)}</div></section></main>;
}
