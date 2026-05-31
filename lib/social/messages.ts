import "server-only";

import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { messages, users } from "@/db/schema";

export type ChatUserSummary = {
  bio: string | null;
  breed: string | null;
  dogName: string | null;
  id: string;
  image: string | null;
  location: string | null;
  name: string;
};

export type ChatMessageSummary = {
  createdAt: string;
  id: string;
  image: string | null;
  receiverId: string;
  senderId: string;
  text: string | null;
};

function toChatUserSummary(user: typeof users.$inferSelect): ChatUserSummary {
  return {
    bio: user.bio,
    breed: user.breed,
    dogName: user.dogName,
    id: user.id,
    image: user.image,
    location: user.location,
    name: user.name,
  };
}

function toChatMessageSummary(
  message: typeof messages.$inferSelect,
): ChatMessageSummary {
  return {
    createdAt: message.createdAt.toISOString(),
    id: message.id,
    image: message.image,
    receiverId: message.receiverId,
    senderId: message.senderId,
    text: message.text,
  };
}

export async function getChatContacts(currentUserId: string | null) {
  if (!currentUserId) {
    return [];
  }

  const contacts = await db.query.users.findMany({
    orderBy: asc(users.name),
    where: ne(users.id, currentUserId),
  });

  return contacts.map(toChatUserSummary);
}

export async function getChatPartners(currentUserId: string | null) {
  if (!currentUserId) {
    return [];
  }

  const userMessages = await db.query.messages.findMany({
    orderBy: desc(messages.createdAt),
    where: or(
      eq(messages.senderId, currentUserId),
      eq(messages.receiverId, currentUserId),
    ),
  });
  const partnerIds = Array.from(
    new Set(
      userMessages.map((message) =>
        message.senderId === currentUserId ? message.receiverId : message.senderId,
      ),
    ),
  );

  if (partnerIds.length === 0) {
    return [];
  }

  const partners = await db.query.users.findMany({
    where: inArray(users.id, partnerIds),
  });
  const partnerById = new Map(
    partners.map((partner) => [partner.id, toChatUserSummary(partner)]),
  );

  return partnerIds
    .map((partnerId) => partnerById.get(partnerId))
    .filter((partner): partner is ChatUserSummary => Boolean(partner));
}

export async function getConversationMessages({
  currentUserId,
  otherUserId,
}: {
  currentUserId: string;
  otherUserId: string;
}) {
  const conversationMessages = await db.query.messages.findMany({
    orderBy: asc(messages.createdAt),
    where: or(
      and(
        eq(messages.senderId, currentUserId),
        eq(messages.receiverId, otherUserId),
      ),
      and(
        eq(messages.senderId, otherUserId),
        eq(messages.receiverId, currentUserId),
      ),
    ),
  });

  return conversationMessages.map(toChatMessageSummary);
}

export async function createMessage({
  imageUrl,
  receiverId,
  senderId,
  text,
}: {
  imageUrl: string | null;
  receiverId: string;
  senderId: string;
  text: string;
}) {
  const [createdMessage] = await db
    .insert(messages)
    .values({
      image: imageUrl,
      receiverId,
      senderId,
      text,
    })
    .returning();

  return toChatMessageSummary(createdMessage);
}

export async function getChatUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user ? toChatUserSummary(user) : null;
}
