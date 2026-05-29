type PawMeetShellProps = {
  children: React.ReactNode;
};

export function PawMeetShell({ children }: PawMeetShellProps) {
  return (
    <div className="paw-app-shell flex items-center justify-center p-4">
      <div className="paw-grid-bg" />
      <div className="paw-glow paw-glow-pink" />
      <div className="paw-glow paw-glow-cyan" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
