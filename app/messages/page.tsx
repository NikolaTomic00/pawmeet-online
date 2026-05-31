import { eq } from "drizzle-orm";

import { ClerkProfileRefresh } from "@/components/auth/clerk-profile-refresh";
import { ChatView } from "@/components/chat/chat-view";
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
} from "@/lib/social/messages";
import { getUnreadNotificationCount } from "@/lib/social/notifications";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  const user = await syncUser();
  const [stats, unreadCount] = user
    ? await Promise.all([
        getFollowStats(user.id),
        getUnreadNotificationCount(user.id),
      ])
    : [null, 0];
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
  const initialMessages =
    user && selectedUserStillExists
      ? await getConversationMessages({
          currentUserId: user.id,
          otherUserId: selectedUserStillExists.id,
        })
      : [];

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
        <MainNavbar currentUserId={user?.id ?? null} unreadCount={unreadCount} />
        <div className="mt-5 grid min-h-[calc(100vh-8rem)] w-full items-stretch gap-5 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]">
          <LeftSidebar user={user} stats={stats} />
          <section className="min-w-0">
            <ChatView
              currentUserId={user?.id ?? null}
              initialMessages={initialMessages}
              key={selectedUser?.id ?? "no-conversation"}
              selectedUser={selectedUserStillExists ? selectedUser : null}
            />
          </section>
          <RightSidebar currentUserId={user?.id ?? null} />
        </div>
      </main>
    </PawMeetShell>
  );
}
