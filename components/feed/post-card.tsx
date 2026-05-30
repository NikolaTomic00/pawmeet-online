import { MessageCircle, PawPrint } from "lucide-react";

import { DeletePostButton } from "@/components/feed/delete-post-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { getFeedPosts } from "@/lib/social/posts";

type PostWithAuthor = Awaited<ReturnType<typeof getFeedPosts>>[number];

type PostCardProps = {
  canDelete?: boolean;
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

function formatPostDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

export function PostCard({ canDelete = false, post }: PostCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-3 py-8 sm:py-0">
          <Avatar className="size-11">
            <AvatarImage
              src={post.author.image ?? undefined}
              alt={post.author.name}
            />
            <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100">
              {post.author.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              @{post.author.username} · {formatPostDate(post.createdAt)}
            </p>
          </div>

          {canDelete ? <DeletePostButton postId={post.id} /> : null}
        </div>

        {post.content ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
            {post.content}
          </p>
        ) : null}

        {post.image ? (
          <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              className="max-h-[520px] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-4 border-t border-slate-700/60 pt-3 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <PawPrint className="size-4 text-cyan-300" />
            0
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="size-4 text-cyan-300" />
            0
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
