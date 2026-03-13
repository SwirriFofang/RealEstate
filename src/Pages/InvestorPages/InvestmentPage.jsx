
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import landDouala from "../../assets/landDouala.png";
import landSanpit from "../../assets/OIP.webp";
import landYaounde from "../../assets/landyaounde.png";
import landGreatSoppo from "../../assets/mo-land-for-sale_(7).jpg";
import landKumba from "../../assets/land.png";
import apiService from "../../services/api";


const investmentImages = {
  Douala:
    landDouala,
  "Great Soppo":
    landGreatSoppo,
  Bomaka:
    landSanpit,
  Sanpit:
    landSanpit,
  Kumba:
    landKumba,
  Yaounde:
    landYaounde,
  "Molyko":
    landSanpit,
  "Buea Town":
    landSanpit,
};


const formatTargetAmount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 FCFA";
  return `${Math.round(num).toLocaleString("en-US")} FCFA`;
};

const getListingImage = (listing) => {
  const media = Array.isArray(listing?.media) ? listing.media : [];
  const first = media[0];
  if (first?.file_path) {
    return apiService.getFileUrl(first.file_path);
  }

  const location = String(listing?.location || "");
  const key = Object.keys(investmentImages).find((k) => location.toLowerCase().includes(k.toLowerCase()));
  return investmentImages[key] || investmentImages["Sanpit"];
};

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

