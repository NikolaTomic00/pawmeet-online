import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/db";
import { posts } from "@/db/schema";

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
    },
  });
}
