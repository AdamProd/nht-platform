export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-white/[0.06]" />
        <div className="h-8 w-48 rounded bg-white/[0.08]" />
        <div className="h-4 w-72 rounded bg-white/[0.04]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[var(--nht-radius-xl)] bg-white/[0.03]"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="h-80 rounded-[var(--nht-radius-xl)] bg-white/[0.03] xl:col-span-3" />
        <div className="h-80 rounded-[var(--nht-radius-xl)] bg-white/[0.03] xl:col-span-2" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--nht-radius-xl)] bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}
