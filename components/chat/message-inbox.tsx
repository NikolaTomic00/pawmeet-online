import { MessageCircle, Reply } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UnreadMessageThread } from "@/lib/social/messages";

type MessageInboxProps = {
  signedIn: boolean;
  threads: UnreadMessageThread[];
  unreadCount: number;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}

export function MessageInbox({
  signedIn,
  threads,
  unreadCount,
}: MessageInboxProps) {
  if (!signedIn) {
    return (
      <div className="flex min-h-[620px] flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 p-6 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-cyan-500/15">
          <MessageCircle className="size-10 text-cyan-300" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-200">
          Sign in to see messages
        </h3>
        <p className="max-w-md text-sm leading-6 text-slate-400">
          Your PawMeet messages will appear here after you sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[620px] rounded-xl border border-slate-700 bg-slate-950/40 shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
      <div className="border-b border-slate-700/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
              <MessageCircle className="size-5 text-cyan-300" />
              Messages
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You do not have new messages."}
            </p>
          </div>

          {unreadCount > 0 ? (
            <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300">
              {unreadCount} unread
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-5">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <article
              className="rounded-lg border border-slate-700/60 bg-slate-950/35 p-4"
              key={thread.sender.id}
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-11">
                  <AvatarImage
                    src={thread.sender.image ?? undefined}
                    alt={thread.sender.name}
                  />
                  <AvatarFallback>{getInitials(thread.sender.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-slate-100">
                      {thread.sender.name}
                    </p>
                    <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-300">
                      {thread.unreadCount} unread
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">
                    {thread.latestMessage.text ?? "Sent an image."}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatMessageTime(thread.latestMessage.createdAt)}
                  </p>
                </div>

                <Link
                  className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg bg-cyan-500 px-3 text-xs font-semibold text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400"
                  href={`/messages?userId=${thread.sender.id}`}
                >
                  <Reply className="size-4" />
                  Reply
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-5 text-sm text-slate-500">
            You do not have new messages.
          </div>
        )}
      </div>
    </div>
  );
}
