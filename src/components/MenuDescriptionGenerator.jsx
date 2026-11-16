import { useState } from "react";
import { generateMenuDescriptionAPI } from "../api/aiAPI";

function MenuDescriptionGenerator({ name, category, price, isVeg, onApply }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await generateMenuDescriptionAPI({
        name,
        category,
        price: price || null,
        isVeg,
      });
      setPreview(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading || !name.trim() || !category.trim()}
        className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 disabled:opacity-40 transition"
      >
        {loading && <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />}
        {loading ? "Generating…" : "✨ Generate with AI"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {preview && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">AI preview</p>
          <textarea
            value={preview.description}
            maxLength={300}
            onChange={(e) => setPreview({ ...preview, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
          />
          <input
            value={preview.tags.join(", ")}
            onChange={(e) => setPreview({ ...preview, tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8) })}
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
            placeholder="Tags"
          />
          <select
            value={preview.spiceLevel}
            onChange={(e) => setPreview({ ...preview, spiceLevel: e.target.value })}
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
          >
            <option value="mild">Mild</option>
            <option value="medium">Medium</option>
            <option value="spicy">Spicy</option>
          </select>
          <input
            value={preview.allergens.join(", ")}
            onChange={(e) => setPreview({ ...preview, allergens: e.target.value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 8) })}
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
            placeholder="Allergens"
          />
          <p className="text-[11px] text-amber-800">AI suggestion, please verify before publishing.</p>
          <button type="button" onClick={() => onApply(preview)} className="w-full rounded-lg bg-amber-600 text-white py-2 text-sm font-bold hover:bg-amber-700">
            Apply to form
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuDescriptionGenerator;
