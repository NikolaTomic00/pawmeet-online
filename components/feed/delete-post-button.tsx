"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePostAction } from "@/lib/social/post-actions";

type DeletePostButtonProps = {
  postId: string;
};

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(async () => {
      try {
        const result = await deletePostAction(postId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        setOpen(false);
        toast.success(result.success ?? "Post deleted.");
      } catch {
        toast.error("Something went wrong while deleting this post.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          aria-label="Delete post"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/60 text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-white"
          type="button"
        >
          <Trash2 className="size-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the post and its comments, likes, and
            notifications.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
