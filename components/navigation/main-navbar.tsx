import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Bell, Home, PawPrint, UserRound } from "lucide-react";
import Link from "next/link";

import { MobileNavbar } from "./mobile-navbar";

function getNavItems(currentUserId: string | null) {
  return [
  {
    label: "Feed",
    icon: Home,
    href: "/",
  },
  {
    label: "Notification",
    icon: Bell,
    href: "/notifications",
  },
  {
    label: "Profile",
    icon: UserRound,
    href: currentUserId ? `/profile/${currentUserId}` : "#",
  },
  ];
}

type MainNavbarProps = {
  currentUserId?: string | null;
  unreadCount?: number;
};

export function MainNavbar({
  currentUserId = null,
  unreadCount = 0,
}: MainNavbarProps) {
  const hasUnreadNotifications = unreadCount > 0;
  const navItems = getNavItems(currentUserId);

  return (
    <>
      <MobileNavbar currentUserId={currentUserId} unreadCount={unreadCount} />

      <nav className="hidden w-full flex-col gap-4 rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-md sm:px-6 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex items-center gap-2 text-xl font-bold text-slate-100">
            PawMeet
            <PawPrint className="size-5 text-cyan-300" />
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const className =
              "flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white";
            const isNotification = item.href === "/notifications";
            const iconClassName =
              isNotification && hasUnreadNotifications
                ? "size-4 text-rose-400"
                : "size-4 text-cyan-300";

            if (item.href !== "#") {
              return (
                <Link className={className} href={item.href} key={item.label}>
                  <Icon className={iconClassName} />
                  {item.label}
                  {isNotification && hasUnreadNotifications ? (
                    <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-300">
                      {unreadCount} unread
                    </span>
                  ) : null}
                </Link>
              );
            }

            return (
              <a className={className} href={item.href} key={item.label}>
                <Icon className={iconClassName} />
                {item.label}
              </a>
            );
          })}

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton>
                <button className="rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400">
                  Sign up
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>
    </>
  );
}
