"use client";

import { updatePlatformAccount } from "@/features/cabinet/profile/actions/cabinet";
import { CABINET_PLATFORMS } from "@/features/cabinet/types";
import { FlashToast, useActionToast } from "@/features/cabinet/dashboard/FlashToast";
import type { Tables } from "@/types/database.types";
import { Constants } from "@/types/database.types";

type Labels = {
  fields: {
    username: string;
    profileUrl: string;
    status: string;
    managerNotes: string;
  };
  status: Record<string, string>;
  platforms: Record<string, string>;
  actions: { save: string; saving: string; saved: string; saveError: string };
};

export default function PlatformsForm({
  accounts,
  labels,
}: {
  accounts: Tables<"creator_platform_accounts">[];
  labels: Labels;
}) {
  const { toast, tone, isPending, run } = useActionToast();
  const byPlatform = Object.fromEntries(
    accounts.map((account) => [account.platform, account]),
  );

  return (
    <>
      <div className="space-y-4">
        {CABINET_PLATFORMS.map((platform) => {
          const account = byPlatform[platform];
          return (
            <form
              key={platform}
              className="grid gap-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2"
              action={(formData) => {
                run(
                  () =>
                    updatePlatformAccount({
                      platform,
                      username: formData.get("username"),
                      profile_url: formData.get("profile_url"),
                      status: formData.get("status"),
                    }),
                  labels.actions.saved,
                  labels.actions.saveError,
                );
              }}
            >
              <h2 className="sm:col-span-2 text-sm font-medium text-white">
                {labels.platforms[platform] ?? platform}
              </h2>
              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.fields.username}
                </span>
                <input
                  name="username"
                  defaultValue={account?.username ?? ""}
                  className="nht-input"
                />
              </label>
              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.fields.profileUrl}
                </span>
                <input
                  name="profile_url"
                  defaultValue={account?.profile_url ?? ""}
                  className="nht-input"
                />
              </label>
              <label className="block">
                <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                  {labels.fields.status}
                </span>
                <select
                  name="status"
                  defaultValue={account?.status ?? "pending"}
                  className="nht-input"
                >
                  {Constants.public.Enums.platform_link_status.map((status) => (
                    <option key={status} value={status}>
                      {labels.status[status] ?? status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="block">
                <p className="text-overline text-[var(--nht-text-tertiary)]">
                  {labels.fields.managerNotes}
                </p>
                <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
                  {account?.manager_notes || "—"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:bg-white/[0.05] disabled:opacity-50"
                >
                  {isPending ? labels.actions.saving : labels.actions.save}
                </button>
              </div>
            </form>
          );
        })}
      </div>
      <FlashToast message={toast} tone={tone} />
    </>
  );
}
