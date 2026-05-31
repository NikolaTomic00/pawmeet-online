"use client";

import { MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { FollowUserButton } from "@/components/sidebar/follow-user-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatUserSummary } from "@/lib/social/messages";

import { DogNameLine } from "../profile/dog-name-line";

type ChatSidebarTabsProps = {
  chats: ChatUserSummary[];
  contacts: ChatUserSummary[];
  currentUserId: string | null;
  followedUserIds: string[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function UserCard({
  currentUserId,
  followedUserIds,
  showFollow,
  user,
}: {
  currentUserId: string | null;
  followedUserIds: string[];
  showFollow: boolean;
  user: ChatUserSummary;
}) {
  const isAlreadyFollowing = followedUserIds.includes(user.id);

  return (
    <div className="space-y-3 rounded-lg border border-slate-700/60 bg-slate-900/30 p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {user.name}
          </p>
          <DogNameLine
            className="text-xs text-slate-500"
            dogName={user.dogName}
            iconClassName="size-3.5"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Link
          className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 text-xs font-semibold text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400"
          href={`/messages?userId=${user.id}`}
        >
          <MessageCircle className="size-4" />
          Send message
        </Link>

        <Link
          className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/50 px-3 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-400/70 hover:text-white"
          href={`/profile/${user.id}`}
        >
          <UserRound className="size-4 text-cyan-300" />
          View profile
        </Link>

        {showFollow && !isAlreadyFollowing ? (
          <FollowUserButton
            initialFollowing={false}
            isSignedIn={Boolean(currentUserId)}
            userId={user.id}
          />
        ) : null}
      </div>
    </div>
  );
}

export function ChatSidebarTabs({
  chats,
  contacts,
  currentUserId,
  followedUserIds,
}: ChatSidebarTabsProps) {
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");
  const [activeTab, setActiveTab] = useState<"users" | "chats">("users");
  const activeUsers = activeTab === "users" ? contacts : chats;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-700/70 bg-slate-900/40 p-1">
        <button
          className={`min-h-9 rounded-md text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-slate-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("users")}
          type="button"
        >
          Users
        </button>
        <button
          className={`min-h-9 rounded-md text-sm font-medium transition-colors ${
            activeTab === "chats"
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-slate-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("chats")}
          type="button"
        >
          Chats
        </button>
      </div>

      {activeUsers.length > 0 ? (
        <div className="space-y-3">
          {activeUsers.map((user) => (
            <div
              className={
                selectedUserId === user.id
                  ? "rounded-lg ring-1 ring-cyan-400/60"
                  : ""
              }
              key={user.id}
            >
              <UserCard
                currentUserId={currentUserId}
                followedUserIds={followedUserIds}
                showFollow={activeTab === "users"}
                user={user}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-4 text-sm leading-6 text-slate-500">
          {activeTab === "users"
            ? "More PawMeet users will appear here as people join."
            : "No conversations yet. Send a message to start one."}
        </p>
      )}
    </div>
  );
}
