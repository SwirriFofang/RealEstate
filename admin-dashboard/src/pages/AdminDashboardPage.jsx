import React, { useMemo } from "react";

const StatCard = ({ label, value, hint }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
};

const ActivityRow = ({ title, meta, status }) => {
  const statusClasses =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "pending"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="min-w-0">
        <p className="font-bold text-slate-900 truncate">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{meta}</p>
      </div>
      <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${statusClasses}`}>
        {status}
      </span>
    </div>
  );
};

export default function AdminDashboardPage() {
  const stats = useMemo(
    () => ({
      users: 1284,
      listings: 46,
      activeInvestments: 9,
      pendingVerifications: 6,
    }),
    []
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">High-level overview of platform activity (demo data).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.users} hint="All registered accounts" />
        <StatCard label="Total Listings" value={stats.listings} hint="All land listings" />
        <StatCard label="Active Investments" value={stats.activeInvestments} hint="Currently funding" />
        <StatCard label="Pending Verifications" value={stats.pendingVerifications} hint="Awaiting review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500 mt-1">Latest actions across the platform.</p>

          <div className="mt-4 grid gap-3">
            <ActivityRow title="Project Owner submitted verification" meta="Owner: John Doe • 2 mins ago" status="pending" />
            <ActivityRow title="New listing created" meta="Location: Douala • 1 hour ago" status="approved" />
            <ActivityRow title="Investor committed fractions" meta="Investment: Great Soppo • 5 hours ago" status="info" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Quick Actions</h2>
          <p className="text-sm text-slate-500 mt-1">Common admin tasks (demo buttons).</p>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              className="h-11 rounded-xl bg-blue-800 text-white font-bold hover:bg-blue-700 transition"
            >
              Review Pending Verifications
            </button>
            <button
              type="button"
              className="h-11 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold hover:bg-slate-50 transition"
            >
              Manage Listings
            </button>
            <button
              type="button"
              className="h-11 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold hover:bg-slate-50 transition"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
