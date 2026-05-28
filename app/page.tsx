import { MainNavbar } from "./components/main-navbar";
import { PawMeetShell } from "./components/pawmeet-shell";

export default function Home() {
  return (
    <PawMeetShell>
      <main className="min-h-[calc(100vh-2rem)] w-full px-2 sm:px-4">
        <MainNavbar />
      </main>
    </PawMeetShell>
  );
}
