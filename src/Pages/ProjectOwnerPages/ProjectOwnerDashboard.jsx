import React, { useEffect, useState } from 'react';
import { Leaf, Facebook, Twitter, Instagram, Send, Eye, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

const ProjectOwnerDashboard = () => {
  const navigate = useNavigate();

  const isAuthed = localStorage.getItem("li_auth") === "true";
  const role = localStorage.getItem("li_role");

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    targetAmount: '',
    fractions: '',
    duration: '30',
    images: [],
    videos: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalInvestedFractions: 0,
  });

  const loadOwnerStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError('');

      const data = await apiService.getMyListings();
      const listings = Array.isArray(data?.listings) ? data.listings : [];

      const activeListings = listings.filter((l) => String(l?.status || '').toLowerCase() === 'active').length;
      const totalInvestedFractions = listings.reduce((sum, l) => {
        const investments = Array.isArray(l?.investments) ? l.investments : [];
        return sum + investments.reduce((s, inv) => s + (Number(inv?.fractions) || 0), 0);
      }, 0);

      setStats({
        totalListings: listings.length,
        activeListings,
        totalInvestedFractions,
      });
    } catch (e) {
      setStatsError(e?.message || 'Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length > 0) {
      const newImages = [...formData.images, ...validImages].slice(0, 5);
      const newPreviews = validImages.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({ ...prev, images: newImages }));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validVideos = files.filter(file => file.type.startsWith('video/'));
    
    if (validVideos.length > 0) {
      const newVideos = [...formData.videos, ...validVideos].slice(0, 3);
      const newPreviews = validVideos.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({ ...prev, videos: newVideos }));
      setVideoPreviews(prev => [...prev, ...newPreviews].slice(0, 3));
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const removeVideo = (index) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    
    setFormData(prev => ({ ...prev, videos: newVideos }));
    setVideoPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (submitting) return;

    try {
      setSubmitting(true);

      const targetAmount = Number(String(formData.targetAmount).replace(/[^0-9]/g, ''));
      const fractions = Number(formData.fractions);
      const duration = Number(formData.duration);

      const created = await apiService.createListing({
        title: formData.title,
        location: formData.location,
        description: formData.description,
        targetAmount,
        fractions,
        duration,
      });

      const listingId = created?.listing?.id;
      if (!listingId) {
        throw new Error('Listing created but no id returned');
      }

      const filesToUpload = [...(formData.images || []), ...(formData.videos || [])].filter(Boolean);
      if (filesToUpload.length > 0) {
        await apiService.uploadListingFiles(listingId, filesToUpload);
      }

      setFormData({
        title: '',
        location: '',
        description: '',
        targetAmount: '',
        fractions: '',
        duration: '30',
        images: [],
        videos: []
      });
      setImagePreviews([]);
      setVideoPreviews([]);

      alert('Land listing created successfully!');

      await loadOwnerStats();

      navigate('/my-list');
    } catch (error) {
      setSubmitError(error?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
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

    loadOwnerStats();
  }, [isAuthed, role, navigate]);

  if (!isAuthed || role !== "projectOwner") return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* --- Hero Banner --- */}
      <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80")' }}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 p-10 max-w-6xl mx-auto">
          <button className="flex items-center text-white text-xs font-medium mb-3 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Project Owners
          </button>
          <h1 className="text-4xl font-bold text-white drop-shadow-sm">Project Owner Dashboard</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-8 -mt-12 relative z-20">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <p className="text-sm font-medium text-slate-500">Total Listings</p>
            <p className="text-2xl font-bold text-slate-900">{statsLoading ? '...' : stats.totalListings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <p className="text-sm font-medium text-slate-500">Active Listings</p>
            <p className="text-2xl font-bold text-slate-900">{statsLoading ? '...' : stats.activeListings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <p className="text-sm font-medium text-slate-500">Fractions Funded (All Listings)</p>
            <p className="text-2xl font-bold text-slate-900">{statsLoading ? '...' : stats.totalInvestedFractions}</p>
          </div>
        </section>

        {statsError && (
          <div className="mb-10 bg-white rounded-xl shadow-md border border-red-100 p-4 text-sm text-red-700 font-semibold">
            {statsError}
          </div>
        )}

        {/* --- Create Land Listing Form --- */}
        <section className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-10">
          <h2 className="text-2xl font-bold mb-8 text-slate-700">Create Land Listing</h2>
          {submitError && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Land Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Land in Bomaka" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Bomaka, Buea" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe your land property, features, and potential uses..." 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              ></textarea>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Property Images</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('image-upload').click()}
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB (max 5 images)</p>
                  </div>
                  <input 
                    id="image-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    multiple
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Property Videos</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('video-upload').click()}
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Upload property videos</p>
                    <p className="text-xs text-slate-400">MP4, AVI up to 50MB (max 3 videos)</p>
                  </div>
                  <input 
                    id="video-upload"
                    type="file" 
                    className="hidden" 
                    accept="video/*" 
                    multiple
                    onChange={handleVideoUpload}
                  />
                </div>
              </div>
              
              {/* Video Previews */}
              {videoPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <video 
                        src={preview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVideo(index);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Target Amount (FCFA)</label>
                <input 
                  type="text" 
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  placeholder="20,000,000" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Number of Fractions</label>
                <input 
                  type="number" 
                  name="fractions"
                  value={formData.fractions}
                  onChange={handleInputChange}
                  placeholder="20" 
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Duration (Days)</label>
                <select 
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                >
                  <option value="30">30</option>
                  <option value="60">60</option>
                  <option value="90">90</option>
                  <option value="120">120</option>
                  <option value="150">150</option>
                  <option value="180">180</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can extend the duration if the target is not met. Maximum duration is 6 months (180 days).
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-lg bg-blue-800 text-white font-extrabold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? 'Creating listing...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </section>

        {/* --- Quick Actions --- */}
        <section className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-700">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/my-list')}
              className="flex items-center justify-center gap-3 p-6 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="font-bold text-slate-800">View My Listings</p>
                <p className="text-sm text-slate-600">Manage your properties and investors</p>
              </div>
            </button>
            <button className="flex items-center justify-center gap-3 p-6 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors">
              <Download className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="font-bold text-slate-800">Export Reports</p>
                <p className="text-sm text-slate-600">Export investor and funding data</p>
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectOwnerDashboard;