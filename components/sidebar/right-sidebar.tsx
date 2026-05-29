import { ne } from "drizzle-orm";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { users } from "@/db/schema";

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

  return (
    <aside className="hidden h-full xl:block">
      <Card className="sticky top-4 min-h-[calc(100vh-8rem)]">
        <CardHeader>
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {suggestions.length > 0 ? (
            suggestions.map((user) => (
              <div className="flex items-center gap-3" key={user.id}>
                <Avatar>
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    @{user.username}
                  </p>
                </div>
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
