import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import defaultBanner from "../assets/SSP Wallpaper.png";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUpload = ({ currentUrl, onUpload, entityType, entityId, getToken, entityName }) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !entityId) return;
    setUploading(true);
    setError(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("entity_type", entityType);
      formData.append("entity_id", entityId);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload/banner`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      const { banner_url } = await res.json();
      onUpload(banner_url);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayUrl = preview || currentUrl;

  return (
    <div>
      <label className="block text-sm font-semibold text-purple-dark mb-2">
        Banner Image
      </label>

      <div
        className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-purple-primary transition-colors cursor-pointer group"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <img
          src={displayUrl || defaultBanner}
          alt="Banner preview"
          className="w-full h-full object-cover"
        />
        {!displayUrl && entityName && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-purple-dark drop-shadow-sm">{entityName}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {displayUrl ? "Change Image" : "Click to upload a banner image"}
          </span>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {selectedFile && !uploading && (
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!entityId}
            className="flex items-center gap-2 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm disabled:opacity-50"
          >
            <Upload size={16} />
            {entityId ? "Upload Banner" : "Save profile first to upload"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
