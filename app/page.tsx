import { MainNavbar } from "./components/main-navbar";
import { PawMeetShell } from "./components/pawmeet-shell";
import { syncUser } from "@/lib/sync-user";

export default async function Home() {
  await syncUser();

  return (
    <PawMeetShell>
      <main className="min-h-[calc(100vh-2rem)] w-full px-2 sm:px-4">
        <MainNavbar />
      </main>
    </PawMeetShell>
  );
}
