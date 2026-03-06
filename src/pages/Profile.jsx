import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const ROLE_LABELS = {
  admin: "Admin",
  customer: "Customer",
  restaurant_owner: "Restaurant Owner",
  delivery_partner: "Delivery Partner",
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingAvail, setUpdatingAvail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    API.get("/users/profile")
      .then((r) => setProfile(r.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load profile."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
  }, [profile]);

  const handleAvail = async (next) => {
    if (!profile || profile.availabilityStatus === next) return;
    setUpdatingAvail(true);
    try {
      const res = await API.put("/users/profile/availability", {
        availabilityStatus: next,
      });
      setProfile((p) =>
        p ? { ...p, availabilityStatus: res.data?.availabilityStatus } : p,
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message || "Failed to update availability.",
            type: "error",
          },
        }),
      );
    } finally {
      setUpdatingAvail(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await API.put("/users/profile", {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      setProfile(res.data);
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Profile updated successfully.", type: "success" },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to update profile.",
            type: "error",
          },
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const isOnline = (profile?.availabilityStatus || "offline") === "online";
  const initials = profile?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-5 py-8 pb-24">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">
          Account
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
          My Profile
        </h1>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
            <div className="w-7 h-7 border-2 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">
              Loading profile…
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-14 text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Hero card */}
            <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden flex items-center gap-5">
              {/* Decorative blob */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-red-100 opacity-40 blur-3xl pointer-events-none" />
              {/* Avatar */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-white border-2 border-red-200 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-2xl font-bold text-red-500">
                  {initials}
                </span>
              </div>
              {/* Info */}
              <div className="relative z-10">
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {profile.name}
                </p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                  {ROLE_LABELS[profile.role] || profile.role}
                </p>
                {profile.isBlocked && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 uppercase tracking-wide">
                    ⚠ Account suspended
                  </span>
                )}
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
              <div className="p-5 sm:p-6">
                <form onSubmit={handleSave} className="space-y-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-100">
                    Personal Information
                  </p>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email address
                    </label>
                    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.email || "—"}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Delivery address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Your primary delivery address"
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition resize-none"
                    />
                  </div>

                  {/* Availability toggle — delivery partners only */}
                  {profile.role === "delivery_partner" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Availability
                      </label>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleAvail("online")}
                            disabled={updatingAvail}
                            className={`px-5 py-2 text-sm font-semibold transition-all duration-150 disabled:opacity-50 ${
                              isOnline
                                ? "bg-emerald-50 text-emerald-700 border-r border-emerald-200"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            Online
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAvail("offline")}
                            disabled={updatingAvail}
                            className={`px-5 py-2 text-sm font-semibold transition-all duration-150 disabled:opacity-50 ${
                              !isOnline
                                ? "bg-gray-100 text-gray-700"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            Offline
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span
                            className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}
                          />
                          <span
                            className={
                              isOnline ? "text-emerald-600" : "text-gray-400"
                            }
                          >
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta rows */}
                  <div className="pt-1 border-t border-gray-50 space-y-0">
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <span className="text-sm text-gray-400 font-medium">
                        Role
                      </span>
                      <span className="text-sm font-semibold text-gray-700">
                        {ROLE_LABELS[profile.role] || profile.role}
                      </span>
                    </div>
                    {profile.createdAt && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-400 font-medium">
                          Member since
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {new Date(profile.createdAt).toLocaleDateString(
                            "en-IN",
                            { dateStyle: "medium" },
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {saving && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default Profile;
