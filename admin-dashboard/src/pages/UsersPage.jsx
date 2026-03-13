import React, { useMemo, useState } from "react";

const Badge = ({ children, tone }) => {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-700 border-slate-200";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>{children}</span>;
};

export default function UsersPage() {
  const [query, setQuery] = useState("");

  const users = useMemo(
    () => [
      { id: "U-1001", name: "Jane Investor", role: "investor", status: "active" },
      { id: "U-1002", name: "John Owner", role: "projectOwner", status: "pending" },
      { id: "U-1003", name: "Mary Investor", role: "investor", status: "active" },
    ],
    []
  );

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? users.filter((u) => `${u.id} ${u.name} ${u.role} ${u.status}`.toLowerCase().includes(normalized))
    : users;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Search and manage platform users (demo data).</p>
        </div>

        <div className="w-full sm:w-80">
          <label className="text-sm font-semibold text-slate-700">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, id, role..."
            className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Showing {filtered.length} user(s)</p>
          <button type="button" className="h-9 px-3 rounded-lg bg-blue-800 text-white text-sm font-bold hover:bg-blue-700 transition">
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">User ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{u.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{u.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{u.role}</td>
                  <td className="px-5 py-4">
                    <Badge tone={u.status === "active" ? "ok" : "warn"}>{u.status}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <button type="button" className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition">
                      View
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
