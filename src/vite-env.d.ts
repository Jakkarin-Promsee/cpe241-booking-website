/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Express API origin, e.g. `http://localhost:5000` */
  readonly VITE_API_URL?: string;
  /** Cloudinary cloud name (public) */
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  /** Unsigned upload preset name (create in Cloudinary console) */
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
