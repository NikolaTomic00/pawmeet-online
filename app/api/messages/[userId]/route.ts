import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getConversationMessages } from "@/lib/social/messages";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserProfile = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!currentUserProfile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const { userId } = await params;
  const messages = await getConversationMessages({
    currentUserId: currentUserProfile.id,
    otherUserId: userId,
  });

  return Response.json({ messages });
}
