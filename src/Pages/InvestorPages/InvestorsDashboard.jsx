import React, { useEffect, useMemo, useState } from "react";
import { Leaf, Coins, Compass, Facebook, Twitter, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";

const InvestorsDashboard = () => {
  const navigate = useNavigate();

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (!isAuthed || role !== "investor") return;

    let isMounted = true;

    const load = async (isBackground = false) => {
      try {
        if (!isBackground) {
          setLoading(true);
        }
        setLoadError("");
        const data = await apiService.getMyInvestments({ limit: 50 });
        const rows = Array.isArray(data?.investments) ? data.investments : [];
        if (isMounted) {
          setInvestments(rows);
        }
      } catch (e) {
        if (isMounted) {
          setLoadError(e?.message || "Failed to load investments");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load(false);
    const interval = setInterval(() => load(true), 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthed, role]);

  const formatFcfa = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "0 FCFA";
    return `${Math.round(num).toLocaleString("en-US")} FCFA`;
  };

  const tableRows = useMemo(() => {
    return investments.map((inv) => {
      const listing = inv?.listing || {};
      const progress = Math.max(0, Math.min(100, Number(listing?.progress) || 0));
      const statusRaw = String(inv?.status || listing?.status || "").toLowerCase();

      const listingStatus = String(listing?.status || "").toLowerCase();
      const daysLeft = Number(listing?.days_left ?? listing?.daysLeft ?? 0);

      const isClosedByListing = listingStatus === "funded" || listingStatus === "expired" || daysLeft <= 0 || progress >= 100;
      const isClosedByInvestment = statusRaw === "confirmed" ? isClosedByListing : statusRaw !== "pending";
      const isClosed = isClosedByInvestment;

      const statusLabel = statusRaw === "confirmed"
        ? (isClosedByListing ? "Funded" : "Confirmed")
        : statusRaw === "pending"
          ? "Pending"
          : statusRaw
            ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)
            : "Active";

      const statusColor = isClosed
        ? "bg-gray-200 text-gray-600"
        : "bg-blue-100 text-blue-700";

      return {
        id: inv?.id,
        title: listing?.title || "Untitled Listing",
        location: listing?.location || "",
        target: formatFcfa(listing?.target_amount),
        progress,
        status: statusLabel,
        date: inv?.created_at ? new Date(inv.created_at).toLocaleDateString() : "",
        statusColor,
        isClosed,
      };
    });
  }, [investments]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const byTab =
      activeTab === "active"
        ? tableRows.filter((r) => !r.isClosed)
        : activeTab === "closed"
          ? tableRows.filter((r) => r.isClosed)
          : tableRows;

    if (!normalizedQuery) return byTab;

    return byTab.filter((r) => {
      const haystack = `${r.title} ${r.location} ${r.status}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeTab, searchQuery, tableRows]);

  const overview = useMemo(() => {
    const total = tableRows.length;
    const activeCount = tableRows.filter((r) => !r.isClosed).length;
    const closedCount = total - activeCount;
    return { total, activeCount, closedCount };
  }, [tableRows]);

  if (!isAuthed || role !== "investor") return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- Hero Banner --- */}
      <div
        className="relative h-56 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-8">
          <p className="text-white text-sm mb-2">‹ Dashboard</p>
          <h1 className="text-3xl font-bold text-white">
            Investor Dashboard
          </h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-8 -mt-10 relative z-20">
        
        {/* --- Summary Cards --- */}
        <section>
          <h2 className="text-xl font-bold mb-6">Investment Overview</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Total Participations",
                desc: `${overview.total} Land investment participations`,
                icon: <Coins className="text-yellow-600" />,
              },
              {
                title: "Active Investments",
                desc: `${overview.activeCount} currently growing land assets`,
                icon: <Leaf className="text-blue-600" />,
              },
              {
                title: "Closed Investments",
                desc: `${overview.closedCount} fully funded or closed projects`,
                icon: <Compass className="text-orange-600" />,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-xl shadow-sm border flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-2xl">
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Investments Table --- */}
        <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">My Investments</h2>
            <div className="flex gap-4 text-sm font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-500 hover:text-blue-700"}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={activeTab === "active" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-500 hover:text-blue-700"}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("closed")}
                className={activeTab === "closed" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-500 hover:text-blue-700"}
              >
                Closed
              </button>
            </div>
          </div>

          <div className="px-6 py-4 border-b bg-white">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, or status..."
              className="w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
            />
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Land Title</th>
                <th className="px-6 py-4 font-semibold">Target Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date Committed</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loadError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm font-semibold text-red-700">
                    {loadError}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm font-semibold text-gray-600">
                    Loading investments...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm font-semibold text-gray-600">
                    No investments yet.
                  </td>
                </tr>
              ) : filteredRows.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{inv.title}</td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold mb-2">
                      {inv.target}
                    </div>
                    <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${inv.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {inv.progress}% funded
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${inv.statusColor}`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {inv.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default InvestorsDashboard;