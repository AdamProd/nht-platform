export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-pulse" aria-busy="true">
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-white/[0.06]" />
        <div className="h-9 w-56 rounded bg-white/[0.08]" />
        <div className="h-4 w-80 max-w-full rounded bg-white/[0.05]" />
      </div>
      <div className="h-24 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]"
          />
        ))}
      </div>
    </div>
  );
}
