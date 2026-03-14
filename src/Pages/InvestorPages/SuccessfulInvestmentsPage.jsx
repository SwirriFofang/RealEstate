import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import landDouala from "../../assets/landDouala.png";
import landSanpit from "../../assets/OIP.webp";
import landYaounde from "../../assets/landyaounde.png";
import landGreatSoppo from "../../assets/mo-land-for-sale_(7).jpg";
import landKumba from "../../assets/land.png";
import apiService from "../../services/api";

const investmentImages = {
  Douala: landDouala,
  "Great Soppo": landGreatSoppo,
  Bomaka: landSanpit,
  Sanpit: landSanpit,
  Kumba: landKumba,
  Yaounde: landYaounde,
  "Molyko": landSanpit,
  "Buea Town": landSanpit,
};


export default function SuccessfulInvestmentsPage() {
  const [locationQuery, setLocationQuery] = useState("");
  const [priceQuery, setPriceQuery] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await apiService.getListings({ limit: 200 });
        const fetched = Array.isArray(data?.listings) ? data.listings : [];
        if (isMounted) setListings(fetched);
      } catch (e) {
        if (isMounted) setLoadError(e?.message || "Failed to load listings");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  const mapListingToInvestment = useCallback((l) => {
    const total = Number(l?.fractions) || 0;
    const progress = Number(l?.progress) || 0;
    const funded = total > 0 ? Math.round((progress / 100) * total) : 0;
    const daysLeft = Number(l?.days_left ?? l?.daysLeft ?? l?.duration_days ?? 0);

    return {
      id: l.id,
      title: l.title,
      location: l.location,
      target: formatFcfa(l.target_amount ?? l.targetAmount),
      funded: `${funded}/${total} Fractions Funded`,
      days: `${Math.max(0, daysLeft)} Days Left`,
      status: l.status || "active",
      image: getListingImage(l),
      __raw: l,
    };
  }, []);

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

  const investments = useMemo(() => listings.map(mapListingToInvestment), [listings, mapListingToInvestment]);

  const successfulInvestments = useMemo(() => {
    return investments.filter((inv) => {
      const { funded, total } = parseFundedFractions(inv.funded);
      return total > 0 && funded === total;
    });
  }, [investments]);

  const normalizedLocationQuery = locationQuery.trim().toLowerCase();
  const normalizedPriceQuery = priceQuery.trim().toLowerCase();

  const filteredInvestments = successfulInvestments.filter((inv) => {
    const haystack = `${inv.location} ${inv.title}`.toLowerCase();
    const matchesLocation = normalizedLocationQuery
      ? haystack.includes(normalizedLocationQuery)
      : true;

    const { total } = parseFundedFractions(inv.funded);
    const targetValue = parseFcfaAmount(inv.target);
    const pricePerFraction = total > 0 ? targetValue / total : 0;
    const priceHaystack = `${formatFcfa(pricePerFraction)} ${pricePerFraction}`.toLowerCase();
    const matchesPrice = normalizedPriceQuery
      ? priceHaystack.includes(normalizedPriceQuery)
      : true;

    return matchesLocation && matchesPrice;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900">Past Successful Investments</h1>
              <p className="text-sm text-slate-600 mt-1">
                Completed opportunities (fully funded). Explore what has succeeded on the platform.
              </p>
            </div>
            <Link
              to="/Investments"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition"
            >
              Back to Investments
            </Link>
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">Search by location</label>
                <input
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Type a city or area e.g. Yaounde..."
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loadError ? (
          <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-700">
            <p className="font-semibold">{loadError}</p>
            <p className="text-sm text-slate-500 mt-1">Please refresh and try again.</p>
          </div>
        ) : loading ? (
          <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-700">
            <p className="font-semibold">Loading successful investments...</p>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-700">
            <p className="font-semibold">No successful investments found for that search.</p>
            <p className="text-sm text-slate-500 mt-1">Try another location or price.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {filteredInvestments.map((item) => {
              const { funded, total } = parseFundedFractions(item.funded);
              const remaining = Math.max(0, total - funded);
              const percentage = total > 0 ? Math.round((funded / total) * 100) : 0;
              const pricePerFraction = total > 0 ? parseFcfaAmount(item.target) / total : 0;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden border border-slate-100
                             transition-all duration-300 ease-out transform
                             hover:-translate-y-3 hover:scale-105 hover:shadow-xl
                             hover:shadow-sky-200/40 relative"
                >
                  <div className="relative">
                    <img src={item.image} alt="Land" className="h-40 w-full object-cover" />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded">
                      Successful
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.location}</p>

                    <div className="mt-4 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Target:</span> {item.target}
                      </p>

                      <div className="mt-2 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                        <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Price per fraction</span>
                        <span className="text-sm font-extrabold text-blue-900">{formatFcfa(pricePerFraction)}</span>
                      </div>

                      <p className="flex justify-between">
                        <span>{item.funded}</span>
                        <span>{item.days}</span>
                      </p>
                    </div>

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

                    <Link
                      to={`/investments/${item.id}`}
                      className="mt-5 block text-center w-full py-2 rounded-md font-semibold text-white bg-blue-800 hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
