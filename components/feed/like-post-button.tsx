"use client";

import { Heart } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { toggleLikeAction } from "@/lib/social/post-actions";

type LikePostButtonProps = {
  initialIsLiked: boolean;
  initialLikeCount: number;
  isSignedIn: boolean;
  postId: string;
};

export function LikePostButton({
  initialIsLiked,
  initialLikeCount,
  isSignedIn,
  postId,
}: LikePostButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, startLiking] = useTransition();
  const isSubmittingRef = useRef(false);

  function handleLike() {
    if (isSubmittingRef.current || isLiking) {
      return;
    }

    if (!isSignedIn) {
      toast.error("Sign in to like posts.");
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;
    const nextIsLiked = !previousIsLiked;

    isSubmittingRef.current = true;
    setIsLiked(nextIsLiked);
    setLikeCount((count) => Math.max(0, count + (nextIsLiked ? 1 : -1)));

    startLiking(async () => {
      try {
        const result = await toggleLikeAction(postId);

        if (result.error) {
          setIsLiked(previousIsLiked);
          setLikeCount(previousLikeCount);
          toast.error(result.error);
          return;
        }

        if (typeof result.liked === "boolean" && result.liked !== nextIsLiked) {
          setIsLiked(result.liked);
          setLikeCount((count) => Math.max(0, count + (result.liked ? 1 : -1)));
        }
      } catch {
        setIsLiked(previousIsLiked);
        setLikeCount(previousLikeCount);
        toast.error("Something went wrong while updating this like.");
      } finally {
        isSubmittingRef.current = false;
      }
    });
  }

  return (
    <button
      aria-label={isLiked ? "Unlike post" : "Like post"}
      aria-pressed={isLiked}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm text-slate-400 transition-colors hover:bg-slate-900/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLiking}
      onClick={handleLike}
      type="button"
    >
      <Heart
        className={
          isLiked
            ? "size-4 fill-rose-400 text-rose-400"
            : "size-4 text-cyan-300"
        }
      />
      <span>{likeCount}</span>
    </button>
  );
}
