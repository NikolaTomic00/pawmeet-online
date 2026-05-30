import { Dog } from "lucide-react";

type DogNameLineProps = {
  className?: string;
  dogName: string | null;
  iconClassName?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function DogNameLine({
  className,
  dogName,
  iconClassName,
}: DogNameLineProps) {
  const label = dogName?.trim() || "Dog name not set";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <Dog className={cn("size-4 shrink-0 text-cyan-300", iconClassName)} />
      <span className="truncate">{label}</span>
    </span>
  );
}
