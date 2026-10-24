import fs from "fs";
import path from "path";

const AI_SERVICE_URL = "http://127.0.0.1:8000";

export async function analyzeClothingImage(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("Uploaded image file could not be found.");
  }

  const imageBuffer = fs.readFileSync(filePath);

  const extension = path
    .extname(filePath)
    .toLowerCase();

  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };

  const mimeType =
    mimeTypes[extension] || "application/octet-stream";

  const form = new FormData();

  const imageBlob = new Blob(
    [imageBuffer],
    {
      type: mimeType,
    }
  );

  form.append(
    "image",
    imageBlob,
    `clothing-image${extension || ".jpg"}`
  );

  const response = await fetch(
    `${AI_SERVICE_URL}/analyze`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!response.ok) {
    let message = "AI clothing analysis failed.";

    try {
      const data = await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      data.message ||
      "AI clothing analysis failed."
    );
  }

  if (!data.result) {
    throw new Error(
      "AI service returned no clothing analysis result."
    );
  }

  return data.result;
}