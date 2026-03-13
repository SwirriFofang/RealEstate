import React, { useMemo } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const NavItem = ({ to, label, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ` +
        (isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-50")
      }
    >
      <span>{label}</span>
      <span className="text-xs text-slate-400 group-hover:text-slate-500">›</span>
    </NavLink>
  );
};

export default function RootLayout() {
  const navigate = useNavigate();

  const email = useMemo(
    () => localStorage.getItem("li_admin_email") || "admin@landinvest.local",
    []
  );

  const logout = () => {
    localStorage.removeItem("li_admin_auth");
    localStorage.removeItem("li_admin_email");
    navigate("/login");
  };

  return (
    <div className="min-h-screen text-slate-900 bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 bg-white/90 backdrop-blur">
          <div className="px-5 py-5 border-b border-slate-100">
            <Link to="/" className="font-black text-lg text-blue-900">
              LandInvest Admin
            </Link>
            <p className="text-xs text-slate-500 mt-1">Manage users, listings & verifications</p>
          </div>

          <nav className="px-4 py-4 grid gap-2">
            <NavItem to="/" label="Dashboard" end />
            <NavItem to="/users" label="Users" />
            <NavItem to="/listings" label="Listings" />
            <NavItem to="/verifications" label="Verifications" />
            <NavItem to="/settings" label="Settings" />
          </nav>

          <div className="mt-auto px-5 py-5 border-t border-slate-100">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 w-full h-10 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 bg-white/75 backdrop-blur border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Admin Console</p>
                <p className="text-xs text-slate-500">Review and manage platform activity</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-slate-500">Signed in</p>
                  <p className="text-sm font-semibold text-slate-800">{email}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="h-10 px-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="md:hidden border-b border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2 text-sm font-semibold text-slate-700">
              <NavItem to="/" label="Dashboard" end />
              <NavItem to="/users" label="Users" />
              <NavItem to="/listings" label="Listings" />
              <NavItem to="/verifications" label="Verifications" />
            </div>
          </div>

          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 text-xs text-slate-500">
              © {new Date().getFullYear()} LandInvest Admin
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
