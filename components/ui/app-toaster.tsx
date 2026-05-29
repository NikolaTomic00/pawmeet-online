"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#0f172a",
          border: "1px solid rgba(34, 211, 238, 0.35)",
          color: "#e2e8f0",
        },
        success: {
          iconTheme: {
            primary: "#22d3ee",
            secondary: "#0f172a",
          },
        },
        error: {
          iconTheme: {
            primary: "#fb7185",
            secondary: "#0f172a",
          },
        },
      }}
    />
  );
}
