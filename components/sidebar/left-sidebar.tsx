import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { MapPin, PawPrint } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/db/schema";

type LeftSidebarProps = {
  user: User | null;
  stats: {
    followers: number;
    following: number;
  } | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ProfileDetail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

export function LeftSidebar({ user, stats }: LeftSidebarProps) {
  if (!user) {
    return (
      <aside className="hidden h-full lg:block">
        <Card className="sticky top-4 min-h-[calc(100vh-8rem)] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl py-6">Join PawMeet</CardTitle>
            <CardDescription>
              Create an account and start meeting other animal lovers.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl">
              <Image
                src="/signup.png"
                alt="People using mobile devices"
                width={420}
                height={320}
                className="h-auto w-full object-contain py-10"
              />
              <div className="mt-6 text-center">
                <h3 className="text-xl font-medium text-cyan-400">
                  Start Your Journey Today
                </h3>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="auth-badge">Free</span>
                  <span className="auth-badge">Easy Setup</span>
                  <span className="auth-badge">Private</span>
                </div>
              </div>
            </div>

            <SignUpButton>
              <button className="mt-5 w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400">
                Create an account
              </button>
            </SignUpButton>

            <p className="mt-4 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <SignInButton>
                <button className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                  Log in
                </button>
              </SignInButton>
            </p>
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="hidden h-full lg:block">
      <Card className="sticky top-4 min-h-[calc(100vh-8rem)]">
        <CardHeader className="items-center text-center">
          <Avatar className="size-20">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
              <p className="text-lg font-semibold text-slate-100">
                {stats?.followers ?? 0}
              </p>
              <p className="text-xs text-slate-400">Followers</p>
            </div>
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
              <p className="text-lg font-semibold text-slate-100">
                {stats?.following ?? 0}
              </p>
              <p className="text-xs text-slate-400">Following</p>
            </div>
          </div>

          <Separator />

          {user.bio ? (
            <p className="text-sm leading-6 text-slate-300">{user.bio}</p>
          ) : (
            <p className="text-sm leading-6 text-slate-500">
              Add a bio to tell PawMeet friends about you and your pet.
            </p>
          )}

          <div className="space-y-2">
            {user.location ? (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="size-4 text-cyan-300" />
                {user.location}
              </div>
            ) : null}

            <ProfileDetail label="Dog name" value={user.dogName} />
            <ProfileDetail label="Breed" value={user.breed} />
          </div>

          {user.dogName || user.breed ? (
            <div className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
              <PawPrint className="size-4" />
              Pet profile ready
            </div>
          ) : null}
        </CardContent>
      </Card>
    </aside>
  );
}
