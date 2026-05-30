"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createPost, deletePost } from "@/lib/social/posts";

type CreatePostState = {
  error?: string;
  success?: string;
};

type DeletePostState = {
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

export async function deletePostAction(
  postId: string,
): Promise<DeletePostState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to delete posts." };
  }

  if (!postId) {
    return { error: "Post id is missing." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  const deletedPost = await deletePost({ authorId: user.id, postId });

  if (!deletedPost) {
    return { error: "You can only delete your own posts." };
  }

  revalidatePath("/");

  return { success: "Post deleted." };
}
