"use server";

import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { follows, notifications, users } from "@/db/schema";

type ToggleFollowState = {
  error?: string;
  following?: boolean;
};

export async function toggleFollowAction(
  targetUserId: string,
): Promise<ToggleFollowState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to follow people." };
  }

  if (!targetUserId) {
    return { error: "User id is missing." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!user) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  if (user.id === targetUserId) {
    return { error: "You cannot follow yourself." };
  }

  const targetUser = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.id, targetUserId),
  });

  if (!targetUser) {
    return { error: "User was not found." };
  }

  const existingFollow = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, user.id),
      eq(follows.followingId, targetUserId),
    ),
  });

  if (existingFollow) {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, targetUserId),
        ),
      );

    revalidatePath("/");
    revalidatePath("/notifications");

    return { following: false };
  }

  const [createdFollow] = await db
    .insert(follows)
    .values({
      followerId: user.id,
      followingId: targetUserId,
    })
    .onConflictDoNothing({
      target: [follows.followerId, follows.followingId],
    })
    .returning({ id: follows.id });

  if (createdFollow) {
    await db.insert(notifications).values({
      creatorId: user.id,
      receiverId: targetUserId,
      type: "follow",
    });
  }

  revalidatePath("/");
  revalidatePath("/notifications");

  return { following: true };
}
