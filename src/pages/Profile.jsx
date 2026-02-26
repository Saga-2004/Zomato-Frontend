import { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

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

      <main className="max-w-xl mx-auto px-4 py-8">
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
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {profile.email || "—"}
                  </dd>
                </div>
                {profile.phone != null && profile.phone !== "" && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-gray-900 mt-0.5">{profile.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {roleLabel(profile.role)}
                  </dd>
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
                    <dt className="text-sm font-medium text-gray-500">
                      Member since
                    </dt>
                    <dd className="text-gray-900 mt-0.5">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Profile;
