"use client";

import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { User } from "@/db/schema";
import { createPostAction } from "@/lib/social/post-actions";

type CreatePostProps = {
  user: User | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CreatePost({ user }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isPosting, startPosting] = useTransition(); // isPosting is true until change is rendered

  const canPost = Boolean(content.trim() || imageUrl.trim());

  function handlePost() {
    startPosting(async () => {
      try {
        const result = await createPostAction(content, imageUrl || null);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        toast.success(result.success ?? "Post created.");
      } catch {
        toast.error("Something went wrong while creating your post.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex gap-3">
          <Avatar className="size-11">
            {user ? (
              <>
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </>
            ) : (
              <AvatarFallback>PM</AvatarFallback>
            )}
          </Avatar>

          <textarea
            className="min-h-24 flex-1 resize-none rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70"
            disabled={!user || isPosting}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              user
                ? `What's new with ${user.dogName ?? "your pet"}?`
                : "Sign in to share a post."
            }
            value={content}
          />
        </div>

        {showImageUpload ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/70">
                  <ImagePlus className="size-5 text-cyan-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    Image upload is next
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    This panel is ready for the uploader.
                  </p>
                </div>
              </div>

              <button
                aria-label="Hide image upload"
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/60 text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-white"
                disabled={isPosting}
                onClick={() => {
                  setImageUrl("");
                  setShowImageUpload(false);
                }}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!user || isPosting}
            onClick={() => setShowImageUpload((value) => !value)}
            type="button"
          >
            <ImagePlus className="size-4 text-cyan-300" />
            Image
          </button>

          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
            disabled={!user || !canPost || isPosting}
            onClick={handlePost}
            type="button"
          >
            {isPosting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {isPosting ? "Posting" : "Post"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
