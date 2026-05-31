import { createHash } from "node:crypto";

type CloudinarySignatureParams = Record<string, number | string>;

export type CloudinaryUploadResult = {
  height?: number;
  public_id: string;
  secure_url: string;
  width?: number;
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
