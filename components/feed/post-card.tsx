import { CommentSection } from "@/components/feed/comment-section";
import { DeletePostButton } from "@/components/feed/delete-post-button";
import { DogNameLine } from "@/components/profile/dog-name-line";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { getFeedPosts } from "@/lib/social/posts";
import Link from "next/link";

type PostWithAuthor = Awaited<ReturnType<typeof getFeedPosts>>[number];

type PostCardProps = {
  canDelete?: boolean;
  currentUserId?: string | null;
  post: PostWithAuthor;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPostDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function PostCard({
  canDelete = false,
  currentUserId = null,
  post,
}: PostCardProps) {
  const isLikedByCurrentUser = Boolean(
    currentUserId && post.likes.some((like) => like.userId === currentUserId),
  );

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-3 py-8 sm:py-0">
          <Link href={`/profile/${post.author.id}`}>
            <Avatar className="size-11 transition-opacity hover:opacity-85">
              <AvatarImage
                src={post.author.image ?? undefined}
                alt={post.author.name}
              />
              <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              className="block truncate text-sm font-semibold text-slate-100 transition-colors hover:text-cyan-200"
              href={`/profile/${post.author.id}`}
            >
              {post.author.name}
            </Link>
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
              <DogNameLine
                className="min-w-0"
                dogName={post.author.dogName}
                iconClassName="size-3.5"
              />
              <span className="shrink-0">&middot;</span>
              <span className="shrink-0">{formatPostDate(post.createdAt)}</span>
            </div>
          </div>

          {canDelete ? <DeletePostButton postId={post.id} /> : null}
        </div>

        {post.content ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
            {post.content}
          </p>
        ) : null}

        {post.image ? (
          <div className="flex justify-center overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              className="h-auto max-h-[720px] max-w-full object-contain lg:max-h-[460px] lg:max-w-[82%]"
            />
          </div>
        ) : null}

        <div className="border-t border-slate-700/60 pt-3">
          <CommentSection
            comments={post.comments}
            initialIsLiked={isLikedByCurrentUser}
            initialLikeCount={post.likes.length}
            isSignedIn={Boolean(currentUserId)}
            postId={post.id}
          />
        </div>
      </CardContent>
    </Card>
  );
}
