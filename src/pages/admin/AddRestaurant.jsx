import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await API.get("/admin/users");
        console.log(res);

        const candidates = Array.isArray(res.data) ? res.data : [];
        setOwners(candidates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    console.log(formData);

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
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: "Restaurant Created Successfully",
            type: "success",
          },
        }),
      );
      navigate("/admin/restaurants");
    } catch (err) {
      console.log("FULL ERROR:", err.response);
      console.log("ERROR DATA:", err.response?.data);
      setError(err.response?.data?.message || "Error creating restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Restaurant</h2>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant owner
          </label>
          <select
            name="ownerId"
            value={formData.ownerId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select an owner</option>
            {loadingOwners ? (
              <option disabled>Loading users…</option>
            ) : (
              owners
                .filter(
                  (user) =>
                    user.role !== "admin" &&
                    user.role !== "restaurant_owner" &&
                    user.role !== "delivery_partner",
                )
                .map((user) => {
                  return (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  );
                })
              // owners.map((user) => (
              //   <option key={user._id} value={user._id}>
              //     {user.name} ({user.email})
              //   </option>
              // ))
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select any existing user. They will become{" "}
            <span className="font-semibold">restaurant_owner</span> after
            creation.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant name
          </label>
          <input
            type="text"
            name="restaurant_name"
            placeholder="Restaurant Name"
            value={formData.restaurant_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="restaurant_address"
            placeholder="Restaurant Address"
            value={formData.restaurant_address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact number
          </label>
          <input
            type="tel"
            name="restaurant_contact"
            placeholder="Restaurant contact"
            value={formData.restaurant_contact}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery pincodes
          </label>
          <input
            type="text"
            name="restaurant_deliveryPincodes"
            placeholder="e.g. 400001, 400002, 400003"
            value={formData.restaurant_deliveryPincodes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter comma-separated pincodes where this restaurant delivers.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated preparation time (minutes)
          </label>
          <input
            type="number"
            min="5"
            name="preparationTime"
            placeholder="e.g. 30"
            value={formData.preparationTime}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional. Used as the restaurant cover/photo.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create Restaurant"}
        </button>
      </form>
    </div>
  );
};

export default AddRestaurant;
