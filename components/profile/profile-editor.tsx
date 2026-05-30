"use client";

import { Loader2, MapPin, PawPrint, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BorderAnimatedContainer } from "@/components/ui/border-animated-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@/db/schema";
import { updateProfileAction } from "@/lib/social/profile-actions";

type ProfileEditorProps = {
  canEdit: boolean;
  profile: User;
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
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

export function ProfileEditor({ canEdit, profile }: ProfileEditorProps) {
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [breed, setBreed] = useState(profile.breed ?? "");
  const [dogName, setDogName] = useState(profile.dogName ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [isSaving, startSaving] = useTransition();

  function handleSave() {
    startSaving(async () => {
      try {
        const result = await updateProfileAction({
          bio,
          breed,
          dogName,
          location,
        });

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success(result.success ?? "Profile updated.");
        router.refresh();
      } catch {
        toast.error("Something went wrong while updating your profile.");
      }
    });
  }

  return (
    <section className="min-w-0">
      <BorderAnimatedContainer>
        <Card className="w-full border-0 bg-slate-950/40 shadow-none backdrop-blur-md">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <UserRound className="size-5 text-cyan-300" />
                  {profile.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  @{profile.username}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {canEdit ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-300">
                      Dog name
                    </span>
                    <input
                      className="min-h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSaving}
                      maxLength={80}
                      onChange={(event) => setDogName(event.target.value)}
                      placeholder="e.g. Max"
                      value={dogName}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-300">
                      Breed
                    </span>
                    <input
                      className="min-h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSaving}
                      maxLength={80}
                      onChange={(event) => setBreed(event.target.value)}
                      placeholder="e.g. Golden Retriever"
                      value={breed}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Location
                  </span>
                  <input
                    className="min-h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                    maxLength={120}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. Belgrade"
                    value={location}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-300">
                    Description
                  </span>
                  <textarea
                    className="min-h-32 w-full resize-none rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                    maxLength={300}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Tell PawMeet friends about you and your pet."
                    value={bio}
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
                    disabled={isSaving}
                    onClick={handleSave}
                    type="button"
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {isSaving ? "Saving" : "Save profile"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {profile.bio ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-5 text-sm text-slate-500">
                    This profile has not added a description yet.
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  <ProfileDetail
                    icon={<PawPrint className="size-4 text-cyan-300" />}
                    label="Dog name"
                    value={profile.dogName}
                  />
                  <ProfileDetail
                    icon={<PawPrint className="size-4 text-cyan-300" />}
                    label="Breed"
                    value={profile.breed}
                  />
                  <ProfileDetail
                    icon={<MapPin className="size-4 text-cyan-300" />}
                    label="Location"
                    value={profile.location}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </BorderAnimatedContainer>
    </section>
  );
}
