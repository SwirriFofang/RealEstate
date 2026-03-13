import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MapPin, Calendar, TrendingUp } from "lucide-react";
import apiService from "../../services/api";
import landDouala from "../../assets/landDouala.png";
import landBomaka from "../../assets/OIP.webp";
import landSanpit from "../../assets/OIP.webp";
import landYaounde from "../../assets/landyaounde.png";
import landGreatSoppo from "../../assets/mo-land-for-sale_(7).jpg";
import landKumba from "../../assets/land.png";

const formatFcfa = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0 FCFA";
  return `${Math.round(num).toLocaleString("en-US")} FCFA`;
};

const listingImages = {
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
  const key = Object.keys(listingImages).find((k) =>
    String(location || "").toLowerCase().includes(k.toLowerCase())
  );
  return listingImages[key] || listingImages["Sanpit"];
};

export default function ProjectOwnerListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role");

  useEffect(() => {
    if (!isAuthed) {
      navigate("/project-owner-login");
      return;
    }

    if (role !== "projectOwner") {
      navigate("/");
    }
  }, [isAuthed, role, navigate]);

  useEffect(() => {
    if (!id) {
      setListing(null);
      setLoading(false);
      return;
    }

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

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const media = useMemo(() => (Array.isArray(listing?.media) ? listing.media : []), [listing]);
  const images = useMemo(() => media.filter((m) => m?.file_type === "image"), [media]);
  const heroImage = images?.[0]?.file_path
    ? apiService.getFileUrl(images[0].file_path)
    : getFallbackImage(listing?.location);

  if (!isAuthed || role !== "projectOwner") return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-slate-900">Loading listing...</h1>
        </div>
      </div>
    );
  }

  if (loadError || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-2xl p-6">
          <button
            type="button"
            onClick={() => navigate("/my-list")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to My List
          </button>
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {loadError || "Listing not found"}
          </div>
        </div>
      </div>
    );
  }

  const createdAt = listing?.created_at ? new Date(listing.created_at) : null;
  const daysLeft = Number(listing?.days_left ?? listing?.daysLeft ?? 0);
  const progress = Math.max(0, Math.min(100, Number(listing?.progress) || 0));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/my-list")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Back to My List
        </button>

        <div className="mt-4 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-64 w-full bg-slate-100">
            <img src={heroImage} alt={listing?.title || "Listing"} className="w-full h-full object-cover" />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{listing?.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {listing?.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Created: {createdAt ? createdAt.toISOString().slice(0, 10) : ""}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> {Math.max(0, daysLeft)} days left
                  </span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">Target</p>
                <p className="text-xl font-black text-slate-900">{formatFcfa(listing?.target_amount ?? listing?.targetAmount)}</p>
              </div>
            </div>

            {listing?.description ? (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-slate-900">Description</h2>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{listing.description}</p>
              </div>
            ) : null}

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Funding Progress</span>
                <span className="font-bold text-slate-900">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="bg-linear-to-r from-blue-500 to-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {images.length > 1 ? (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-slate-900">Photos</h2>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.slice(0, 8).map((img) => {
                    const src = img?.file_path ? apiService.getFileUrl(img.file_path) : "";
                    return (
                      <div key={img?.id || src} className="h-24 rounded-lg overflow-hidden bg-slate-100">
                        {src ? <img src={src} alt="Listing" className="w-full h-full object-cover" /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
