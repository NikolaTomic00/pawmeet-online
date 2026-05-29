import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

function getPrimaryEmail(
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
) {
  return (
    clerkUser.primaryEmailAddress?.emailAddress ?? // optional chaining - If a = null use b
    clerkUser.emailAddresses[0]?.emailAddress
  );
}

function getDisplayName(
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
) {
  const fullName =
    clerkUser.fullName ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

  return fullName || clerkUser.username || "PawMeet user";
}

function getUsername(email: string) {
  return email.split("@")[0];
}

export async function syncUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = getPrimaryEmail(clerkUser);

  if (!email) {
    throw new Error("Cannot sync Clerk user without an email address");
  }

  const username = getUsername(email);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (existingUser) {
    if (existingUser.username === username) {
      return existingUser;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ username })
      .where(eq(users.id, existingUser.id))
      .returning();

    return updatedUser ?? existingUser;
  }

  const [createdUser] = await db //Drizzle .returning() returns array
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      name: getDisplayName(clerkUser),
      username,
      image: clerkUser.imageUrl,
    })
    .onConflictDoNothing({
      target: users.clerkId,
    })
    .returning();

  if (createdUser) {
    return createdUser;
  }

  const syncedUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  return syncedUser ?? null;
}
