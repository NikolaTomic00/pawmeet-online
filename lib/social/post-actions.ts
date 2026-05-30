"use server";

import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { comments, likes, notifications, posts, users } from "@/db/schema";
import { createPost, deletePost } from "@/lib/social/posts";

type CreatePostState = {
  error?: string;
  success?: string;
};

type DeletePostState = {
  error?: string;
  success?: string;
};

type ToggleLikeState = {
  error?: string;
  liked?: boolean;
};

type CreateCommentState = {
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

export async function toggleLikeAction(
  postId: string,
): Promise<ToggleLikeState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to like posts." };
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

  const post = await db.query.posts.findFirst({
    columns: {
      authorId: true,
      id: true,
    },
    where: eq(posts.id, postId),
  });

  if (!post) {
    return { error: "Post was not found." };
  }

  const existingLike = await db.query.likes.findFirst({
    where: and(eq(likes.postId, postId), eq(likes.userId, user.id)),
  });

  if (existingLike) {
    await db
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));

    revalidatePath("/");
    revalidatePath("/notifications");

    return { liked: false };
  }

  const [createdLike] = await db
    .insert(likes)
    .values({ postId, userId: user.id })
    .onConflictDoNothing({
      target: [likes.postId, likes.userId],
    })
    .returning({ id: likes.id });

  if (createdLike && post.authorId !== user.id) {
    await db.insert(notifications).values({
      creatorId: user.id,
      postId,
      receiverId: post.authorId,
      type: "like",
    });
  }

  revalidatePath("/");
  revalidatePath("/notifications");

  return { liked: true };
}

export async function createCommentAction(
  postId: string,
  content: string,
): Promise<CreateCommentState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to comment." };
  }

  const trimmedContent = content.trim();

  if (!postId) {
    return { error: "Post id is missing." };
  }

  if (!trimmedContent) {
    return { error: "Write a comment first." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  const post = await db.query.posts.findFirst({
    columns: {
      authorId: true,
      id: true,
    },
    where: eq(posts.id, postId),
  });

  if (!post) {
    return { error: "Post was not found." };
  }

  await db.insert(comments).values({
    authorId: user.id,
    content: trimmedContent,
    postId,
  });

  if (post.authorId !== user.id) {
    await db.insert(notifications).values({
      creatorId: user.id,
      postId,
      receiverId: post.authorId,
      type: "comment",
    });
  }

  revalidatePath("/");
  revalidatePath("/notifications");

  return { success: "Comment added." };
}
