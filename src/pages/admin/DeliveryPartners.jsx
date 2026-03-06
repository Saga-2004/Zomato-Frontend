import { useEffect, useState } from "react";
import API from "../../api/axios";

function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/delivery-partners");
      setPartners(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/admin/delivery-partners", form);
      setForm({ name: "", email: "", password: "", phone: "" });
      setShowForm(false);
      await fetchPartners();
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Delivery partner created.", type: "success" },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to create partner",
            type: "error",
          },
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this delivery partner?")) return;
    setRemovingId(id);
    try {
      await API.delete(`/admin/delivery-partners/${id}`);
      setPartners((prev) => prev.filter((p) => p._id !== id));
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Delivery partner removed.", type: "success" },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to remove partner",
            type: "error",
          },
        }),
      );
    } finally {
      setRemovingId(null);
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const AVATAR_COLORS = [
    "from-blue-400 to-cyan-400",
    "from-violet-400 to-purple-400",
    "from-emerald-400 to-teal-400",
    "from-amber-400 to-orange-400",
    "from-pink-400 to-rose-400",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
            Management
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Delivery Partners
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((f) => !f)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
            showForm
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-red-500 text-white hover:bg-red-600 hover:shadow-md"
          }`}
        >
          {showForm ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Partner
            </>
          )}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
          <div className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              New Delivery Partner
            </h2>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  {
                    name: "name",
                    label: "Full name",
                    type: "text",
                    placeholder: "John Doe",
                    required: true,
                    icon: (
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    ),
                  },
                  {
                    name: "email",
                    label: "Email address",
                    type: "email",
                    placeholder: "john@example.com",
                    required: true,
                    icon: (
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    ),
                  },
                  {
                    name: "password",
                    label: "Password",
                    type: "password",
                    placeholder: "••••••••",
                    required: true,
                    icon: (
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ),
                  },
                  {
                    name: "phone",
                    label: "Phone (optional)",
                    type: "tel",
                    placeholder: "+91 98765 43210",
                    icon: (
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    ),
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <div className="relative">
                      <svg
                        className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        {field.icon}
                      </svg>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 shadow-sm transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Partner
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Partners list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2.5 pt-1">
                <div className="h-4 bg-gray-100 rounded-full w-32" />
                <div className="h-3 bg-gray-100 rounded-full w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-blue-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No delivery partners yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-red-500 text-sm hover:underline font-medium"
          >
            Add your first partner
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map((partner, idx) => {
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isRemoving = removingId === partner._id;
            return (
              <div
                key={partner._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:border-gray-200 transition-all duration-200"
              >
                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}
                >
                  {getInitials(partner.name)}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {partner.name}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {partner.email}
                  </p>
                  {partner.phone && (
                    <p className="text-gray-300 text-xs mt-0.5 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {partner.phone}
                    </p>
                  )}
                </div>
                {/* Status badge */}
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Active
                </span>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(partner._id)}
                  disabled={isRemoving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-50 shrink-0"
                >
                  {isRemoving ? (
                    <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DeliveryPartners;
