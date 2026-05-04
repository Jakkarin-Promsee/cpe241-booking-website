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

  const inputClass =
    "w-full rounded px-3 py-2 text-sm outline-none transition bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-primary-light)";

  return (
    /* Backdrop — same scrim as login overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-login-scrim)">
      {/* Modal — card surface + border like Report cards */}
      <div className="bg-(--color-surface-card) border border-(--color-surface-card-border) rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header — light topbar tokens */}
        <div className="bg-(--color-topbar-light-bg) px-5 py-4 border-b border-(--color-topbar-light-border)">
          <h2 className="text-lg font-bold text-(--color-topbar-light-text)">
            {isEdit ? "Edit Movie Detail" : "Add / Edit Movie Detail"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4 bg-(--color-surface-card)">
          {/* Movie Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-(--color-text-secondary-light)">
              Movie Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              className={inputClass}
            />
          </div>

          {/* Genre + Duration */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Genre
              </label>
              <input
                type="text"
                value={form.genre}
                onChange={handleChange("genre")}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Duration (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={handleChange("duration")}
                min={0}
                className={inputClass}
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
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Release Date + Upload Poster */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Release Date
              </label>
              <input
                type="date"
                value={form.releaseDate}
                onChange={handleChange("releaseDate")}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Upload Poster image
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded px-3 py-2 text-sm outline-none transition text-center truncate bg-(--color-login-input-bg) border border-(--color-login-input-border) text-(--color-text-muted-light) hover:bg-(--color-filter-pill-idle-bg-hover)"
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
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-(--color-surface-light) border-t border-(--color-border-light)">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded border text-sm font-medium transition border-(--color-border-light) text-(--color-text-secondary-light) hover:bg-(--color-filter-pill-idle-bg-hover)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded text-sm font-semibold text-white transition bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover)"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieFormModal;
