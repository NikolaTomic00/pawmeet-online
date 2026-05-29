import { ImagePlus, PawPrint } from "lucide-react";

import { BorderAnimatedContainer } from "@/components/ui/border-animated-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/db/schema";

type FeedPlaceholderProps = {
  user: User | null;
};

export function FeedPlaceholder({ user }: FeedPlaceholderProps) {
  return (
    <section className="min-w-0 space-y-4">
      <BorderAnimatedContainer>
        <Card className="min-h-[calc(100vh-8rem)] w-full border-0 bg-slate-950/40 shadow-none backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PawPrint className="size-5 text-cyan-300" />
              PawMeet Feed
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/70">
                  <ImagePlus className="size-5 text-cyan-300" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    {user
                      ? `What's new with ${user.dogName ?? "your pet"}?`
                      : "Posts will live here"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    This center column is reserved for creating and reading
                    posts.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </BorderAnimatedContainer>
    </section>
  );
}
