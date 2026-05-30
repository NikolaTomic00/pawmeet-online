import { eq, ne } from "drizzle-orm";
import { UserRound } from "lucide-react";
import Link from "next/link";

import { DogNameLine } from "@/components/profile/dog-name-line";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { follows, users } from "@/db/schema";

import { FollowUserButton } from "./follow-user-button";

type RightSidebarProps = {
  currentUserId: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function RightSidebar({ currentUserId }: RightSidebarProps) {
  const suggestions = currentUserId
    ? await db.query.users.findMany({
        where: ne(users.id, currentUserId),
        limit: 4,
      })
    : await db.query.users.findMany({
        limit: 4,
      });
  const followedUserIds = currentUserId
    ? new Set(
        (
          await db.query.follows.findMany({
            columns: {
              followingId: true,
            },
            where: eq(follows.followerId, currentUserId),
          })
        ).map((follow) => follow.followingId),
      )
    : new Set<string>();

  return (
    <aside className="hidden h-full xl:block">
      <Card className="sticky top-4 min-h-[calc(100vh-8rem)]">
        <CardHeader>
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {suggestions.length > 0 ? (
            suggestions.map((user) => (
              <div
                className="space-y-3 rounded-lg border border-slate-700/60 bg-slate-900/30 p-3"
                key={user.id}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {user.name}
                    </p>
                    <DogNameLine
                      className="text-xs text-slate-500"
                      dogName={user.dogName}
                      iconClassName="size-3.5"
                    />
                  </div>
                </div>

                <Link
                  className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/50 px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-white"
                  href={`/profile/${user.id}`}
                >
                  <UserRound className="size-4 text-cyan-300" />
                  View profile
                </Link>

                <FollowUserButton
                  initialFollowing={followedUserIds.has(user.id)}
                  isSignedIn={Boolean(currentUserId)}
                  userId={user.id}
                />
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              More PawMeet profiles will appear here as people join.
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
