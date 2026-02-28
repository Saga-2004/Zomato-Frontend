import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    homeAddress: "",
    workAddress: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/users/profile");
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      homeAddress: profile.savedAddresses?.home || "",
      workAddress: profile.savedAddresses?.work || "",
    });
  }, [profile]);

  const handleAvailabilityChange = async (nextStatus) => {
    if (!profile) return;
    if (profile.availabilityStatus === nextStatus) return;
    setUpdatingAvailability(true);
    try {
      const res = await API.put("/users/profile/availability", {
        availabilityStatus: nextStatus,
      });
      setProfile((prev) =>
        prev
          ? { ...prev, availabilityStatus: res.data?.availabilityStatus }
          : prev,
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to update availability.",
            type: "error",
          },
        }),
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        savedAddresses: {
          home: form.homeAddress,
          work: form.workAddress,
        },
      };
      const res = await API.put("/users/profile", payload);
      setProfile(res.data);
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: "Profile updated successfully.",
            type: "success",
          },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to update profile.",
            type: "error",
          },
        }),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const roleLabel = (role) => {
    const labels = {
      admin: "Admin",
      customer: "Customer",
      restaurant_owner: "Restaurant Owner",
      delivery_partner: "Delivery Partner",
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
            Loading…
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : profile ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {roleLabel(profile.role)}
                  </p>
                  {profile.isBlocked && (
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800">
                      Account suspended
                    </span>
                  )}
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleFieldChange("name")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Email
                  </label>
                  <div className="text-gray-900 text-sm py-2">
                    {profile.email || "—"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={handleFieldChange("phone")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={handleFieldChange("address")}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm resize-none"
                    placeholder="Your primary delivery address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Home address
                    </label>
                    <textarea
                      value={form.homeAddress}
                      onChange={handleFieldChange("homeAddress")}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm resize-none"
                      placeholder="Saved 'Home' address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Work address
                    </label>
                    <textarea
                      value={form.workAddress}
                      onChange={handleFieldChange("workAddress")}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm resize-none"
                      placeholder="Saved 'Work' address"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                  <p className="text-gray-900 text-sm">
                    {roleLabel(profile.role)}
                  </p>
                </div>
                {profile.role === "delivery_partner" && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Availability
                    </dt>
                    <dd className="mt-1 flex items-center gap-3">
                      <span className="text-gray-900 text-sm">
                        {(profile.availabilityStatus || "offline")
                          .charAt(0)
                          .toUpperCase() +
                          (profile.availabilityStatus || "offline").slice(1)}
                      </span>
                      <div className="inline-flex rounded-full bg-gray-100 p-1">
                        <button
                          type="button"
                          onClick={() => handleAvailabilityChange("online")}
                          disabled={updatingAvailability}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            (profile.availabilityStatus || "offline") ===
                            "online"
                              ? "bg-green-500 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Online
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAvailabilityChange("offline")}
                          disabled={updatingAvailability}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            (profile.availabilityStatus || "offline") ===
                            "offline"
                              ? "bg-gray-800 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          Offline
                        </button>
                      </div>
                    </dd>
                  </div>
                )}
                {profile.createdAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Member since
                    </p>
                    <p className="text-gray-900 text-sm">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Profile;
