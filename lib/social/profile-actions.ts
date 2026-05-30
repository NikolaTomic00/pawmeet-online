"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";

type UpdateProfileState = {
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
