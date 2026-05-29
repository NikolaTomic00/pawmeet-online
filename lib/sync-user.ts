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

function getUsername(
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
  email: string,
) {
  const emailPrefix = email.split("@")[0];
  const clerkSuffix = clerkUser.id.slice(-8);

  return clerkUser.username || `${emailPrefix}_${clerkSuffix}`;
}

export async function syncUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (existingUser) {
    return existingUser;
  }

  const email = getPrimaryEmail(clerkUser);

  if (!email) {
    throw new Error("Cannot sync Clerk user without an email address");
  }

  const [createdUser] = await db //Drizzle .returning() returns array
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      name: getDisplayName(clerkUser),
      username: getUsername(clerkUser, email),
      image: clerkUser.imageUrl,
    })
    .onConflictDoNothing({
      target: users.clerkId,
    })
    .returning();

  if (createdUser) {
    return createdUser;
  }

  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });
}
