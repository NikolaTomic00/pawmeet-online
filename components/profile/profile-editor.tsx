"use client";

import { useClerk } from "@clerk/nextjs";
import {
  Camera,
  ImagePlus,
  Images,
  Loader2,
  MapPin,
  PawPrint,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { BorderAnimatedContainer } from "@/components/ui/border-animated-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProfilePhoto, User } from "@/db/schema";
import {
  addProfilePhotoAction,
  deleteProfilePhotoAction,
  updateProfileAction,
} from "@/lib/social/profile-actions";

import { DogNameLine } from "./dog-name-line";

type ProfileEditorProps = {
  canEdit: boolean;
  profile: User;
  photos: ProfilePhoto[];
  stats: {
    followers: number;
    following: number;
  };
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

function mergeProfilePhotos({
  deletedPhotoIds,
  localPhotos,
  serverPhotos,
}: {
  deletedPhotoIds: string[];
  localPhotos: ProfilePhoto[];
  serverPhotos: ProfilePhoto[];
}) {
  const deletedIds = new Set(deletedPhotoIds);
  const seenKeys = new Set<string>();
  const mergedPhotos: ProfilePhoto[] = [];

  for (const photo of [...localPhotos, ...serverPhotos]) {
    if (deletedIds.has(photo.id)) {
      continue;
    }

    const keys = [
      `id:${photo.id}`,
      photo.publicId ? `public:${photo.publicId}` : null,
      `image:${photo.image}`,
    ].filter(Boolean) as string[];

    if (keys.some((key) => seenKeys.has(key))) {
      continue;
    }

    keys.forEach((key) => seenKeys.add(key));
    mergedPhotos.push(photo);
  }

  return mergedPhotos;
}

function ProfilePhotoGrid({
  canDelete = false,
  emptyText,
  onDeleted,
  photos,
}: {
  canDelete?: boolean;
  emptyText: string;
  onDeleted?: (photoId: string) => void;
  photos: ProfilePhoto[];
}) {
  if (!photos.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-4 text-sm text-slate-500">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <div
          className="group relative aspect-square overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/50"
          key={photo.id}
        >
          <a
            className="flex size-full items-center justify-center"
            href={photo.image}
            rel="noreferrer"
            target="_blank"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
            />
          </a>

          {canDelete ? (
            <DeleteProfilePhotoButton
              onDeleted={onDeleted}
              photoId={photo.id}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DeleteProfilePhotoButton({
  onDeleted,
  photoId,
}: {
  onDeleted?: (photoId: string) => void;
  photoId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(async () => {
      try {
        const result = await deleteProfilePhotoAction(photoId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        onDeleted?.(photoId);
        setOpen(false);
        toast.success(result.success ?? "Profile photo deleted.");
      } catch {
        toast.error("Something went wrong while deleting this photo.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          aria-label="Delete profile photo"
          className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-950/80 text-slate-200 shadow-lg shadow-slate-950/40 transition-colors hover:border-red-400/70 hover:text-red-200"
          type="button"
        >
          <Trash2 className="size-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this profile photo.
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

export function ProfileEditor({
  canEdit,
  photos,
  profile,
  stats,
}: ProfileEditorProps) {
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [breed, setBreed] = useState(profile.breed ?? "");
  const [dogName, setDogName] = useState(profile.dogName ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [uploadedPhotos, setUploadedPhotos] = useState<{
    photos: ProfilePhoto[];
    profileId: string;
  }>({
    photos: [],
    profileId: profile.id,
  });
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const displayedPhotos = mergeProfilePhotos({
    deletedPhotoIds,
    localPhotos: uploadedPhotos.profileId === profile.id ? uploadedPhotos.photos : [],
    serverPhotos: photos,
  });

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

  function handleEditProfilePicture() {
    openUserProfile();
  }

  async function handleProfilePhotoUpload(file: File) {
    setIsPhotoUploading(true);

    try {
      const uploadFormData = new FormData();

      uploadFormData.append("file", file);
      uploadFormData.append("purpose", "profile");

      const response = await fetch("/api/uploads/cloudinary", {
        body: uploadFormData,
        method: "POST",
      });
      const uploadResult = (await response.json()) as {
        error?: string;
        height?: number | null;
        publicId?: string | null;
        secureUrl?: string;
        width?: number | null;
      };

      if (!response.ok || !uploadResult.secureUrl) {
        toast.error(uploadResult.error ?? "Image upload failed.");
        return;
      }

      const result = await addProfilePhotoAction({
        height: uploadResult.height,
        publicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        width: uploadResult.width,
      });

      const savedPhoto = result.photo;

      if (result.error || !savedPhoto) {
        toast.error(result.error ?? "Profile photo could not be saved.");
        return;
      }

      setUploadedPhotos((currentPhotos) => ({
        photos: [
          savedPhoto,
          ...(currentPhotos.profileId === profile.id ? currentPhotos.photos : []),
        ],
        profileId: profile.id,
      }));
      toast.success(result.success ?? "Profile photo uploaded.");
      router.refresh();
    } catch {
      toast.error("Something went wrong while uploading your profile photo.");
    } finally {
      setIsPhotoUploading(false);
    }
  }

  return (
    <section className="min-w-0">
      <BorderAnimatedContainer>
        <Card className="w-full border-0 bg-slate-950/40 shadow-none backdrop-blur-md">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-16 shrink-0">
                  <AvatarImage
                    src={profile.image ?? undefined}
                    alt={profile.name}
                  />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <UserRound className="size-5 shrink-0 text-cyan-300" />
                    <span className="truncate">{profile.name}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <DogNameLine dogName={profile.dogName} />
                  </CardDescription>
                </div>
              </div>

              {canEdit ? (
                <button
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-400/70 hover:text-white"
                  onClick={handleEditProfilePicture}
                  type="button"
                >
                  <Camera className="size-4 text-cyan-300" />
                  Edit profile
                </button>
              ) : null}
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

                <div className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Images className="size-4 text-cyan-300" />
                        Profile photos
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        JPG, PNG, WEBP, or GIF up to 5 MB.
                      </p>
                    </div>

                    <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400 has-disabled:cursor-not-allowed has-disabled:bg-slate-700 has-disabled:text-slate-400 has-disabled:shadow-none">
                      {isPhotoUploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ImagePlus className="size-4" />
                      )}
                      {isPhotoUploading ? "Uploading" : "Upload picture"}
                      <input
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={isPhotoUploading || isSaving}
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (file) {
                            void handleProfilePhotoUpload(file);
                          }

                          event.target.value = "";
                        }}
                        type="file"
                      />
                    </label>
                  </div>

                  <div className="mt-4">
                    <ProfilePhotoGrid
                      canDelete
                      emptyText="No profile photos yet."
                      onDeleted={(photoId) => {
                        setDeletedPhotoIds((currentPhotoIds) => [
                          ...currentPhotoIds,
                          photoId,
                        ]);
                        router.refresh();
                      }}
                      photos={displayedPhotos}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
                    <p className="text-lg font-semibold text-slate-100">
                      {stats.followers}
                    </p>
                    <p className="text-xs text-slate-400">Followers</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
                    <p className="text-lg font-semibold text-slate-100">
                      {stats.following}
                    </p>
                    <p className="text-xs text-slate-400">Following</p>
                  </div>
                </div>

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

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Images className="size-4 text-cyan-300" />
                    Profile photos
                  </div>
                  <ProfilePhotoGrid
                    emptyText="This profile has not uploaded photos yet."
                    photos={displayedPhotos}
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
