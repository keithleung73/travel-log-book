function canvasToJpeg(source: CanvasImageSource, width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法處理相片");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.84);
}

function fitSize(width: number, height: number, max = 1600) {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function fileToJournalPhoto(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = fitSize(bitmap.width, bitmap.height);
    const dataUrl = canvasToJpeg(bitmap, size.width, size.height);
    bitmap.close();
    return dataUrl;
  } catch {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("相片讀取失敗"));
        image.src = objectUrl;
      });
      const size = fitSize(img.naturalWidth, img.naturalHeight);
      return canvasToJpeg(img, size.width, size.height);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
