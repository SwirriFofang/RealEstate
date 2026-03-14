import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // Added this import

import landDouala from "../assets/landDouala.png";
import landSanpit from "../assets/OIP.webp";
import landYaounde from "../assets/landyaounde.png";
import landGreatSoppo from "../assets/mo-land-for-sale_(7).jpg";
import landKumba from "../assets/land.png";
import landBomaka from "../assets/OIP.webp";
import apiService from "../services/api";

const formatFcfa = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 FCFA";
  return `${Math.round(num).toLocaleString("en-US")} FCFA`;
};

export default function LandingPage() {

  const investmentImages = useMemo(
    () => ({
      Douala:
        landDouala,
      "Great Soppo":
        landGreatSoppo,
      Bomaka:
        landBomaka,
      Sanpit:
        landSanpit,
      Kumba:
        landKumba,
      Yaounde:
        landYaounde,
    }),
    []
  );

  const slides = useMemo(
    () => [
      {
        id: 1,
        title: "Invest in Land, Together.",
        subtitle:
          "Join others to invest in land opportunities through fractional ownership.",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
      },
      {
        id: 2,
        title: "Verified Projects. Real Growth.",
        subtitle:
          "Explore verified land opportunities and track funding progress in real time.",
        image:
          "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=2000&q=80",
      },
      {
        id: 3,
        title: "Own Fractions. Build Wealth.",
        subtitle:
          "Start small and co-own land with others — transparent, simple, secure.",
        image:
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=80",
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState("");

  useEffect(() => {

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setListingsLoading(true);
        setListingsError("");
        const data = await apiService.getListings({ limit: 50 });
        const rows = Array.isArray(data?.listings) ? data.listings : [];
        if (isMounted) {
          setListings(rows);
        }
      } catch (e) {
        if (isMounted) {
          setListingsError(e?.message || 'Failed to load listings');
        }
      } finally {
        if (isMounted) {
          setListingsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const getListingImage = (l) => {
    const media = Array.isArray(l?.media) ? l.media : [];
    const first = media[0];
    if (first?.file_path) {
      return apiService.getFileUrl(first.file_path);
    }

    const location = String(l?.location || "");
    const key = Object.keys(investmentImages).find((k) => location.toLowerCase().includes(k.toLowerCase()));
    return investmentImages[key] || investmentImages["Sanpit"];
  };

  return (
    <div className="bg-slate-50 text-slate-900">

      {/* HERO SLIDER */}
      <section className="relative h-[70vh] min-h-\[460px] sm:min-h-\[520px] w-full overflow-hidden bg-black">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              idx === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="w-full px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight">
                {slides[activeIndex].title}
              </h1>
              <p className="mt-4 text-white/90 text-base md:text-lg max-w-2xl">
                {slides[activeIndex].subtitle}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/Investments"
                  className="bg-blue-800 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition"
                >
                  View Land Opportunities
                </Link>
                <Link
                  to="/About"
                  className="border border-white/70 text-white px-6 py-3 rounded-lg text-center font-semibold hover:bg-white/10 transition"
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-blue-800/10 hover:bg-blue-800/20 text-white border border-blue-800/20 backdrop-blur flex items-center justify-center"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-blue-800/10 hover:bg-blue-800/20 text-white border border-blue-800/20 backdrop-blur flex items-center justify-center"
        >
          ›
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === activeIndex ? "w-8 bg-blue-800" : "w-2.5 bg-blue-800/50 hover:bg-blue-800/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ACTIVE LAND INVESTMENT (Static Steps) */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <h2 className="text-center text-3xl font-semibold mb-12">
            What LandInvest Do
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              ["🌱", "Land Listed", "Owners list verified land projects."],
              ["🧩", "Split into Fractions", "Affordable fractional shares created."],
              ["👥", "Investors Commit", "Individuals buy land shares."],
              ["✅", "Project Closes", "Once funded, land is secured."]
            ].map(([icon, title, desc], i) => (
              <div
                key={i}
                className="group relative{} p-6 rounded-xl bg-gray-50
                         shadow-sm transition-all duration-300 ease-out
                         hover:-translate-y-3 hover:scale-105 hover:shadow-xl
                         hover:shadow-sky-200/40 relative"
              >
                <div className="absolute inset-x-6 bottom-0 h-2 bg-sky-300 blur-xl opacity-0 hover:opacity-70 transition"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{icon}</div>
                  <h4 className="font-semibold">{title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTMENT CARDS */}
      <section className="bg-gray-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <h2 className="text-center text-3xl font-semibold mb-12">
            Active Land Investment Opportunities
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {listingsError ? (
              <div className="col-span-full bg-white rounded-xl border border-red-100 shadow-sm p-6 text-sm text-red-700 font-semibold">
                {listingsError}
              </div>
            ) : listingsLoading ? (
              <div className="col-span-full bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-sm text-slate-700 font-semibold">
                Loading listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-sm text-slate-700 font-semibold text-center">
                New investments coming soon
              </div>
            ) : listings.map((l, i) => {
              const totalFractions = Number(l?.fractions) || 0;
              const investedFromApi = Number(l?.invested_fractions ?? l?.investedFractions);
              const availableFromApi = Number(l?.available_fractions ?? l?.availableFractions);

              const funded = Number.isFinite(investedFromApi)
                ? investedFromApi
                : Math.round(((Number(l?.progress) || 0) / 100) * totalFractions);

              const available = Number.isFinite(availableFromApi)
                ? Math.max(0, availableFromApi)
                : Math.max(0, totalFractions - Math.max(0, funded));

              const daysLeft = Number(l?.days_left ?? l?.daysLeft ?? l?.duration_days ?? 0);
              const targetLabel = formatFcfa(l?.target_amount ?? l?.targetAmount);
              const image = getListingImage(l);

              return (
                <div
                  key={l.id || i}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden
                         transition-all duration-300 ease-out transform
                         hover:-translate-y-3 hover:scale-105 hover:shadow-xl
                         hover:shadow-sky-200/40 relative"
                >
                  {available <= 5 && available > 0 && (
                    <div className="absolute left-0 top-0 z-20 pointer-events-none">
                      <div className="origin-top-left -rotate-12 -translate-x-10 translate-y-4 bg-red-600 text-white font-extrabold uppercase tracking-wider text-xs px-12 py-2 shadow-lg">
                        Soon Gone
                      </div>
                    </div>
                  )}
                  <img src={image} className="h-48 w-full object-cover" alt={`Land in ${l.location}`} />

                  <div className="p-5 relative z-10">
                    <h3 className="font-semibold text-lg">{l.title || `Land in ${l.location}`}</h3>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{Math.max(0, daysLeft)} Days Left</span>
                      <span className="font-medium">{targetLabel}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                      <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Price per fraction</span>
                      <span className="text-sm font-extrabold text-blue-900">
                        {formatFcfa((Number(l?.target_amount ?? l?.targetAmount) || 0) / (totalFractions || 1))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                      <div
                        className="bg-blue-800 h-3 rounded-full"
                        style={{ width: `${totalFractions > 0 ? (funded / totalFractions) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {funded}/{totalFractions} Fractions Funded
                      {totalFractions > 0 ? ` • ${available} Fractions Left` : ""}
                    </p>

                    {/* LINKED TO INVESTMENT DETAIL PAGE */}
                    <Link to={`/investments/${l.id}`} className="mt-5 block text-center w-full py-2 rounded-md font-semibold text-white bg-blue-800 hover:bg-blue-700 transition">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <h2 className="text-center text-3xl font-semibold mb-12">Why Choose LandInvest?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 text-center">
            <div>
              <h4 className="font-semibold">🔍 Transparency</h4>
              <p className="text-gray-600 mt-2">Clear information on all projects and processes.</p>
            </div>
            <div>
              <h4 className="font-semibold">🤝 Collective Power</h4>
              <p className="text-gray-600 mt-2">Pool funds to invest in larger land opportunities.</p>
            </div>
            <div>
              <h4 className="font-semibold">💰 Lower Entry Barrier</h4>
              <p className="text-gray-600 mt-2">Start investing with a small amount.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}