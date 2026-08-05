"use client";

export default function PrintReceiptButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/[0.05]"
    >
      {label}
    </button>
  );
}
