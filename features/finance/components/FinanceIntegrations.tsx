export default function FinanceIntegrations({
  labels,
}: {
  labels: {
    title: string;
    description: string;
    comingSoon: string;
    providers: {
      stripe: string;
      wise: string;
      paypal: string;
      crypto: string;
      bankTransfer: string;
    };
  };
}) {
  const providers = [
    ["stripe", labels.providers.stripe],
    ["wise", labels.providers.wise],
    ["paypal", labels.providers.paypal],
    ["crypto", labels.providers.crypto],
    ["bankTransfer", labels.providers.bankTransfer],
  ] as const;

  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm font-medium text-white">{labels.title}</h2>
      <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
        {labels.description}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {providers.map(([key, name]) => (
          <div
            key={key}
            className="rounded-[var(--nht-radius-lg)] border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-4"
          >
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="mt-2 text-xs text-[var(--nht-text-tertiary)]">
              {labels.comingSoon}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
