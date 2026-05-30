import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { comments, posts } from "@/db/schema";

export async function createPost({
  authorId,
  content,
  imageUrl,
}: {
  authorId: string;
  content: string;
  imageUrl: string | null;
}) {
  const [post] = await db
    .insert(posts)
    .values({
      authorId,
      content,
      image: imageUrl,
    })
    .returning();

  return post;
}

export async function getFeedPosts() {
  return db.query.posts.findMany({
    orderBy: desc(posts.createdAt),
    with: {
      author: true,
      comments: {
        orderBy: asc(comments.createdAt),
        with: {
          author: true,
        },
      },
      likes: {
        columns: {
          userId: true,
        },
      },
    },
  });
}

export async function deletePost({
  authorId,
  postId,
}: {
  authorId: string;
  postId: string;
}) {
  const [deletedPost] = await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
    .returning({ id: posts.id });

  return deletedPost ?? null;
}
