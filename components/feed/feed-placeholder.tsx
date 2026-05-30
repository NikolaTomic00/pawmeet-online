import { PawPrint } from "lucide-react";

import { BorderAnimatedContainer } from "@/components/ui/border-animated-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/db/schema";
import { CreatePost } from "@/components/feed/create-post";
import { PostCard } from "@/components/feed/post-card";
import { getFeedPosts } from "@/lib/social/posts";

type FeedPlaceholderProps = {
  user: User | null;
};

export async function FeedPlaceholder({ user }: FeedPlaceholderProps) {
  const posts = await getFeedPosts();

  return (
    <section className="min-w-0 space-y-4">
      <BorderAnimatedContainer>
        <Card className="w-full border-0 bg-slate-950/40 shadow-none backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PawPrint className="size-5 text-cyan-300" />
              PawMeet Feed
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <CreatePost user={user} />

            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  canDelete={user?.id === post.authorId}
                  currentUserId={user?.id ?? null}
                  key={post.id}
                  post={post}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-5 text-sm text-slate-500">
                No posts yet.
              </div>
            )}
          </CardContent>
        </Card>
      </BorderAnimatedContainer>
    </section>
  );
}
