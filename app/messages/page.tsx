import { eq } from "drizzle-orm";

import { ClerkProfileRefresh } from "@/components/auth/clerk-profile-refresh";
import { ChatView } from "@/components/chat/chat-view";
import { MessageInbox } from "@/components/chat/message-inbox";
import { PawMeetShell } from "@/components/layout/pawmeet-shell";
import { MainNavbar } from "@/components/navigation/main-navbar";
import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { db } from "@/db";
import { users } from "@/db/schema";
import { syncUser } from "@/lib/auth/sync-user";
import { getFollowStats } from "@/lib/social/follows";
import {
  getChatUserById,
  getConversationMessages,
  getUnreadMessageCount,
  getUnreadMessageThreads,
  markConversationMessagesAsRead,
} from "@/lib/social/messages";
import { getUnreadNotificationCount } from "@/lib/social/notifications";
import { getProfilePhotos } from "@/lib/social/profile-photos";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  const user = await syncUser();
  const [stats, unreadCount, profilePhotos] = user
    ? await Promise.all([
        getFollowStats(user.id),
        getUnreadNotificationCount(user.id),
        getProfilePhotos(user.id),
      ])
    : [null, 0, []];
  const selectedUser =
    user && userId && userId !== user.id ? await getChatUserById(userId) : null;
  const selectedUserStillExists = selectedUser
    ? await db.query.users.findFirst({
        columns: {
          id: true,
        },
        where: eq(users.id, selectedUser.id),
      })
    : null;
  if (user && selectedUserStillExists) {
    await markConversationMessagesAsRead({
      currentUserId: user.id,
      otherUserId: selectedUserStillExists.id,
    });
  }

  const [initialMessages, unreadMessageCount, unreadMessageThreads] = user
    ? await Promise.all([
        selectedUserStillExists
          ? getConversationMessages({
              currentUserId: user.id,
              otherUserId: selectedUserStillExists.id,
            })
          : [],
        getUnreadMessageCount(user.id),
        getUnreadMessageThreads(user.id),
      ])
    : [[], 0, []];

  return (
    <PawMeetShell>
      <ClerkProfileRefresh
        serverProfile={
          user
            ? {
                email: user.email,
                image: user.image,
                name: user.name,
                username: user.username,
              }
            : null
        }
      />
      <main className="min-h-[calc(100vh-2rem)] w-full px-2 sm:px-4">
        <MainNavbar
          currentUserId={user?.id ?? null}
          unreadCount={unreadCount}
          unreadMessageCount={unreadMessageCount}
        />
        <div className="mt-5 grid min-h-[calc(100vh-8rem)] w-full items-stretch gap-5 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]">
          <LeftSidebar photos={profilePhotos} user={user} stats={stats} />
          <section className="min-w-0">
            {selectedUserStillExists ? (
              <ChatView
                currentUserId={user?.id ?? null}
                initialMessages={initialMessages}
                key={selectedUser?.id ?? "no-conversation"}
                selectedUser={selectedUser}
              />
            ) : (
              <MessageInbox
                signedIn={Boolean(user)}
                threads={unreadMessageThreads}
                unreadCount={unreadMessageCount}
              />
            )}
          </section>
          <RightSidebar currentUserId={user?.id ?? null} />
        </div>
      </main>
    </PawMeetShell>
  );
}
