import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@landinvest.local");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassword = String(password);

    if (normalizedEmail !== "admin@landinvest.local" || normalizedPassword !== "admin") {
      setError("Invalid admin credentials.");
      return;
    }

    localStorage.setItem("li_admin_auth", "true");
    localStorage.setItem("li_admin_email", normalizedEmail);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-800">LandInvest</p>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Admin Login</h1>
          <p className="text-sm text-slate-500 mt-2">
            Demo credentials:
            <span className="font-semibold text-slate-700"> admin@landinvest.local</span> /{" "}
            <span className="font-semibold text-slate-700">admin</span>
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
              placeholder="admin@landinvest.local"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
              placeholder="admin"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="h-11 rounded-lg bg-blue-800 text-white font-bold hover:bg-blue-700 transition"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          This admin dashboard runs separately from the main website.
        </p>
      </div>
    </div>
  );
}
