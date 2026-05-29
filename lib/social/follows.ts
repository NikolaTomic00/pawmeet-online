import "server-only";

import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { follows } from "@/db/schema";

export async function getFollowStats(userId: string) {
  const [[followers], [following]] = await Promise.all([
    db
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followingId, userId)),
    db
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followerId, userId)),
  ]);

  return {
    followers: followers?.value ?? 0,
    following: following?.value ?? 0,
  };
}
