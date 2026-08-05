type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[var(--nht-radius-md)] bg-white/[0.06] ${className}`}
      aria-hidden
    />
  );
}

export function PageSkeleton({
  cards = 4,
  showTable = true,
}: {
  cards?: number;
  showTable?: boolean;
}) {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {cards > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[var(--nht-radius-xl)]" />
          ))}
        </div>
      ) : null}
      <Skeleton className="h-16 rounded-[var(--nht-radius-xl)]" />
      {showTable ? (
        <Skeleton className="h-72 rounded-[var(--nht-radius-xl)]" />
      ) : null}
    </div>
  );
}

export default PageSkeleton;
