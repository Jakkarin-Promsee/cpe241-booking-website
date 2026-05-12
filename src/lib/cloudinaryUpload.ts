/**
 * Browser upload to Cloudinary using an unsigned upload preset.
 * Dashboard: https://console.cloudinary.com/ → Settings → Upload → Upload presets
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName?.trim() || !uploadPreset?.trim()) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in the client .env file.",
    );
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset.trim());

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`,
    { method: "POST", body },
  );

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json &&
      typeof json === "object" &&
      "error" in json &&
      json.error &&
      typeof json.error === "object" &&
      "message" in json.error &&
      typeof (json as { error: { message?: string } }).error.message === "string"
        ? (json as { error: { message: string } }).error.message
        : `Image upload failed (${res.status})`;
    throw new Error(message);
  }

  if (
    json &&
    typeof json === "object" &&
    "secure_url" in json &&
    typeof (json as { secure_url: unknown }).secure_url === "string"
  ) {
    return (json as { secure_url: string }).secure_url;
  }

  throw new Error("Invalid response from Cloudinary.");
}
