import { eq } from "drizzle-orm";

import { ChatSidebarTabs } from "@/components/chat/chat-sidebar-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { follows } from "@/db/schema";
import { getChatContacts, getChatPartners } from "@/lib/social/messages";

type RightSidebarProps = {
  currentUserId: string | null;
};

export async function RightSidebar({ currentUserId }: RightSidebarProps) {
  const [contacts, chats, followedUserIds] = await Promise.all([
    getChatContacts(currentUserId),
    getChatPartners(currentUserId),
    currentUserId
      ? db.query.follows.findMany({
          columns: {
            followingId: true,
          },
          where: eq(follows.followerId, currentUserId),
        })
      : [],
  ]);

  return (
    <aside className="h-full lg:hidden xl:block">
      <Card className="xl:sticky xl:top-4 xl:min-h-[calc(100vh-8rem)]">
        <CardHeader>
          <CardTitle className="text-lg">PawMeet chat</CardTitle>
        </CardHeader>

        <CardContent className="max-h-[70vh] overflow-y-auto xl:max-h-none">
          <ChatSidebarTabs
            chats={chats}
            contacts={contacts}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds.map((follow) => follow.followingId)}
          />
        </CardContent>
      </Card>
    </aside>
  );
}
