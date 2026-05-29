import { FeedPlaceholder } from "@/components/feed/feed-placeholder";
import { ClerkProfileRefresh } from "@/components/auth/clerk-profile-refresh";
import { PawMeetShell } from "@/components/layout/pawmeet-shell";
import { MainNavbar } from "@/components/navigation/main-navbar";
import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { syncUser } from "@/lib/auth/sync-user";
import { getFollowStats } from "@/lib/social/follows";

export default async function Home() {
  const user = await syncUser();
  const stats = user ? await getFollowStats(user.id) : null;

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
        <MainNavbar />
        <div className="mt-5 grid min-h-[calc(100vh-8rem)] w-full items-stretch gap-5 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] xl:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(220px,280px)]">
          <LeftSidebar user={user} stats={stats} />
          <FeedPlaceholder user={user} />
          <RightSidebar currentUserId={user?.id ?? null} />
        </div>
      </main>
    </PawMeetShell>
  );
}
