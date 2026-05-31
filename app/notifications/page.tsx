import { ClerkProfileRefresh } from "@/components/auth/clerk-profile-refresh";
import { PawMeetShell } from "@/components/layout/pawmeet-shell";
import { MainNavbar } from "@/components/navigation/main-navbar";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { syncUser } from "@/lib/auth/sync-user";
import { getFollowStats } from "@/lib/social/follows";
import { getUnreadMessageCount } from "@/lib/social/messages";
import {
  getNotifications,
  markNotificationsAsRead,
} from "@/lib/social/notifications";
import { getProfilePhotos } from "@/lib/social/profile-photos";

export default async function NotificationsPage() {
  const user = await syncUser();
  const [stats, unreadMessageCount, profilePhotos] = user
    ? await Promise.all([
        getFollowStats(user.id),
        getUnreadMessageCount(user.id),
        getProfilePhotos(user.id),
      ])
    : [null, 0, []];

  if (user) {
    await markNotificationsAsRead(user.id);
  }

  const notifications = user ? await getNotifications() : [];
  const unreadCount = notifications.filter((notification) => !notification.read)
    .length;

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
          unreadCount={0}
          unreadMessageCount={unreadMessageCount}
        />
        <div className="mt-5 grid min-h-[calc(100vh-8rem)] w-full items-stretch gap-5 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]">
          <LeftSidebar photos={profilePhotos} user={user} stats={stats} />
          <NotificationsView
            notifications={notifications}
            unreadCount={unreadCount}
            userSignedIn={Boolean(user)}
          />
          <RightSidebar currentUserId={user?.id ?? null} />
        </div>
      </main>
    </PawMeetShell>
  );
}
