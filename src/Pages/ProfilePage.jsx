import React, { useEffect, useState } from "react";
import apiService from "../services/api";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await apiService.getUserProfile();
        const user = data?.user;
        if (isMounted && user) {
          setFullName(user.fullName || user.full_name || "");
          setEmail(user.email || "");
        }
      } catch (e) {
        if (isMounted) {
          setLoadError(e?.message || "Failed to load profile");
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

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!fullName.trim() && !email.trim()) {
      setSaveError("Please enter a name or email to update.");
      return;
    }

    try {
      setIsSavingProfile(true);
      const res = await apiService.updateUserProfile({
        fullName: fullName.trim(),
        email: email.trim(),
      });

      const updated = res?.user;
      if (updated) {
        localStorage.setItem("user", JSON.stringify(updated));
      }

      setSaveSuccess("Profile updated successfully.");
    } catch (e2) {
      setSaveError(e2?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSaveError("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setSaveError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSaveError("Passwords do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);
      await apiService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaveSuccess("Password updated successfully.");
    } catch (e2) {
      setSaveError(e2?.message || "Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-slate-600 mt-2">Manage your account details and security.</p>

        {loadError && (
          <div className="mt-6 bg-white rounded-xl border border-red-100 shadow-sm p-4 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {(saveError || saveSuccess) && (
          <div
            className={`mt-6 bg-white rounded-xl border shadow-sm p-4 text-sm ${
              saveError ? "border-red-100 text-red-700" : "border-green-100 text-green-700"
            }`}
          >
            {saveError || saveSuccess}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6">
          <form onSubmit={saveProfile} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900">Account</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Full name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="mt-6 h-11 px-5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>

          <form onSubmit={savePassword} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900">Security</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full h-11 rounded-lg border border-slate-200 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="mt-6 h-11 px-5 rounded-lg bg-blue-800 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
