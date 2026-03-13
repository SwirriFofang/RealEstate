import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="text-lg font-bold text-gray-800">LandInvest</div>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              LandInvest is a coordination platform for fractional land investment.
            </p>
            <p className="mt-3 text-sm text-gray-700">
              Email: info@landinvest.cm
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Office: Buea, Cameroon
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-800">Quick Links</div>
            <div className="mt-4 grid gap-2 text-sm">
              <Link to="/" className="text-gray-700 hover:text-blue-800">Home</Link>
              <Link to="/Investments" className="text-gray-700 hover:text-blue-800">Investments</Link>
              <Link to="/About" className="text-gray-700 hover:text-blue-800">About</Link>
              <Link to="/Testimonials" className="text-gray-700 hover:text-blue-800">Testimonials</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-800">Contact</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-800">Legal</div>
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">
              LandInvest does not manage funds or own properties.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} LandInvest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
