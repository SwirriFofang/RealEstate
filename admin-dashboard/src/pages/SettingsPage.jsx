import React from "react";

export default function SettingsPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Admin configuration (placeholder).</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-600">
          This area will contain admin settings like roles, permissions, audit logs, and system preferences.
        </p>
      </div>
    </div>
  );
}
