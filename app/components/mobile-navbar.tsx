"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Bell, Home, Menu, PawPrint, UserRound } from "lucide-react";
import Link from "next/link";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const mobileNavItems = [
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

const mobileLinkClass =
  "flex min-h-12 w-full items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 text-base font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white";

export function MobileNavbar() {
  return (
    <nav className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-3 shadow-2xl shadow-cyan-950/20 backdrop-blur-md lg:hidden">
      <Link className="flex items-center gap-3" href="/">
        <span className="flex items-center gap-2 text-xl font-bold text-slate-100">
          PawMeet
          <PawPrint className="size-5 text-cyan-300" />
        </span>
      </Link>

      <Sheet>
        <SheetTrigger asChild>
          <button
            className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900/60 text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white"
            aria-label="Open navigation menu"
            type="button"
          >
            <Menu className="size-5 text-cyan-300" />
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full">
          <SheetHeader className="pr-12">
            <SheetTitle className="flex items-center gap-2 text-xl">
              PawMeet
              <PawPrint className="size-5 text-cyan-300" />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Mobile navigation menu
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-1 flex-col gap-3">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;

              if (item.href === "/") {
                return (
                  <SheetClose asChild key={item.label}>
                    <Link className={mobileLinkClass} href={item.href}>
                      <Icon className="size-5 text-cyan-300" />
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              }

              return (
                <SheetClose asChild key={item.label}>
                  <a className={mobileLinkClass} href={item.href}>
                    <Icon className="size-5 text-cyan-300" />
                    {item.label}
                  </a>
                </SheetClose>
              );
            })}
          </div>

          <div className="border-t border-slate-700/70 pt-4">
            <Show when="signed-out">
              <div className="grid gap-3">
                <SignInButton>
                  <button className="min-h-11 rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="min-h-11 rounded-lg bg-cyan-500 px-4 text-sm font-medium text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-3">
                <span className="text-sm font-medium text-slate-300">
                  Account
                </span>
                <UserButton />
              </div>
            </Show>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
