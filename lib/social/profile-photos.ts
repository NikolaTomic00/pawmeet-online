import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profilePhotos } from "@/db/schema";

export async function getProfilePhotos(userId: string) {
  return db.query.profilePhotos.findMany({
    orderBy: desc(profilePhotos.createdAt),
    where: eq(profilePhotos.userId, userId),
  });
}

export async function createProfilePhoto({
  height,
  imageUrl,
  publicId,
  userId,
  width,
}: {
  height: number | null;
  imageUrl: string;
  publicId: string | null;
  userId: string;
  width: number | null;
}) {
  const [photo] = await db
    .insert(profilePhotos)
    .values({
      height,
      image: imageUrl,
      publicId,
      userId,
      width,
    })
    .returning();

  return photo;
}

export async function deleteProfilePhoto({
  photoId,
  userId,
}: {
  photoId: string;
  userId: string;
}) {
  const [photo] = await db
    .delete(profilePhotos)
    .where(and(eq(profilePhotos.id, photoId), eq(profilePhotos.userId, userId)))
    .returning({
      id: profilePhotos.id,
      publicId: profilePhotos.publicId,
    });

  return photo ?? null;
}
