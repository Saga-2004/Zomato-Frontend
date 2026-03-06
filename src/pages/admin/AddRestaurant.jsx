import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";

function FormField({ label, hint, icon, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <svg
            className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        )}
        {children}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

const inputCls = (hasIcon = true) =>
  `w-full ${hasIcon ? "pl-10" : "pl-4"} pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 focus:bg-white transition`;

const AddRestaurant = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerId: "",
    restaurant_name: "",
    restaurant_address: "",
    restaurant_contact: "",
    restaurant_deliveryPincodes: "",
    preparationTime: "",
  });
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await API.get("/admin/users");
        setOwners(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await API.post(
        "/restaurants",
        {
          ...formData,
          image: imageFile,
          preparationTime: formData.preparationTime
            ? Number(formData.preparationTime)
            : undefined,
        },
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: "Restaurant created successfully!",
            type: "success",
          },
        }),
      );
      navigate("/admin/restaurants");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  const eligibleOwners = owners.filter(
    (u) =>
      u.role !== "admin" &&
      u.role !== "restaurant_owner" &&
      u.role !== "delivery_partner",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/restaurants"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors group mb-4"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to restaurants
        </Link>
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
          Management
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Add Restaurant
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <svg
                    className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4m0 4h.01" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Owner */}
                <FormField
                  label="Restaurant Owner"
                  hint="This user will be promoted to restaurant_owner after creation."
                  icon={
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  }
                >
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    required
                    className={`${inputCls()} appearance-none`}
                  >
                    <option value="">Select an owner…</option>
                    {loadingOwners ? (
                      <option disabled>Loading users…</option>
                    ) : (
                      eligibleOwners.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))
                    )}
                  </select>
                  <svg
                    className="w-4 h-4 text-gray-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </FormField>

                {/* Name */}
                <FormField
                  label="Restaurant Name"
                  icon={<path d="M3 22V11l9-9 9 9v11" />}
                >
                  <input
                    type="text"
                    name="restaurant_name"
                    placeholder="e.g. The Golden Fork"
                    value={formData.restaurant_name}
                    onChange={handleChange}
                    required
                    className={inputCls()}
                  />
                </FormField>

                {/* Address */}
                <FormField
                  label="Address"
                  icon={
                    <>
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </>
                  }
                >
                  <input
                    type="text"
                    name="restaurant_address"
                    placeholder="123 Main St, City"
                    value={formData.restaurant_address}
                    onChange={handleChange}
                    required
                    className={inputCls()}
                  />
                </FormField>

                {/* Contact */}
                <FormField
                  label="Contact Number"
                  icon={
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  }
                >
                  <input
                    type="tel"
                    name="restaurant_contact"
                    placeholder="+91 98765 43210"
                    value={formData.restaurant_contact}
                    onChange={handleChange}
                    required
                    className={inputCls()}
                  />
                </FormField>

                {/* Pincodes */}
                <FormField
                  label="Delivery Pincodes"
                  hint="Comma-separated list of pincodes where this restaurant delivers."
                  icon={
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </>
                  }
                >
                  <input
                    type="text"
                    name="restaurant_deliveryPincodes"
                    placeholder="400001, 400002, 400003"
                    value={formData.restaurant_deliveryPincodes}
                    onChange={handleChange}
                    className={inputCls()}
                  />
                </FormField>

                {/* Prep time */}
                <FormField
                  label="Preparation Time (minutes)"
                  icon={
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </>
                  }
                >
                  <input
                    type="number"
                    min="5"
                    name="preparationTime"
                    placeholder="e.g. 30"
                    value={formData.preparationTime}
                    onChange={handleChange}
                    className={inputCls()}
                  />
                </FormField>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold text-sm rounded-xl hover:bg-red-600 disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
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
                        Create Restaurant
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Image upload sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Restaurant Image
            </p>
            <label className="block cursor-pointer">
              <div
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${imagePreview ? "border-red-200" : "border-gray-200 hover:border-red-300 hover:bg-red-50"}`}
                style={{ aspectRatio: "4/3" }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 text-center font-medium">
                      Click to upload photo
                    </p>
                    <p className="text-[10px] text-gray-300">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <p className="text-white text-xs font-semibold">
                      Change image
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="mt-3 w-full text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Remove image
              </button>
            )}
            <p className="text-xs text-gray-400 mt-3">
              Optional. Used as the restaurant cover photo across the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
