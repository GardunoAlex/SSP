/**
 * Creates a cropped image blob from a source image and pixel crop area.
 * Uses the browser Canvas API — no external dependencies.
 *
 * @param {string} imageSrc - Object URL or data URL of the original image
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 * @returns {Promise<Blob>} Cropped image as a JPEG blob
 */
export default function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve(blob);
        },
        "image/jpeg",
        0.92,
      );
    };
    image.onerror = () => reject(new Error("Failed to load image for cropping"));
    image.src = imageSrc;
  });
}
