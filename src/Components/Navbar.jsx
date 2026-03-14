import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role") || "investor";

  const handleLogout = () => {
    localStorage.removeItem("li_auth");
    localStorage.removeItem("li_role");
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-10 py-4 bg-white shadow-sm relative border-b border-slate-100">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="md:hidden text-blue-800 text-sm font-semibold"
          aria-label="Open navigation menu"
        >
          Menu
        </button>
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-800">
          <span className="hidden md:inline"></span>
          <span>LandInvest</span>
        </Link>
      </div>

      {/* LINKS  */}
      <ul className="hidden md:flex gap-6 text-sm font-medium text-slate-700">
        <li><Link to="/" className="hover:text-blue-800">HOME</Link></li>
        <li><Link to="/Investments" className="hover:text-blue-800">INVESTMENT</Link></li>
        <li><Link to="/About" className="hover:text-blue-800">ABOUT</Link></li>
        <li><Link to="/Testimonials" className="hover:text-blue-800">TESTIMONIAL</Link></li>
        <li><Link to="/contact" className="hover:text-blue-800">CONTACT</Link></li>
      </ul>

      {/* AUTH BUTTONS */}
      <div className="flex gap-4 items-center">
        <div className="relative">
          <button
            type="button"
            className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:text-blue-800 hover:border-blue-200 shadow-sm flex items-center justify-center transition"
            onClick={() => setOpen(!open)}
            aria-label="Open account menu"
          >
            <span className="text-sm font-semibold">
              {isAuthed ? (role === "projectOwner" ? "PO" : "IN") : "≡"}
            </span>
          </button>

          {/* DROPDOWN MENU */}
          {open && (
            <div className="fixed right-0 top-16 w-1/2 bg-white shadow-xl rounded-xl p-5 z-50 border border-gray-100 md:absolute md:right-0 md:top-full md:mt-3 md:w-60">
              {!isAuthed ? (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Account</p>
                  <p className="font-semibold text-gray-800 mb-4">Welcome</p>
                  <Link
                    to="/Login"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Sign in (Investor)
                  </Link>
                  <Link
                    to="/project-owner-login"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Sign in (Project Owner)
                  </Link>
                  <Link
                    to="/SignUp"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              ) : role === "projectOwner" ? (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Signed in as</p>
                  <p className="font-semibold text-gray-800 mb-4">Project Owner</p>
                  <Link
                    to="/profile"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/project-owners-dashboard"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Project Owner Dashboard
                  </Link>
                  <Link
                    to="/my-list"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    My List
                  </Link>
                  <Link
                    to="/verification"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Verification 
                  </Link>
                  <Link
                    to="/settings"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Setting
                  </Link>
                  <Link
                    to="/notifications"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    to="/referrals"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Referrals
                  </Link>
                  <button
                    type="button"
                    className="w-full text-left mt-3 py-2 px-3 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Signed in as</p>
                  <p className="font-semibold text-gray-800 mb-4">Investor</p>
                  <Link
                    to="/profile"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/investor-dashboard"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Investor Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Setting
                  </Link>
                  <Link
                    to="/notifications"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    to="/referrals"
                    className="block py-2 px-3 rounded-md hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    Referrals
                  </Link>
                  <button
                    type="button"
                    className="w-full text-left mt-3 py-2 px-3 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-1/2 bg-white border-t border-gray-100 shadow-md z-40 md:hidden">
          <div className="px-6 py-4 grid gap-3 text-sm font-medium text-slate-700">
            <Link to="/" className="py-2" onClick={() => setMobileOpen(false)}>
              HOME
            </Link>
            <Link to="/Investments" className="py-2" onClick={() => setMobileOpen(false)}>
              INVESTMENT
            </Link>
            <Link to="/About" className="py-2" onClick={() => setMobileOpen(false)}>
              ABOUT
            </Link>
            <Link to="/Testimonials" className="py-2" onClick={() => setMobileOpen(false)}>
              TESTIMONIAL
            </Link>
            <Link to="/contact" className="py-2" onClick={() => setMobileOpen(false)}>
              CONTACT
            </Link>
            <Link to="/Login" className="py-2 text-blue-800" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;