import { currentUser } from "@clerk/nextjs/server";

import {
  createCloudinarySignature,
  getCloudinaryConfig,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return jsonError("You need to be signed in to upload images.", 401);
  }

  let cloudinaryConfig: ReturnType<typeof getCloudinaryConfig>;

  try {
    cloudinaryConfig = getCloudinaryConfig();
  } catch {
    return jsonError("Cloudinary is not configured.", 500);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Choose an image to upload.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return jsonError("Upload a JPG, PNG, WEBP, or GIF image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return jsonError("Image must be 5 MB or smaller.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams = {
    folder: "pawmeet/feed",
    tags: "pawmeet,feed",
    timestamp,
  };
  const signature = createCloudinarySignature(
    uploadParams,
    cloudinaryConfig.apiSecret,
  );
  const uploadFormData = new FormData();

  uploadFormData.append("file", file);
  uploadFormData.append("api_key", cloudinaryConfig.apiKey);
  uploadFormData.append("signature", signature);

  Object.entries(uploadParams).forEach(([key, value]) => {
    uploadFormData.append(key, String(value));
  });

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
    {
      body: uploadFormData,
      method: "POST",
    },
  );

  if (!uploadResponse.ok) {
    return jsonError("Cloudinary upload failed.", 502);
  }

  const result = (await uploadResponse.json()) as CloudinaryUploadResult;

  if (!result.secure_url) {
    return jsonError("Cloudinary did not return an image URL.", 502);
  }

  return Response.json({
    height: result.height ?? null,
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width ?? null,
  });
}
