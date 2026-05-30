import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";

import { DogNameLine } from "@/components/profile/dog-name-line";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BorderAnimatedContainer } from "@/components/ui/border-animated-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NotificationWithDetails } from "@/lib/social/notifications";

type NotificationsViewProps = {
  notifications: NotificationWithDetails[];
  unreadCount: number;
  userSignedIn: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatNotificationDate(date: Date | string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function getNotificationText(notification: NotificationWithDetails) {
  if (notification.type === "follow") {
    return "started following you";
  }

  if (notification.type === "like") {
    return "liked your post";
  }

  return "commented on your post";
}

function PostPreview({
  notification,
}: {
  notification: NotificationWithDetails;
}) {
  if (!notification.post || notification.type === "follow") {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <DogNameLine
          className="font-medium text-slate-300"
          dogName={notification.post.author.dogName}
          iconClassName="size-3.5"
        />
        <span>{formatNotificationDate(notification.post.createdAt)}</span>
      </div>

      {notification.post.content ? (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
          {notification.post.content}
        </p>
      ) : null}

      {notification.post.image ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={notification.post.image}
            alt=""
            className="max-h-48 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

function NotificationItem({
  notification,
}: {
  notification: NotificationWithDetails;
}) {
  const Icon =
    notification.type === "like"
      ? Heart
      : notification.type === "comment"
        ? MessageCircle
        : UserPlus;

  return (
    <article className="rounded-lg border border-slate-700/60 bg-slate-950/35 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          <AvatarImage
            src={notification.creator.image ?? undefined}
            alt={notification.creator.name}
          />
          <AvatarFallback>{getInitials(notification.creator.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-slate-100">
              {notification.creator.name}
            </p>
            <DogNameLine
              className="text-xs text-slate-500"
              dogName={notification.creator.dogName}
              iconClassName="size-3.5"
            />
            {!notification.read ? (
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-300">
                new
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Icon
              className={
                notification.type === "like"
                  ? "size-4 text-rose-300"
                  : notification.type === "comment"
                    ? "size-4 text-cyan-300"
                    : "size-4 text-emerald-300"
              }
            />
            <span>{getNotificationText(notification)}</span>
            <span className="text-xs text-slate-500">
              {formatNotificationDate(notification.createdAt)}
            </span>
          </div>

          <PostPreview notification={notification} />
        </div>
      </div>
    </article>
  );
}

export function NotificationsView({
  notifications,
  unreadCount,
  userSignedIn,
}: NotificationsViewProps) {
  const unreadLabel = `${unreadCount} unread`;

  return (
    <section className="min-w-0">
      <BorderAnimatedContainer>
        <Card className="w-full border-0 bg-slate-950/40 shadow-none backdrop-blur-md">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="size-5 text-cyan-300" />
                  Notifications
                </CardTitle>
                <CardDescription className="mt-2">
                  {userSignedIn
                    ? unreadLabel
                    : "Sign in to see your notifications."}
                </CardDescription>
              </div>

              {userSignedIn ? (
                <span className="rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
                  {notifications.length} total
                </span>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {!userSignedIn ? (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-5 text-sm text-slate-500">
                Your likes, comments, and follows will appear here after you
                sign in.
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-5 text-sm text-slate-500">
                No notifications yet.
              </div>
            )}
          </CardContent>
        </Card>
      </BorderAnimatedContainer>
    </section>
  );
}
