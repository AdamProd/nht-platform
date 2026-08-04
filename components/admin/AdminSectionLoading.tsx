export default function AdminSectionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-3 w-16 rounded bg-white/[0.06]" />
      <div className="h-8 w-48 rounded bg-white/[0.08]" />
      <div className="h-4 w-72 max-w-full rounded bg-white/[0.04]" />
      <div className="h-40 rounded-[var(--nht-radius-xl)] bg-white/[0.03]" />
    </div>
  );
}
