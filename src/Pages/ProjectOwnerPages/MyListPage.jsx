import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Eye, Download, Mail, Phone, Users, TrendingUp, Calendar, MapPin, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

const MyListPage = () => {
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role");

  const mapStatus = useCallback((status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'active') return 'Active';
    if (s === 'funded') return 'Completed';
    if (s === 'closed') return 'Pending';
    return status || 'Active';
  }, []);

  const formatFcfa = useCallback((value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0 FCFA';
    return `${Math.round(num).toLocaleString('en-US')} FCFA`;
  }, []);

  const mapListing = useCallback((l) => {
    const total = Number(l?.fractions) || 0;
    const investments = Array.isArray(l?.investments) ? l.investments : [];
    const funded = investments.reduce((sum, inv) => sum + (Number(inv?.fractions) || 0), 0);
    const createdAt = l?.created_at ? new Date(l.created_at) : null;

    const investmentCount = investments.length;

    return {
      id: l.id,
      title: l.title,
      location: l.location,
      target: formatFcfa(l.target_amount ?? l.targetAmount),
      fractions: `${Math.max(0, funded)} / ${Math.max(0, total)}`,
      progress: Number(l?.progress) || 0,
      status: mapStatus(l.status),
      createdDate: createdAt ? createdAt.toISOString().slice(0, 10) : '',
      daysLeft: Number(l?.days_left ?? l?.daysLeft ?? 0),
      maxDays: Number(l?.max_days ?? l?.maxDays ?? 180),
      investors: Array.from({ length: investmentCount }).map((_, idx) => ({
        id: idx + 1,
        name: '',
        email: '',
        phone: '',
        fractions: 0,
        amount: '0 FCFA',
        investedDate: ''
      })),
      __raw: l,
    };
  }, [formatFcfa, mapStatus]);

  const loadMyListings = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');

      const data = await apiService.getMyListings();
      const listings = Array.isArray(data?.listings) ? data.listings : [];
      setMyListings(listings.map(mapListing));
    } catch (e) {
      setLoadError(e?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [mapListing]);

  const extendDuration = async (listingId) => {
    try {
      await apiService.extendListingDuration(listingId, 30);
      await loadMyListings();
    } catch (e) {
      setLoadError(e?.message || 'Failed to extend listing duration');
    }
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/project-owner-login");
      return;
    }

    if (role !== "projectOwner") {
      navigate("/");
      return;
    }

    loadMyListings();
  }, [isAuthed, role, navigate, loadMyListings]);

  if (!isAuthed || role !== "projectOwner") return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-800';
      case 'Completed':
        return 'bg-blue-50 text-blue-800';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* --- Hero Banner --- */}
      <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80")' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-10 max-w-6xl mx-auto">
          <button 
            onClick={() => navigate('/project-owners-dashboard')}
            className="flex items-center text-white text-xs font-medium mb-3 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Project Owners
          </button>
          <h1 className="text-4xl font-bold text-white drop-shadow-sm">My List</h1>
          <p className="text-white/90 mt-2">Manage your land opportunities and view investor details</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8 -mt-12 relative z-20">
        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Listings</p>
                <p className="text-2xl font-bold text-slate-900">{myListings.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Listings</p>
                <p className="text-2xl font-bold text-slate-900">{myListings.filter(l => l.status === 'Active').length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Investors</p>
                <p className="text-2xl font-bold text-slate-900">{myListings.reduce((acc, l) => acc + l.investors.length, 0)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{myListings.filter(l => l.status === 'Completed').length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* --- My Listings with Investor Details --- */}
        <div className="space-y-6">
          {loadError && (
            <div className="bg-white rounded-xl shadow-md border border-red-100 p-6 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-sm text-slate-600">
              Loading your listings...
            </div>
          ) : myListings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">No listings yet</p>
                  <p className="text-sm text-slate-600 mt-1">Create your first listing from the dashboard.</p>
                </div>
                <button
                  onClick={() => navigate('/project-owners-dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Listing
                </button>
              </div>
            </div>
          ) : myListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              {/* Listing Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate(`/my-list/${listing.id}`)}
                      className="text-left"
                    >
                      <h3 className="text-xl font-bold text-slate-900 hover:underline">{listing.title}</h3>
                    </button>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created: {listing.createdDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {listing.daysLeft} days left
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Target</p>
                      <p className="text-lg font-bold text-slate-900">{listing.target}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Funding Progress</span>
                    <span className="font-bold text-slate-900">{listing.fractions} fractions</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-linear-to-r from-blue-500 to-blue-600 h-full transition-all duration-300" 
                      style={{ width: `${listing.progress}%` }} 
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{listing.progress}% funded</p>
                </div>
              </div>

              {/* Investors Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-slate-900">
                    Investors ({listing.investors.length})
                  </h4>
                  <div className="flex gap-2">
                    {listing.status === 'Active' && listing.daysLeft < listing.maxDays && (
                      <button 
                        onClick={() => extendDuration(listing.id)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                        title="Extend duration by 30 days"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => navigate(`/my-list/${listing.id}`)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Investors Table */}
                <div className="overflow-x-auto">
                  {listing.investors.length === 0 ? (
                    <div className="text-sm text-slate-600 py-4">No investors yet.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                        <tr>
                          <th className="px-4 py-3">Investor</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Fractions</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {listing.investors.map((investor) => (
                          <tr key={investor.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-slate-900">{investor.name || 'Investor'}</p>
                                <p className="text-xs text-slate-500">ID: INV00{investor.id}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                  <Mail className="w-3 h-3" />
                                  {investor.email || '-'}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                  <Phone className="w-3 h-3" />
                                  {investor.phone || '-'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-bold text-slate-900">{investor.fractions}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-bold text-green-600">{investor.amount}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-slate-600">{investor.investedDate}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">
                      Total from {listing.investors.length} investors
                    </p>
                    <p className="text-lg font-bold text-green-600">0 FCFA</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyListPage;
