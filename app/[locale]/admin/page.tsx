import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { logoutAction } from "@/features/auth";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Minimal protected admin shell for Auth commit.
 * Full sidebar/header arrives in Admin Layout commit.
 */
export default async function AdminHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireStaff();

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Authenticated
        </h1>
        <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
          Signed in as{" "}
          <span className="text-white">
            {session.profile.full_name ?? session.user.email}
          </span>{" "}
          · role{" "}
          <span className="text-[var(--nht-gold)]">{session.profile.role}</span>
        </p>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-full border border-white/10 px-6 py-3 text-sm text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05]"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
