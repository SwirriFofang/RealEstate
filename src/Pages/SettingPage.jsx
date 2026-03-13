import React from "react";

export default function SettingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-slate-600">
          This page is a placeholder. You can add profile, security, and
          notification settings here.
        </p>

        <div className="mt-8 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Account</p>
              <p className="text-sm text-slate-600">
                Manage your profile and preferences.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Security</p>
              <p className="text-sm text-slate-600">
                Update password and security settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
