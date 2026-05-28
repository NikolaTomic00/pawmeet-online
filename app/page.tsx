import { PawMeetShell } from "./components/pawmeet-shell";

export default function Home() {
  return (
    <PawMeetShell>
      <main className="min-h-[calc(100vh-2rem)] w-full" aria-hidden="true" />
    </PawMeetShell>
  );
}
