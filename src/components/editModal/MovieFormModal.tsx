import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

export type MovieFormValues = {
  title: string;
  genre: string;
  duration: string | number;
  description: string;
  releaseDate: string;
  endDate: string;
  hiden: boolean;
  poster?: File | null;
  /** Existing poster URL from the server (preview when no new file is chosen). */
  posterUrl?: string | null;
};

type MovieFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MovieFormValues) => void | Promise<void>;
  initialData?: MovieFormValues | null;
};

function MovieFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
}: MovieFormModalProps) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    genre: initialData?.genre || "",
    duration: initialData?.duration || "",
    description: initialData?.description || "",
    releaseDate: initialData?.releaseDate || "",
    endDate: initialData?.endDate || "",
    hiden: initialData?.hiden ?? false,
    poster: initialData?.poster || null,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const blobPosterPreviewUrl = useMemo(
    () => (form.poster instanceof File ? URL.createObjectURL(form.poster) : null),
    [form.poster],
  );

  useEffect(() => {
    return () => {
      if (blobPosterPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(blobPosterPreviewUrl);
      }
    };
  }, [blobPosterPreviewUrl]);

  const posterDisplayUrl =
    form.poster instanceof File
      ? blobPosterPreviewUrl
      : (initialData?.posterUrl?.trim() || null);

  const isValid = form.title.trim() !== "" && Number(form.duration) > 0;

  if (!isOpen) return null;

  const handleChange =
    (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((prev) => ({ ...prev, poster: file }));
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await onSave({ ...form, posterUrl: initialData?.posterUrl ?? null });
      onClose();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initialData;

  const inputClass =
    "w-full rounded px-3 py-2 text-sm outline-none transition bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-primary-light)";

  return (
    /* Backdrop — same scrim as login overlay; outer scroll if viewport is very short */
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-(--color-login-scrim) px-4 py-6">
      {/* Modal — fixed max height; body scrolls, header + footer stay pinned */}
      <div className="flex max-h-[min(85vh,720px)] w-full max-w-md shrink-0 flex-col overflow-hidden rounded-lg border border-(--color-surface-card-border) bg-(--color-surface-card) shadow-xl">
        {/* Header — light topbar tokens */}
        <div className="shrink-0 border-b border-(--color-topbar-light-border) bg-(--color-topbar-light-bg) px-5 py-4">
          <h2 className="text-lg font-bold text-(--color-topbar-light-text)">
            {isEdit ? "Edit Movie Detail" : "Add / Edit Movie Detail"}
          </h2>
        </div>

        {/* Body — scrolls when content + poster exceed modal height */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-(--color-surface-card) px-5 py-5 flex flex-col gap-4">
          {/* Movie Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-(--color-text-secondary-light)">
              Movie Title <span className="text-red-400">*</span>
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
                Duration (min) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={handleChange("duration")}
                min={1}
                className={inputClass}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-(--color-text-secondary-light)">
              Visibility
            </label>
            <label className="inline-flex items-center gap-2 rounded border border-(--color-border-light) bg-(--color-login-input-bg) px-3 py-2 text-sm text-(--color-text-secondary-light)">
              <input
                type="checkbox"
                checked={form.hiden}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, hiden: e.target.checked }))
                }
              />
              Hide this movie from listings
            </label>
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

          {/* Release Date + End Date */}
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
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={handleChange("endDate")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Upload Poster */}
          <div className="flex gap-3">
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

          {/* Poster preview */}
          {posterDisplayUrl && (
            <img
              src={posterDisplayUrl}
              alt="poster preview"
              className="max-h-64 w-full shrink-0 rounded border border-(--color-border-light) object-contain"
            />
          )}

          {saveError && (
            <p className="text-sm text-red-500" role="alert">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-(--color-border-light) bg-(--color-surface-light) px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 rounded border text-sm font-medium transition border-(--color-border-light) text-(--color-text-secondary-light) hover:bg-(--color-filter-pill-idle-bg-hover) disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!isValid || saving}
            className="px-5 py-2 rounded text-sm font-semibold text-white transition bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover) disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieFormModal;
