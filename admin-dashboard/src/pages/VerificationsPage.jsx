import React, { useMemo } from "react";

const StatusPill = ({ status }) => {
  const cls =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "rejected"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>{status}</span>;
};

export default function VerificationsPage() {
  const items = useMemo(
    () => [
      { id: "V-3001", owner: "John Owner", submitted: "2026-03-01", status: "pending" },
      { id: "V-3002", owner: "Mary Owner", submitted: "2026-03-02", status: "approved" },
      { id: "V-3003", owner: "Jane Owner", submitted: "2026-03-03", status: "rejected" },
    ],
    []
  );

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Verifications</h1>
        <p className="text-sm text-slate-500 mt-1">Review Project Owner verification requests (demo data).</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Pending reviews</p>
          <button type="button" className="h-9 px-3 rounded-lg bg-blue-800 text-white text-sm font-bold hover:bg-blue-700 transition">
            Bulk Approve
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Verification ID</th>
                <th className="px-5 py-3">Project Owner</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">{v.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{v.owner}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{v.submitted}</td>
                  <td className="px-5 py-4"><StatusPill status={v.status} /></td>
                  <td className="px-5 py-4">
                    <button type="button" className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-bold hover:bg-slate-50 transition">
                      Open
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
