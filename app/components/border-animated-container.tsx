type BorderAnimatedContainerProps = {
  children: React.ReactNode;
};

export function BorderAnimatedContainer({
  children,
}: BorderAnimatedContainerProps) {
  return (
    <div className="paw-border-container animate-border">{children}</div>
  );
}
