import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { PawMeetShell } from "./components/pawmeet-shell";

export default function Home() {
  return (
    <PawMeetShell>
      <main className="min-h-[calc(100vh-2rem)] w-full">
        <nav className="flex items-center justify-end gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-lg border border-slate-700/70 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-sm transition-colors hover:border-cyan-400/70 hover:text-white">
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
        </nav>
      </main>
    </PawMeetShell>
  );
}
