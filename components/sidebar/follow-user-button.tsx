"use client";

import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { toggleFollowAction } from "@/lib/social/follow-actions";

type FollowUserButtonProps = {
  initialFollowing: boolean;
  isSignedIn: boolean;
  userId: string;
};

export function FollowUserButton({
  initialFollowing,
  isSignedIn,
  userId,
}: FollowUserButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleFollow() {
    if (isPending) {
      return;
    }

    if (!isSignedIn) {
      toast.error("Sign in to follow people.");
      return;
    }

    const previousFollowing = isFollowing;
    const nextFollowing = !previousFollowing;

    setIsFollowing(nextFollowing);

    startTransition(async () => {
      try {
        const result = await toggleFollowAction(userId);

        if (result.error) {
          setIsFollowing(previousFollowing);
          toast.error(result.error);
          return;
        }

        if (typeof result.following === "boolean") {
          setIsFollowing(result.following);
        }
      } catch {
        setIsFollowing(previousFollowing);
        toast.error("Something went wrong while updating this follow.");
      }
    });
  }

  const Icon = isFollowing ? UserCheck : UserPlus;

  return (
    <button
      aria-label={isFollowing ? "Unfollow user" : "Follow user"}
      aria-pressed={isFollowing}
      className="inline-flex min-h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={handleFollow}
      type="button"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Icon className={isFollowing ? "size-4 text-cyan-300" : "size-4"} />
          <span>{isFollowing ? "Following" : "Follow"}</span>
        </>
      )}
    </button>
  );
}
