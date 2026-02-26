import { useEffect, useState } from "react";
import API from "../../api/axios";

function OwnerMenu() {
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("veg");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setImageFile(null);
    setName("");
    setCategory("veg");
    setPrice("");
    setIsAvailable(true);
    setEditingId(null);
  };

  const fetchMenuItems = async () => {
    setItemsLoading(true);
    try {
      const res = await API.get("/menu/owner");
      setMenuItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !price) {
      setError("Name and price are required.");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("name", name.trim());
    formData.append("category", category); // "veg" or "non-veg"
    formData.append("price", numericPrice);
    formData.append("isAvailable", String(isAvailable));

    try {
      setLoading(true);
      if (editingId) {
        await API.put(`/menu/${editingId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Menu item updated successfully.");
      } else {
        await API.post("/menu", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Menu item created successfully.");
      }

      resetForm();
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create menu item.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setName(item.name || "");
    setCategory(item.category || "veg");
    setPrice(item.price != null ? String(item.price) : "");
    setIsAvailable(item.isAvailable ?? true);
    setImageFile(null);
    setSuccess(null);
    setError(null);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await API.delete(`/menu/${id}`);
      if (editingId === id) {
        resetForm();
      }
      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete menu item.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu</h1>
      <p className="text-gray-600 mb-6">Add new items to your restaurant menu.</p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-xl mb-8">
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Margherita Pizza"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="flex gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value="veg"
                  checked={category === "veg"}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-4 w-4 text-green-600 border-gray-300"
                />
                <span className="text-gray-700">Veg</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value="non-veg"
                  checked={category === "non-veg"}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-4 w-4 text-red-600 border-gray-300"
                />
                <span className="text-gray-700">Non-veg</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="E.g. 199"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isAvailable"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4 text-red-600 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-700">
              Available
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Saving..." : editingId ? "Update menu item" : "Add menu item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="ml-3 inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your menu items</h2>

        {itemsLoading ? (
          <p className="text-sm text-gray-500">Loading menu items…</p>
        ) : menuItems.length === 0 ? (
          <p className="text-sm text-gray-500">No menu items yet. Add your first item above.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {menuItems.map((item) => (
              <li key={item._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded object-cover border border-gray-200"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.category} · ₹{item.price} ·{" "}
                      {item.isAvailable ? "Available" : "Not available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item._id)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default OwnerMenu;

