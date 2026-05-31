"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import {
  createProfilePhoto,
  deleteProfilePhoto,
} from "@/lib/social/profile-photos";

type UpdateProfileState = {
  error?: string;
  success?: string;
};

type UploadProfilePhotoState = {
  error?: string;
  photo?: Awaited<ReturnType<typeof createProfilePhoto>>;
  success?: string;
};

type DeleteProfilePhotoState = {
  error?: string;
  success?: string;
};

function cleanOptionalText(value: string, maxLength: number) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
}

export async function updateProfileAction({
  bio,
  breed,
  dogName,
  location,
}: {
  bio: string;
  breed: string;
  dogName: string;
  location: string;
}): Promise<UpdateProfileState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to update your profile." };
  }

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  await db
    .update(users)
    .set({
      bio: cleanOptionalText(bio, 300),
      breed: cleanOptionalText(breed, 80),
      dogName: cleanOptionalText(dogName, 80),
      location: cleanOptionalText(location, 120),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/");
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/notifications");

  return { success: "Profile updated." };
}

function cleanDimension(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    return null;
  }

  return Math.round(value);
}

export async function addProfilePhotoAction({
  height,
  publicId,
  secureUrl,
  width,
}: {
  height?: number | null;
  publicId?: string | null;
  secureUrl: string;
  width?: number | null;
}): Promise<UploadProfilePhotoState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to upload profile photos." };
  }

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  const imageUrl = secureUrl.trim();

  if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
    return { error: "Upload a Cloudinary image before saving it." };
  }

  const photo = await createProfilePhoto({
    height: cleanDimension(height),
    imageUrl,
    publicId: publicId?.trim() || null,
    userId: user.id,
    width: cleanDimension(width),
  });

  revalidatePath("/");
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/messages");
  revalidatePath("/notifications");

  return { photo, success: "Profile photo uploaded." };
}

export async function deleteProfilePhotoAction(
  photoId: string,
): Promise<DeleteProfilePhotoState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to delete profile photos." };
  }

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  const photo = await deleteProfilePhoto({
    photoId,
    userId: user.id,
  });

  if (!photo) {
    return { error: "Profile photo could not be found." };
  }

  if (photo.publicId) {
    try {
      await destroyCloudinaryImage(photo.publicId);
    } catch {
      // The app copy is already gone; a failed remote cleanup should not block deletion.
    }
  }

  revalidatePath("/");
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/messages");
  revalidatePath("/notifications");

  return { success: "Profile photo deleted." };
}