export default function Investments() {
  const navigate = useNavigate();
  const [locationQuery, setLocationQuery] = useState("");
  const [priceQuery, setPriceQuery] = useState("");
  const [investments, setInvestments] = useState([]);
  const [fractionCounts, setFractionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role");

  useEffect(() => {
    if (!isAuthed) {
      navigate("/Login");
      return;
    }

    if (role !== "investor") {
      navigate("/");
    }
  }, [isAuthed, role, navigate]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data = await apiService.getListings({ limit: 50 });
        const listings = Array.isArray(data?.listings) ? data.listings : [];

        const mapped = listings.map((l) => {
          const total = Number(l?.fractions) || 0;
          const funded = Math.round(((Number(l?.progress) || 0) / 100) * total);
          const daysLeft = Number(l?.days_left ?? l?.daysLeft ?? l?.duration_days ?? 0);

          return {
            id: l.id,
            title: l.title,
            location: l.location,
            target: formatTargetAmount(l.target_amount ?? l.targetAmount),
            targetAmount: Number(l?.target_amount ?? l?.targetAmount) || 0,
            totalFractions: total,
            fundedFractions: funded,
            funded: `${Math.max(0, funded)}/${Math.max(0, total)} Fractions Funded`,
            days: `${Math.max(0, daysLeft)} Days Left`,
            status: l.status || "active",
            image: getListingImage(l),
            __raw: l,
          };
        });

        if (isMounted) {
          setInvestments(mapped);
          setFractionCounts((prev) => {
            const next = { ...prev };
            mapped.forEach((m) => {
              if (next[m.id] == null) next[m.id] = 1;
            });
            return next;
          });
        }
      } catch (e) {
        if (isMounted) {
          setLoadError(e?.message || "Failed to load listings");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedLocationQuery = locationQuery.trim().toLowerCase();
  const normalizedPriceQuery = priceQuery.trim().toLowerCase();

  const filteredInvestments = useMemo(() => investments.filter((inv) => {
    const { funded, total } = parseFundedFractions(inv.funded);
    const isSuccessful = total > 0 && funded === total;
    if (isSuccessful) return false;

    const haystack = `${inv.location} ${inv.title}`.toLowerCase();
    const matchesLocation = normalizedLocationQuery
      ? haystack.includes(normalizedLocationQuery)
      : true;

    const { total: totalFractions } = parseFundedFractions(inv.funded);
    const targetValue = parseFcfaAmount(inv.target);
    const pricePerFraction = totalFractions > 0 ? targetValue / totalFractions : 0;
    const priceHaystack = `${formatFcfa(pricePerFraction)} ${pricePerFraction}`.toLowerCase();
    const matchesPrice = normalizedPriceQuery
      ? priceHaystack.includes(normalizedPriceQuery)
      : true;

    return matchesLocation && matchesPrice;
  }), [investments, normalizedLocationQuery, normalizedPriceQuery]);

  if (!isAuthed || role !== "investor") return null;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* HERO */}
      <div
        className="h-56 bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            `url(${investmentImages["Sanpit"]})`,
        }}
      >
        <h2 className="text-4xl font-bold text-white ml-16">Investments</h2>
      </div>

      {/* INVESTMENT GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Explore opportunities</h3>
            <p className="text-sm text-slate-600">Search active listings or review past successful investments.</p>
          </div>
          <Link
            to="/successful-investments"
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            View Past Successful Investments
          </Link>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 md:p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Search by location (Cameroon)</label>
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Type a city or area e.g. Douala, Yaounde, Buea..."
                className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Search by price per fraction (FCFA)</label>
              <input
                value={priceQuery}
                onChange={(e) => setPriceQuery(e.target.value)}
                placeholder="e.g. 1000000 or 1,000,000"
                className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
              />
            </div>
            <button
              type="button"
              className="h-11 px-5 rounded-lg bg-blue-800 text-white font-semibold hover:bg-blue-700 transition"
              onClick={() => {
                setLocationQuery("");
                setPriceQuery("");
              }}
              disabled={!locationQuery && !priceQuery}
            >
              Clear
            </button>
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-800">{filteredInvestments.length}</span> result(s)
          </div>
        </div>

        {loadError ? (
          <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-700">
            <p className="font-semibold">{loadError}</p>
            <p className="text-sm text-slate-500 mt-1">Please refresh and try again.</p>
          </div>
        ) : loading ? (
          <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-700">
            <p className="font-semibold">Loading listings...</p>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-700">
            <p className="font-semibold">New investments coming soon</p>
            <p className="text-sm text-slate-500 mt-1">Check back later for fresh land investment opportunities.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredInvestments.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl shadow-md overflow-hidden border border-slate-100
                           transition-all duration-300 ease-out transform
                           hover:-translate-y-3 hover:scale-105 hover:shadow-xl
                           hover:shadow-sky-200/40 relative"
              >
                {(() => {
                  const { funded, total } = parseFundedFractions(item.funded);
                  const remaining = Math.max(0, total - funded);
                  const showSoonGone = total > 0 && remaining <= 5;
                  if (!showSoonGone) return null;

                  return (
                    <div className="absolute left-0 top-0 z-20 pointer-events-none">
                      <div className="origin-top-left -rotate-30 -translate-x-10 translate-y-15 bg-red-600 text-white font-extrabold uppercase tracking-wider text-xs px-12 py-2 shadow-lg">
                        Soon Gone
                      </div>
                    </div>
                  );
                })()}
                <div className="relative">
                  <img
                    src={item.image}
                    alt="Land"
                    className="h-40 w-full object-cover"
                  />
                  {item.status === "open" && (
                    <span className="absolute top-3 right-3 bg-blue-800 text-white text-xs px-3 py-1 rounded">
                      Open
                    </span>
                  )}
                  {item.status === "expired" && (
                    <span className="absolute top-3 right-3 bg-gray-500 text-white text-xs px-3 py-1 rounded">
                      Expired
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.location}</p>

                  <div className="mt-4 text-sm space-y-1">
                    <p>
                      <span className="font-medium">Target:</span> {item.target}
                    </p>
                    {(() => {
                      const { total } = parseFundedFractions(item.funded);
                      const targetValue = parseFcfaAmount(item.target);
                      const pricePerFraction = total > 0 ? targetValue / total : 0;
                      return (
                        <div className="mt-2 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Price per fraction</span>
                          <span className="text-sm font-extrabold text-blue-900">{formatFcfa(pricePerFraction)}</span>
                        </div>
                      );
                    })()}
                    <p className="flex justify-between">
                      <span>{item.funded}</span>
                      <span>{item.days}</span>
                    </p>
                  </div>

                  {(() => {
                    const { funded, total } = parseFundedFractions(item.funded);
                    const remaining = Math.max(0, total - funded);
                    const percentage = total > 0 ? Math.round((funded / total) * 100) : 0;

                    return (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                          <div
                            className="bg-blue-800 h-3 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {funded}/{total} Fractions Funded
                          {total > 0 ? ` • ${remaining} Left` : ""}
                        </p>
                      </>
                    );
                  })()}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-md border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        className="h-10 w-10 bg-slate-50 text-slate-800 font-bold hover:bg-slate-100"
                        onClick={() =>
                          setFractionCounts((prev) => ({
                            ...prev,
                            [item.id]: Math.max(1, (Number(prev[item.id]) || 1) - 1),
                          }))
                        }
                      >
                        -
                      </button>
                      <div className="h-10 w-12 flex items-center justify-center font-bold text-slate-900">
                        {Number(fractionCounts[item.id]) || 1}
                      </div>
                      <button
                        type="button"
                        className="h-10 w-10 bg-slate-50 text-slate-800 font-bold hover:bg-slate-100"
                        onClick={() => {
                          const { funded, total } = parseFundedFractions(item.funded);
                          const remaining = Math.max(0, total - funded);
                          setFractionCounts((prev) => ({
                            ...prev,
                            [item.id]: Math.min(remaining || 1, (Number(prev[item.id]) || 1) + 1),
                          }));
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex-1 h-10 rounded-md bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={(() => {
                        const { funded, total } = parseFundedFractions(item.funded);
                        return total > 0 && funded >= total;
                      })()}
                      onClick={() => {
                        const count = Number(fractionCounts[item.id]) || 1;
                        navigate("/checkout", {
                          state: {
                            listingId: item.id,
                            fractionCount: count,
                            investment: {
                              id: item.id,
                              title: item.title,
                              location: item.location,
                              targetAmount: item.targetAmount,
                              totalFractions: item.totalFractions,
                              target: item.target,
                              funded: item.funded,
                            },
                          },
                        });
                      }}
                    >
                      Commit Fractions
                    </button>
                  </div>

                  <Link
                    to={`/investments/${item.id}`}
                    className={`mt-5 block text-center w-full py-2 rounded-md font-semibold text-white ${
                      item.status === "funded"
                        ? "bg-blue-800 hover:bg-blue-700"
                        : item.status === "expired"
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-800 hover:bg-blue-700"
                    }`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
