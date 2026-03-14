import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/api";
import landDouala from "../../assets/landDouala.png";
import landBomaka from "../../assets/OIP.webp";
import landSanpit from "../../assets/OIP.webp";
import landYaounde from "../../assets/landyaounde.png";
import landGreatSoppo from "../../assets/mo-land-for-sale_(7).jpg";
import landKumba from "../../assets/land.png";

import {
  MapPin,
  User,
  Plus,
  Minus,
} from "lucide-react";

const formatFcfa = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 FCFA";
  return `${Math.round(num).toLocaleString("en-US")} FCFA`;
};

const investmentImages = {
  Douala: landDouala,
  "Great Soppo": landGreatSoppo,
  Bomaka: landBomaka,
  Sanpit: landSanpit,
  Kumba: landKumba,
  Yaounde: landYaounde,
  Molyko: landSanpit,
  "Buea Town": landSanpit,
};

const getFallbackImage = (location) => {
  const key = Object.keys(investmentImages).find((k) =>
    String(location || "").toLowerCase().includes(k.toLowerCase())
  );
  return investmentImages[key] || investmentImages["Sanpit"];
};

const InvestmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fractionCount, setFractionCount] = useState(1);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await apiService.getListing(id);
        const l = data?.listing;
        if (isMounted) {
          setListing(l || null);
        }
      } catch (e) {
        if (isMounted) {
          setLoadError(e?.message || "Failed to load listing");
          setListing(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      load();
    } else {
      setLoading(false);
      setListing(null);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const media = useMemo(() => (Array.isArray(listing?.media) ? listing.media : []), [listing]);
  const images = useMemo(() => media.filter((m) => m?.file_type === "image"), [media]);
  const videos = useMemo(() => media.filter((m) => m?.file_type === "video"), [media]);
  const heroImage = images?.[0]?.file_path
    ? apiService.getFileUrl(images[0].file_path)
    : getFallbackImage(listing?.location);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-800">Loading listing...</h1>
        </div>
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-800">Listing not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            {loadError ? loadError : `Invalid listing id: ${String(id)}`}
          </p>
          <a
            href="/Investments"
            className="inline-block mt-6 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
          >
            Back to Investments
          </a>
        </div>
      </div>
    );
  }

  const totalFractions = Number(listing?.fractions) || 0;
  const percentage = Math.max(0, Math.min(100, Number(listing?.progress) || 0));
  const fundedFractions = totalFractions > 0
    ? Math.round((percentage / 100) * totalFractions)
    : 0;
  const remainingFractions = Math.max(0, totalFractions - fundedFractions);

  const targetAmount = Number(listing?.target_amount ?? listing?.targetAmount) || 0;
  const pricePerFraction = totalFractions > 0 ? targetAmount / totalFractions : 0;
  const daysLeft = Number(listing?.days_left ?? listing?.daysLeft ?? listing?.duration_days ?? 0);
  const daysLeftLabel = `${Math.max(0, daysLeft)} Days Left`;

  const participants = [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* --- Hero Banner --- */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Land Background"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-10 left-10 text-white">
          <h1 className="text-4xl font-bold drop-shadow-md">{listing.title}</h1>
          <div className="mt-3 flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-md w-fit border border-white/30">
            <MapPin className="w-4 h-4 text-sky-300" />
            <span className="text-sm font-medium">{listing.location}</span>
          </div>
          {listing.status === "active" && (
            <div className="mt-3 inline-flex">
              <span className="bg-blue-800 text-white text-xs font-bold px-3 py-1 rounded">Approved</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {listing.description || "No description provided."}
            </p>
          </section>

          {(images.length > 0 || videos.length > 0) && (
            <section className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">Media</h2>

              {images.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((m, idx) => (
                      <img
                        key={`${m.file_path}-${idx}`}
                        src={apiService.getFileUrl(m.file_path)}
                        alt={`Listing media ${idx + 1}`}
                        className="w-full h-32 md:h-36 object-cover rounded-lg border border-gray-100"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div className={images.length > 0 ? "mt-8" : ""}>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Videos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((m, idx) => (
                      <div key={`${m.file_path}-${idx}`} className="relative rounded-lg overflow-hidden bg-gray-100">
                        <video className="w-full h-48 object-cover" controls>
                          <source
                            src={apiService.getFileUrl(m.file_path)}
                            type={m.mime_type || "video/mp4"}
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column */}
        <div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md sticky top-24">
            <div className="mb-6">
              <span className="text-blue-800 text-sm font-bold uppercase tracking-wider">
                Target
              </span>

              <div className="text-3xl font-black text-slate-800 mt-1">
                {formatFcfa(targetAmount)}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Price per fraction</span>
                <span className="text-sm font-extrabold text-blue-900">{formatFcfa(pricePerFraction)}</span>
              </div>

              <div className="flex justify-between text-xs font-bold text-slate-500 mt-4 uppercase">
                <span>Land Value</span>
                <span>{daysLeftLabel}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-800 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-sm font-bold mt-3">
                <span>
                  {fundedFractions}/{totalFractions}
                  <span className="text-slate-400 font-normal"> Fractions Funded</span>
                </span>
                <span className="text-blue-800">{percentage}%</span>
              </div>
            </div>

            {/* Fraction Counter */}
            <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-2 mb-4">
              <button
                onClick={() => setFractionCount(Math.max(1, fractionCount - 1))}
                className="p-2 hover:bg-white rounded border shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-lg font-bold">{fractionCount}</span>

              <button
                onClick={() =>
                  setFractionCount(
                    Math.min(remainingFractions, fractionCount + 1)
                  )
                }
                className="p-2 hover:bg-white rounded border shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-400 px-2 border-l">
                {remainingFractions} Remaining
              </span>
            </div>

            <button
              disabled={remainingFractions === 0}
              className="w-full bg-blue-800 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
              onClick={() => {
                const checkoutState = {
                  listingId: id,
                  fractionCount,
                  investment: {
                    id: listing.id,
                    title: listing.title,
                    location: listing.location,
                    targetAmount: listing.target_amount ?? listing.targetAmount,
                    totalFractions: listing.fractions,
                    target: formatFcfa(listing.target_amount ?? listing.targetAmount),
                    funded: `${fundedFractions}/${totalFractions} Fractions Funded`,
                  },
                };

                if (!isAuthed) {
                  navigate("/Login", {
                    state: {
                      redirectTo: "/checkout",
                      checkoutState,
                    },
                  });
                  return;
                }

                if (role && role !== "investor") {
                  navigate("/Login", {
                    state: {
                      redirectTo: "/checkout",
                      checkoutState,
                    },
                  });
                  return;
                }

                navigate("/checkout", { state: checkoutState });
              }}
            >
              Commit {fractionCount} Fraction(s)
            </button>

            <p className="text-[11px] text-center text-slate-400 leading-relaxed italic mt-4">
              LandInvest does not collect or manage funds directly.
            </p>
          </div>
        </div>

        {/* Participants Table */}
        <div className="lg:col-span-3 mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Participants</h2>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-8 py-4">Participant</th>
                  <th className="px-8 py-4">Fractions</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {participants.length === 0 ? (
                  <tr>
                    <td className="px-8 py-6 text-sm text-slate-500" colSpan={4}>
                      No participants yet.
                    </td>
                  </tr>
                ) : (
                  participants.map((p, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-8 py-5 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-semibold text-slate-700">{p.name}</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-600">{p.fractions}</td>
                      <td className="px-8 py-5 text-sm font-bold text-blue-800">{p.amount}</td>
                      <td className="px-8 py-5 text-sm text-slate-400">{p.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default InvestmentDetailPage;