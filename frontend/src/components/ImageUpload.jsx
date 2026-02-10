import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import Cropper from "react-easy-crop";
import { Upload, X, Crop, ZoomIn, ZoomOut, Eye } from "lucide-react";
import getCroppedImg from "../lib/getCroppedImg";
import defaultBanner from "../assets/SSP Wallpaper.png";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ASPECT_RATIO = 7 / 5; // 1.4:1

const ImageUpload = forwardRef(({ currentUrl, onUpload, entityType, entityId, getToken, entityName }, ref) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);

  // Expose getFile() for CreateOpportunity's deferred upload pattern
  useImperativeHandle(ref, () => ({
    getFile: () => croppedBlob,
  }));

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

    // Open crop modal instead of setting preview directly
    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);
  };

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      setCroppedBlob(blob);

      const croppedFile = new File([blob], "banner.jpg", { type: "image/jpeg" });
      setSelectedFile(croppedFile);
      setPreview(URL.createObjectURL(blob));
      setShowCropModal(false);

      URL.revokeObjectURL(rawImageSrc);
      setRawImageSrc(null);
    } catch (err) {
      console.error("Crop error:", err);
      setError("Failed to crop image. Please try again.");
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      setCroppedBlob(null);
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
    setCroppedBlob(null);
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

      {/* Preview references — how the banner will appear */}
      {selectedFile && preview && !uploading && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-dark">
            <Eye size={16} />
            Preview: How your banner will appear
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card Preview */}
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Discover Card</p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-28 overflow-hidden">
                  <img src={preview} alt="Card preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <div className="h-3 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-2 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-2 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            </div>

            {/* Modal Preview */}
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Organization Modal</p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-20 overflow-hidden">
                  <img src={preview} alt="Modal preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                  <div className="h-2 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-2 w-5/6 bg-slate-100 rounded" />
                </div>
              </div>
            </div>

            {/* Instagram Post Preview */}
            <div>
              <p className="text-xs text-slate-500 mb-1 font-medium">Instagram Post</p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="aspect-square overflow-hidden">
                  <img src={preview} alt="Instagram preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-slate-200 rounded-full" />
                    <div className="h-2 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded mb-1" />
                  <div className="h-2 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedFile && !uploading && (
        <div className="flex gap-3 mt-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!entityId}
            className="flex items-center gap-2 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors font-semibold text-sm disabled:opacity-50"
          >
            <Upload size={14} />
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

      {/* Crop Modal */}
      {showCropModal && rawImageSrc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-dark flex items-center gap-2">
                <Crop size={20} />
                Crop Your Banner
              </h3>
              <button
                onClick={handleCropCancel}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cropper Area */}
            <div className="relative w-full" style={{ height: "400px" }}>
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={ASPECT_RATIO}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
              />
            </div>

            {/* Zoom Controls */}
            <div className="px-6 py-3 border-t border-slate-200 flex items-center gap-4">
              <ZoomOut size={16} className="text-slate-500" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <ZoomIn size={16} className="text-slate-500" />
              <span className="text-xs text-slate-500 ml-2">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Info */}
            <div className="px-6 py-2">
              <p className="text-xs text-slate-500">
                Drag to reposition. Use the slider or scroll wheel to zoom.
                Aspect ratio is locked at 1.4:1 for consistent display across cards and modals.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-gold transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <Crop size={14} />
                Confirm Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ImageUpload.displayName = "ImageUpload";

export default ImageUpload;
