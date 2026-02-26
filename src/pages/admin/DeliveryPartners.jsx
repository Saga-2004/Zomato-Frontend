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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/admin/delivery-partners", form);
      setForm({ name: "", email: "", password: "", phone: "" });
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
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to create delivery partner",
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
    try {
      await API.delete(`/admin/delivery-partners/${id}`);
      setPartners((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message:
              err.response?.data?.message ||
              err.message ||
              "Failed to remove delivery partner",
            type: "error",
          },
        }),
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Delivery Partners
      </h1>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Name"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Password"
            required
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="Phone (optional)"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
        >
          {submitting ? "Creating…" : "Add Delivery Partner"}
        </button>
      </form>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Loading partners…
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No delivery partners found.
        </div>
      ) : (
        <ul className="space-y-3">
          {partners.map((partner) => (
            <li
              key={partner._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">{partner.name}</p>
                <p className="text-gray-500 text-sm">{partner.email}</p>
                {partner.phone && (
                  <p className="text-gray-400 text-xs mt-0.5">
                    {partner.phone}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(partner._id)}
                className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DeliveryPartners;
