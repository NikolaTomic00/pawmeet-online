import { Bell, Home, PawPrint, UserRound } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const navItems = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Notification",
    icon: Bell,
    href: "#",
  },
  {
    label: "Profile",
    icon: UserRound,
    href: "#",
  },
];

export function MainNavbar() {
  return (
    <nav className="flex w-full flex-col gap-4 rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-md sm:px-6 lg:flex-row lg:items-center lg:justify-between">
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

          if (item.href === "/") {
            return (
              <Link className={className} href={item.href} key={item.label}>
                <Icon className="size-4 text-cyan-300" />
                {item.label}
              </Link>
            );
          }

          return (
            <a className={className} href={item.href} key={item.label}>
              <Icon className="size-4 text-cyan-300" />
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
  );
}
