import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { ClerkProfileRefresh } from "@/components/auth/clerk-profile-refresh";
import { PawMeetShell } from "@/components/layout/pawmeet-shell";
import { MainNavbar } from "@/components/navigation/main-navbar";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { db } from "@/db";
import { users } from "@/db/schema";
import { syncUser } from "@/lib/auth/sync-user";
import { getFollowStats } from "@/lib/social/follows";
import { getUnreadMessageCount } from "@/lib/social/messages";
import { getUnreadNotificationCount } from "@/lib/social/notifications";
import { getProfilePhotos } from "@/lib/social/profile-photos";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const currentUser = await syncUser();
  const [
    stats,
    unreadCount,
    unreadMessageCount,
    currentUserPhotos,
    profile,
    profilePhotos,
  ] = await Promise.all([
    currentUser ? getFollowStats(currentUser.id) : null,
    getUnreadNotificationCount(currentUser?.id ?? null),
    getUnreadMessageCount(currentUser?.id ?? null),
    currentUser ? getProfilePhotos(currentUser.id) : [],
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    getProfilePhotos(userId),
  ]);

  if (!profile) {
    notFound();
  }

  const profileStats = await getFollowStats(profile.id);

  return (
    <PawMeetShell>
      <ClerkProfileRefresh
        serverProfile={
          currentUser
            ? {
                email: currentUser.email,
                image: currentUser.image,
                name: currentUser.name,
                username: currentUser.username,
              }
            : null
        }
      />
      <main className="min-h-[calc(100vh-2rem)] w-full px-2 sm:px-4">
        <MainNavbar
          currentUserId={currentUser?.id ?? null}
          unreadCount={unreadCount}
          unreadMessageCount={unreadMessageCount}
        />
        <div className="mt-5 grid min-h-[calc(100vh-8rem)] w-full items-stretch gap-5 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]">
          <LeftSidebar
            photos={currentUserPhotos}
            user={currentUser}
            stats={stats}
          />
          <ProfileEditor
            canEdit={currentUser?.id === profile.id}
            photos={profilePhotos}
            profile={profile}
            stats={profileStats}
          />
          <RightSidebar currentUserId={currentUser?.id ?? null} />
        </div>
      </main>
    </PawMeetShell>
  );
}
