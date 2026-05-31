"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createMessage, getChatUserById } from "@/lib/social/messages";

type SendMessageState = {
  error?: string;
  message?: Awaited<ReturnType<typeof createMessage>>;
};

export async function sendMessageAction({
  imageUrl = null,
  receiverId,
  text,
}: {
  imageUrl?: string | null;
  receiverId: string;
  text: string;
}): Promise<SendMessageState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return { error: "You need to be signed in to send messages." };
  }

  const trimmedText = text.trim();
  const trimmedImageUrl = imageUrl?.trim() || null;

  if (!trimmedText && !trimmedImageUrl) {
    return { error: "Write a message first." };
  }

  const sender = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (!sender) {
    return { error: "Your PawMeet profile is still being prepared." };
  }

  if (sender.id === receiverId) {
    return { error: "You cannot send messages to yourself." };
  }

  const receiver = await getChatUserById(receiverId);

  if (!receiver) {
    return { error: "Receiver was not found." };
  }

  const message = await createMessage({
    imageUrl: trimmedImageUrl,
    receiverId,
    senderId: sender.id,
    text: trimmedText,
  });

  revalidatePath("/messages");

  return { message };
}
