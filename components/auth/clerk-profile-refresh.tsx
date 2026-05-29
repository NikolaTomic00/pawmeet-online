"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

type ClerkProfileRefreshProps = {
  serverProfile: {
    email: string;
    image: string | null;
    name: string;
    username: string;
  } | null;
};

function getDisplayName(user: NonNullable<ReturnType<typeof useUser>["user"]>) {
  const fullName =
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.username || "PawMeet user";
}

function getPrimaryEmail(user: NonNullable<ReturnType<typeof useUser>["user"]>) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  );
}

function getUsername(email: string) {
  return email.split("@")[0];
}

export function ClerkProfileRefresh({
  serverProfile,
}: ClerkProfileRefreshProps) {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const lastRequestedSignature = useRef<string | null>(null);

  const serverSignature = useMemo(() => {
    if (!serverProfile) {
      return null;
    }

    return [
      serverProfile.email,
      serverProfile.username,
      serverProfile.name,
      serverProfile.image ?? "",
    ].join("|");
  }, [serverProfile]);

  const clerkSignature = useMemo(() => {
    if (!isLoaded || !user) {
      return null;
    }

    const email = getPrimaryEmail(user);

    return [
      email,
      getUsername(email),
      getDisplayName(user),
      user.imageUrl || "",
    ].join("|");
  }, [isLoaded, user]);

  useEffect(() => {
    if (!clerkSignature || serverSignature === clerkSignature) {
      return;
    }

    if (lastRequestedSignature.current === clerkSignature) {
      return;
    }

    lastRequestedSignature.current = clerkSignature;
    router.refresh();
  }, [clerkSignature, router, serverSignature]);

  return null;
}
