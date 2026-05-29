"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createPost } from "@/lib/social/posts";

type CreatePostState = {
  error?: string;
  success?: string;
};

export async function createPostAction(
  content: string,
  imageUrl: string | null,
): Promise<CreatePostState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to post." };
  }

  const trimmedContent = content.trim();
  const trimmedImageUrl = imageUrl?.trim() || null;

  if (!trimmedContent && !trimmedImageUrl) {
    return { error: "Write something or add an image before posting." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  await createPost({
    authorId: user.id,
    content: trimmedContent,
    imageUrl: trimmedImageUrl,
  });

  revalidatePath("/");

  return { success: "Post created." };
}
