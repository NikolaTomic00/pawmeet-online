import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";

async function getCurrentDatabaseUserId() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.clerkId, clerkUser.id),
  });

  return user?.id ?? null;
}

export async function getNotifications() {
  const userId = await getCurrentDatabaseUserId();

  if (!userId) {
    return [];
  }

  return getNotificationsForUser(userId);
}

export async function getNotificationsForUser(userId: string) {
  return db.query.notifications.findMany({
    orderBy: desc(notifications.createdAt),
    where: eq(notifications.receiverId, userId),
    with: {
      creator: true,
      post: {
        with: {
          author: true,
        },
      },
    },
  });
}

export async function getUnreadNotificationCount(userId: string | null) {
  if (!userId) {
    return 0;
  }

  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.receiverId, userId), eq(notifications.read, false)),
    );

  return result?.value ?? 0;
}

export async function markNotificationsAsRead(userId?: string) {
  const receiverId = userId ?? (await getCurrentDatabaseUserId());

  if (!receiverId) {
    return 0;
  }

  const updatedNotifications = await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.receiverId, receiverId),
        eq(notifications.read, false),
      ),
    )
    .returning({ id: notifications.id });

  return updatedNotifications.length;
}

export type NotificationWithDetails = Awaited<
  ReturnType<typeof getNotificationsForUser>
>[number];
