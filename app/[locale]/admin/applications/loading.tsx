export default function ApplicationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-white/[0.06]" />
      <div className="h-4 w-80 rounded bg-white/[0.04]" />
      <div className="h-28 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
      <div className="h-64 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
    </div>
  );
}
