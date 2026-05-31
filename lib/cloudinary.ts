import { createHash } from "node:crypto";

type CloudinarySignatureParams = Record<string, number | string>;

export type CloudinaryUploadResult = {
  height?: number;
  public_id: string;
  secure_url: string;
  width?: number;
};

type CloudinaryDestroyResult = {
  result?: string;
};

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  return {
    apiKey,
    apiSecret,
    cloudName,
  };
}

export function createCloudinarySignature(
  params: CloudinarySignatureParams,
  apiSecret: string,
) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

export async function destroyCloudinaryImage(publicId: string) {
  const cloudinaryConfig = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const destroyParams = {
    public_id: publicId,
    timestamp,
  };
  const signature = createCloudinarySignature(
    destroyParams,
    cloudinaryConfig.apiSecret,
  );
  const formData = new FormData();

  formData.append("api_key", cloudinaryConfig.apiKey);
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`,
    {
      body: formData,
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Cloudinary image deletion failed.");
  }

  return (await response.json()) as CloudinaryDestroyResult;
}
