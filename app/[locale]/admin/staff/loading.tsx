export default function StaffLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-white/[0.06]" />
        <div className="h-9 w-48 rounded bg-white/[0.08]" />
        <div className="h-4 w-80 max-w-full rounded bg-white/[0.05]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]"
          />
        ))}
      </div>
      <div className="h-28 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]" />
      <div className="h-64 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]" />
    </div>
  );
}
