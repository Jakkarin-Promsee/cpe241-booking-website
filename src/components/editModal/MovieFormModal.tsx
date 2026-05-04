import { useRef, useState } from "react";

function MovieFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    genre: initialData?.genre || "",
    duration: initialData?.duration || "",
    description: initialData?.description || "",
    releaseDate: initialData?.releaseDate || "",
    poster: initialData?.poster || null,
  });

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, poster: file }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const isEdit = !!initialData;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-200 px-5 py-4 border-b border-neutral-300">
          <h2 className="text-lg font-bold text-neutral-900">
            {isEdit ? "Edit Movie Detail" : "Add / Edit Movie Detail"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4 bg-white">
          {/* Movie Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-700">Movie Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400 transition"
            />
          </div>

          {/* Genre + Duration */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">Genre</label>
              <input
                type="text"
                value={form.genre}
                onChange={handleChange("genre")}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">Duration (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={handleChange("duration")}
                min={0}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={4}
              placeholder=""
              className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400 transition resize-none"
            />
          </div>

          {/* Release Date + Upload Poster */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">Release Date</label>
              <input
                type="date"
                value={form.releaseDate}
                onChange={handleChange("releaseDate")}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">
                Upload Poster image
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 transition text-center truncate"
              >
                {form.poster ? (form.poster.name ?? "img.png") : "img.png"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-neutral-100 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded border border-neutral-400 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieFormModal;
