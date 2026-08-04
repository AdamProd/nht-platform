export default function ApplicationDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded bg-white/[0.06]" />
      <div className="h-4 w-40 rounded bg-white/[0.04]" />
      <div className="h-48 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-32 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
        <div className="h-32 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
        <div className="h-32 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
      </div>
    </div>
  );
}
