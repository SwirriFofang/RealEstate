import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiService from "../../services/api";

const parseFundedFractions = (fundedLabel) => {
  const match = String(fundedLabel).match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return { funded: 0, total: 0 };
  return { funded: Number(match[1]), total: Number(match[2]) };
};

const parseFcfaAmount = (amountLabel) => {
  const raw = String(amountLabel ?? "").replace(/[^\d]/g, "");
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
};

const formatFcfa = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 FCFA";
  return `${Math.round(num).toLocaleString("en-US")} FCFA`;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { investmentId, listingId, fractionCount, investment } = location.state || {};

  const safeFractionCount = Number(fractionCount);
  const safeListingId = listingId != null ? String(listingId) : "";
  const safeInvestmentId = investmentId != null ? String(investmentId) : "";
  const safeEntityId = safeListingId || safeInvestmentId;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState("");

  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role");

  React.useEffect(() => {
    if (!isAuthed) {
      navigate("/Login", {
        state: {
          redirectTo: "/checkout",
          checkoutState: location.state || null,
        },
      });
      return;
    }

    if (role !== "investor") {
      navigate("/");
    }
  }, [isAuthed, role, navigate, location.state]);

  const cameroonCountryCode = "+237";
  const phoneDigits = String(phone).replace(/\D/g, "");

  const computed = useMemo(() => {
    if (!investment || !Number.isFinite(safeFractionCount) || safeFractionCount <= 0) {
      return {
        totalFractions: 0,
        pricePerFraction: 0,
        totalAmount: 0,
      };
    }

    const targetValue = parseFcfaAmount(investment.target);
    const total = Number(investment.totalFractions) || parseFundedFractions(investment.funded).total;
    const pricePerFraction = total > 0 ? targetValue / total : 0;
    const totalAmount = pricePerFraction * safeFractionCount;

    return { totalFractions: total, pricePerFraction, totalAmount };
  }, [investment, safeFractionCount]);

  if (!isAuthed || role !== "investor") return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!investment || !safeEntityId) {
      setError("Missing listing information. Please go back and select a listing again.");
      return;
    }

    if (!Number.isFinite(safeFractionCount) || safeFractionCount <= 0) {
      setError("Please select a valid number of fractions.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phoneDigits.trim()) {
      setError("Please fill in your full name, email, and phone.");
      return;
    }

    if (phoneDigits.length < 9) {
      setError("Invalid number: Cameroon phone numbers must be 9 digits.");
      return;
    }

    if (phoneDigits.length > 9) {
      setError("Number not correct: Cameroon phone numbers must be exactly 9 digits.");
      return;
    }

    try {
      setIsSubmitting(true);

      await apiService.createInvestment({
        listingId: safeEntityId,
        fractions: safeFractionCount,
        amount: computed.totalAmount,
      });

      const now = new Date();
      setOrderId(`ORD-${Date.now().toString().slice(-8)}`);
      setOrderDate(now.toISOString());
      setIsComplete(true);
    } catch (e) {
      setError(e?.message || "Failed to submit investment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
              <p className="text-slate-600">Your investment has been successfully processed.</p>
            </div>

            {/* Order Details */}
            <div className="border-t border-slate-200 pt-6 mb-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Order Details</h2>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold text-slate-900">{investment.title}</p>
                <p className="text-xs text-slate-500 mt-1">Location: {investment.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Fractions:</span>
                  <p className="font-extrabold text-slate-900">{safeFractionCount}</p>
                </div>
                <div>
                  <span className="text-slate-600">Price per fraction:</span>
                  <p className="font-extrabold text-blue-900">{formatFcfa(computed.pricePerFraction)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Total Amount:</span>
                  <p className="font-black text-slate-900">{formatFcfa(computed.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Payment Method:</span>
                  <p className="font-extrabold text-slate-900 capitalize">{paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            {/* Investor Information */}
            <div className="border-t border-slate-200 pt-6 mb-6">
              <h2 className="text-lg font-black text-slate-900 mb-4">Investor Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Full Name:</span>
                  <p className="font-extrabold text-slate-900">{fullName}</p>
                </div>
                <div>
                  <span className="text-slate-600">Email:</span>
                  <p className="font-extrabold text-slate-900">{email}</p>
                </div>
                <div>
                  <span className="text-slate-600">Phone:</span>
                  <p className="font-extrabold text-slate-900">{cameroonCountryCode} {phoneDigits}</p>
                </div>
                {notes && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-600">Notes:</span>
                    <p className="font-extrabold text-slate-900">{notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order ID and Timestamp */}
            <div className="border-t border-slate-200 pt-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Order ID:</span>
                  <p className="font-extrabold text-slate-900">{orderId}</p>
                </div>
                <div>
                  <span className="text-slate-600">Date:</span>
                  <p className="font-extrabold text-slate-900">
                    {orderDate ? new Date(orderDate).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-slate-900 font-extrabold hover:bg-slate-50 transition"
              >
                Print Receipt
              </button>
              <Link
                to="/investor-dashboard"
                className="flex-1 inline-flex items-center justify-center h-12 rounded-xl border border-slate-200 bg-white text-slate-900 font-extrabold hover:bg-slate-50 transition"
              >
                View My Investments
              </Link>
              <Link
                to="/Investments"
                state={{ fromCheckout: true }}
                className="flex-1 inline-flex items-center justify-center h-12 rounded-xl bg-blue-800 text-white font-extrabold hover:bg-blue-700 transition"
              >
                Back to Investments
              </Link>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              A confirmation email has been sent to {email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!investment || !safeEntityId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h1 className="text-xl font-black text-slate-900">Checkout</h1>
            <p className="text-slate-600 mt-2">No listing selected.</p>
            <Link
              to="/Investments"
              className="inline-flex items-center justify-center mt-6 h-11 px-5 rounded-lg bg-blue-800 text-white font-semibold hover:bg-blue-700 transition"
            >
              Back to Investments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">Checkout</h1>
            <p className="text-sm text-slate-600 mt-1">Complete your details to commit fractions.</p>
          </div>
          <Link
            to={`/investments/${safeEntityId}`}
            className="hidden sm:inline-flex items-center justify-center h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
          >
            Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
          <div className="lg:col-span-3">
            <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">Investor Details</h2>

              <div className="grid gap-4 mt-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                    placeholder="Your name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Phone</label>
                    <div className="mt-2 flex rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/30 focus-within:border-blue-300">
                      <span className="inline-flex items-center px-3 bg-slate-50 text-slate-700 text-sm font-bold border-r border-slate-200">
                        {cameroonCountryCode}
                      </span>
                      <input
                        inputMode="numeric"
                        value={phoneDigits}
                        maxLength={9}
                        onChange={(e) => {
                          const digitsOnly = String(e.target.value).replace(/\D/g, "");
                          setPhone(digitsOnly.slice(0, 9));
                        }}
                        className="w-full h-11 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        placeholder="9 digits e.g. 699123456"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Cameroon only. Enter exactly 9 digits after {cameroonCountryCode}.</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Payment method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                  >
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                    placeholder="Any additional information..."
                  />
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-blue-800 text-white font-extrabold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : "Confirm Payment"}
                </button>

                <p className="text-[11px] text-slate-500">
                  This is a demo checkout flow. Integrate payment provider later.
                </p>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-black text-slate-900">Order Summary</h2>

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">{investment.title}</p>
                  <p className="text-xs text-slate-500 mt-1">Location: {investment.location}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Fractions</span>
                  <span className="font-extrabold text-slate-900">{safeFractionCount}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Price per fraction</span>
                  <span className="font-extrabold text-blue-900">{formatFcfa(computed.pricePerFraction)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total</span>
                  <span className="font-black text-slate-900">{formatFcfa(computed.totalAmount)}</span>
                </div>

                <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Target</p>
                  <p className="text-sm font-extrabold text-blue-900 mt-1">{investment.target}</p>
                </div>

                <Link
                  to="/Investments"
                  className="mt-2 inline-flex items-center justify-center h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
                >
                  Browse More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
