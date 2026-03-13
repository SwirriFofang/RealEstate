import React, { useMemo, useState } from "react";

const StatusPill = ({ status }) => {
  const cls =
    status === "active"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : status === "draft"
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>{status}</span>;
};

export default function ListingsPage() {
  const [query, setQuery] = useState("");

  const listings = useMemo(
    () => [
      { id: "L-2001", title: "Land in Douala", owner: "John Owner", status: "active", target: "25,000,000 FCFA" },
      { id: "L-2002", title: "Land in Great Soppo", owner: "John Owner", status: "pending", target: "18,500,000 FCFA" },
      { id: "L-2003", title: "Land in Bomaka", owner: "Jane Owner", status: "draft", target: "20,000,000 FCFA" },
    ],
    []
  );

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? listings.filter((l) => `${l.id} ${l.title} ${l.owner} ${l.status}`.toLowerCase().includes(normalized))
    : listings;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Listings</h1>
          <p className="text-sm text-slate-500 mt-1">Review land listings (demo data).</p>
        </div>

        <div className="w-full sm:w-80">
          <label className="text-sm font-semibold text-slate-700">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, id, owner..."
            className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Showing {filtered.length} listing(s)</p>
          <button type="button" className="h-9 px-3 rounded-lg bg-blue-800 text-white text-sm font-bold hover:bg-blue-700 transition">
            Create Listing
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Listing ID</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{l.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{l.title}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{l.owner}</td>
                  <td className="px-5 py-4 text-sm font-bold text-blue-900">{l.target}</td>
                  <td className="px-5 py-4"><StatusPill status={l.status} /></td>
                  <td className="px-5 py-4">
                    <button type="button" className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
