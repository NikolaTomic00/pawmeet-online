"use client";

import { Loader2, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { LikePostButton } from "@/components/feed/like-post-button";
import { DogNameLine } from "@/components/profile/dog-name-line";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createCommentAction } from "@/lib/social/post-actions";

type Comment = {
  author: {
    dogName: string | null;
    id: string;
    image: string | null;
    name: string;
    username: string;
  };
  content: string;
  createdAt: Date | string;
  id: string;
};

type CommentSectionProps = {
  comments: Comment[];
  initialIsLiked: boolean;
  initialLikeCount: number;
  isSignedIn: boolean;
  postId: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCommentDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function CommentSection({
  comments,
  initialIsLiked,
  initialLikeCount,
  isSignedIn,
  postId,
}: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isCommenting, startCommenting] = useTransition();

  const canSubmit = Boolean(content.trim()) && isSignedIn && !isCommenting;

  function handleAddComment() {
    const trimmedContent = content.trim();

    if (!isSignedIn) {
      toast.error("Sign in to comment.");
      return;
    }

    if (!trimmedContent) {
      toast.error("Write a comment first.");
      return;
    }

    startCommenting(async () => {
      try {
        const result = await createCommentAction(postId, trimmedContent);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        setContent("");
        toast.success(result.success ?? "Comment added.");
      } catch {
        toast.error("Something went wrong while adding your comment.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <LikePostButton
          initialIsLiked={initialIsLiked}
          initialLikeCount={initialLikeCount}
          isSignedIn={isSignedIn}
          key={`${postId}-${initialLikeCount}-${initialIsLiked}`}
          postId={postId}
        />

        <button
          aria-expanded={isOpen}
          aria-label="Open comments"
          className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm text-slate-400 transition-colors hover:bg-slate-900/60 hover:text-white"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <MessageCircle className="size-4 text-cyan-300" />
          <span>{comments.length}</span>
        </button>
      </div>

      {isOpen ? (
        <div className="space-y-3">
          <div className="space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article className="flex gap-3" key={comment.id}>
                  <Link href={`/profile/${comment.author.id}`}>
                    <Avatar className="size-9 transition-opacity hover:opacity-85">
                      <AvatarImage
                        src={comment.author.image ?? undefined}
                        alt={comment.author.name}
                      />
                      <AvatarFallback>
                        {getInitials(comment.author.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        className="text-sm font-semibold text-slate-100 transition-colors hover:text-cyan-200"
                        href={`/profile/${comment.author.id}`}
                      >
                        {comment.author.name}
                      </Link>
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                        <DogNameLine
                          className="min-w-0"
                          dogName={comment.author.dogName}
                          iconClassName="size-3.5"
                        />
                        <span className="shrink-0">&middot;</span>
                        <span className="shrink-0">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {comment.content}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No comments yet.</p>
            )}
          </div>

          <div className="flex items-start gap-2 border-t border-slate-700/60 pt-3">
            <textarea
              className="min-h-11 flex-1 resize-none rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isSignedIn || isCommenting}
              maxLength={300}
              onChange={(event) => setContent(event.target.value)}
              placeholder={
                isSignedIn ? "Write a comment..." : "Sign in to comment."
              }
              value={content}
            />

            <button
              aria-label="Add comment"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
              disabled={!canSubmit}
              onClick={handleAddComment}
              type="button"
            >
              {isCommenting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
