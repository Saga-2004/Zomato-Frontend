import { useEffect, useRef, useState } from "react";
import API from "../../api/axios";

const inputCls =
  "w-full bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition";
const labelCls =
  "block text-[11px] font-bold uppercase tracking-widest text-[#4A3F34] mb-1.5";

function MenuSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-[#F4EFE6] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-[#F4EFE6] rounded-full w-2/5" />
        <div className="h-3 bg-[#F4EFE6] rounded-full w-1/3" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="w-14 h-8 bg-[#F4EFE6] rounded-xl" />
        <div className="w-14 h-8 bg-[#F4EFE6] rounded-xl" />
      </div>
    </div>
  ));
}

function OwnerMenu() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("veg");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [variants, setVariants] = useState([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setName("");
    setCategory("veg");
    setPrice("");
    setIsAvailable(true);
    setEditingId(null);
    setVariants([]);
    setVariantName("");
    setVariantPrice("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || (variants.length === 0 && !price)) {
      setError("Name and price or at least one variant are required.");
      return;
    }
    if (variants.length > 0 && price) {
      setError("You can only set a single price or variants, not both.");
      return;
    }
    const numericPrice = Number(price);
    if (price && (Number.isNaN(numericPrice) || numericPrice <= 0)) {
      setError("Price must be a positive number.");
      return;
    }
    for (const v of variants) {
      if (!v.name.trim() || !v.price || Number(v.price) <= 0) {
        setError("Each variant must have a name and positive price.");
        return;
      }
    }

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    formData.append("name", name.trim());
    formData.append("category", category);
    formData.append("isAvailable", String(isAvailable));
    if (variants.length > 0) {
      formData.append(
        "variants",
        JSON.stringify(
          variants.map((v) => ({
            name: v.name.trim(),
            price: Number(v.price),
          })),
        ),
      );
    } else {
      formData.append("price", numericPrice);
    }

    try {
      setLoading(true);
      if (editingId) {
        await API.put(`/menu/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Menu item updated successfully.");
      } else {
        await API.post("/menu", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Menu item added to your menu!");
      }
      resetForm();
      fetchMenuItems();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save menu item.",
      );
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    if (!variantName.trim() || !variantPrice || Number(variantPrice) <= 0)
      return;
    setVariants([
      ...variants,
      { name: variantName.trim(), price: Number(variantPrice) },
    ]);
    setVariantName("");
    setVariantPrice("");
  };

  const removeVariant = (idx) =>
    setVariants(variants.filter((_, i) => i !== idx));

  const startEdit = (item) => {
    setEditingId(item._id);
    setName(item.name || "");
    setCategory(item.category || "veg");
    setPrice(item.price != null ? String(item.price) : "");
    setIsAvailable(item.isAvailable ?? true);
    setImageFile(null);
    setImagePreview(item.image || null);
    setSuccess(null);
    setError(null);
    setVariants(
      Array.isArray(item.variants)
        ? item.variants.map((v) => ({ name: v.name, price: String(v.price) }))
        : [],
    );
    setVariantName("");
    setVariantPrice("");
    // Scroll form into view on mobile
    setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await API.delete(`/menu/${id}`);
      if (editingId === id) resetForm();
      fetchMenuItems();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete menu item.",
      );
    }
  };

  const hasVariants = variants.length > 0;

  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-0.5">
          Owner
        </p>
        <h1
          className="text-2xl font-black text-gray-900 tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Menu Management
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Add, edit, and manage your restaurant's menu items.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-6 items-start">
        {/* ── Form card ── */}
        <div
          ref={formRef}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2
                className="font-black text-gray-900 tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {editingId ? "Edit Item" : "Add New Item"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {editingId
                  ? "Update the details below"
                  : "Fill in the details to add a new menu item"}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-xl transition"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Alerts */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-5 flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image upload */}
              <div>
                <label className={labelCls}>Item Image</label>
                <div
                  className="relative border-2 border-dashed border-[#EDE8DF] rounded-xl overflow-hidden hover:border-red-300 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">
                          Change image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-[#9C9088]">
                      <svg
                        className="w-8 h-8 mb-2 text-gray-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-sm font-medium text-gray-400">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>Item Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Margherita Pizza"
                  required
                  className={inputCls}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelCls}>Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "veg", label: "🥗 Veg", color: "emerald" },
                    { value: "non-veg", label: "🍗 Non-veg", color: "red" },
                  ].map(({ value, label, color }) => (
                    <label
                      key={value}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all
                        ${
                          category === value
                            ? color === "emerald"
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : "border-red-400 bg-red-50 text-red-600"
                            : "border-[#EDE8DF] bg-[#FBF7F0] text-[#9C9088] hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={category === value}
                        onChange={(e) => setCategory(e.target.value)}
                        className="hidden"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className={labelCls}>
                  Price (₹)
                  {hasVariants && (
                    <span className="ml-2 text-[10px] normal-case text-amber-500 font-normal tracking-normal">
                      Disabled — variants active
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 199"
                  required={!hasVariants}
                  disabled={hasVariants}
                  className={inputCls}
                />
              </div>

              {/* Variants */}
              <div>
                <label className={labelCls}>
                  Variants
                  <span className="ml-2 text-[10px] normal-case text-gray-400 font-normal tracking-normal">
                    optional — e.g. S, M, L
                  </span>
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="Name (S, M, L…)"
                    disabled={!!price}
                    className="flex-1 bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-3 py-2.5 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 disabled:opacity-50 transition"
                  />
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    placeholder="₹"
                    disabled={!!price}
                    className="w-20 bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-3 py-2.5 text-sm font-medium text-[#1A1208] placeholder-[#9C9088] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 disabled:opacity-50 transition"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!!price || !variantName.trim() || !variantPrice}
                    className="px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Add
                  </button>
                </div>

                {hasVariants && (
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full"
                      >
                        {v.name} · ₹{v.price}
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors text-gray-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {price && (
                  <p className="text-xs text-amber-500 mt-2 font-medium">
                    Clear the price field to enable variants.
                  </p>
                )}
              </div>

              {/* Availability toggle */}
              <div className="flex items-center justify-between bg-[#FBF7F0] border border-[#EDE8DF] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1A1208]">
                    Available for ordering
                  </p>
                  <p className="text-xs text-[#9C9088] mt-0.5">
                    Toggle off to temporarily hide from customers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0
                    ${isAvailable ? "bg-emerald-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isAvailable ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-300/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {loading
                    ? "Saving…"
                    : editingId
                      ? "Update item"
                      : "Add to menu"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-sm font-semibold text-gray-600 rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── Menu items list ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2
                className="font-black text-gray-900 tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Your Menu
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {itemsLoading
                  ? "Loading…"
                  : `${menuItems.length} item${menuItems.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchMenuItems}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              title="Refresh"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>

          <div className="px-6">
            {itemsLoading ? (
              <div className="divide-y divide-gray-50">
                <MenuSkeleton />
              </div>
            ) : menuItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">🍽️</div>
                <p
                  className="font-black text-gray-700 text-base mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  No items yet
                </p>
                <p className="text-sm text-gray-400">
                  Add your first menu item using the form.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {menuItems.map((item, idx) => (
                  <li
                    key={item._id}
                    className={`flex items-center gap-4 py-4 group animate-[fadeUp_0.35s_ease_both]`}
                    style={{ animationDelay: `${Math.min(idx * 40, 250)}ms` }}
                  >
                    {/* Image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-[#FBF7F0]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.style.opacity = "0.3";
                            e.currentTarget.style.filter = "grayscale(1)";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          {item.category === "veg" ? "🥗" : "🍗"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {/* Veg/non-veg dot */}
                        <span
                          className="w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0"
                          style={{
                            background:
                              item.category === "veg"
                                ? "rgba(22,163,74,0.1)"
                                : "rgba(239,68,68,0.08)",
                            border: `1.5px solid ${item.category === "veg" ? "rgba(22,163,74,0.4)" : "rgba(239,68,68,0.3)"}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background:
                                item.category === "veg" ? "#16A34A" : "#EF4444",
                            }}
                          />
                        </span>
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Price / variants */}
                        {Array.isArray(item.variants) &&
                        item.variants.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {item.variants.map((v, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full"
                              >
                                {v.name}: ₹{v.price}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span
                            className="text-sm font-black text-red-500"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            ₹{item.price}
                          </span>
                        )}

                        {/* Availability badge */}
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
                        >
                          {item.isAvailable ? "Available" : "Hidden"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all
                          ${
                            editingId === item._id
                              ? "bg-amber-50 border-amber-300 text-amber-700"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {editingId === item._id ? "Editing…" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item._id)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
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
      </div>
    </div>
  );
}

export default OwnerMenu;
