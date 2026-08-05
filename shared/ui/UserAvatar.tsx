type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "owner" | "admin" | "manager" | "creator" | "staff";
  className?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

const sizeClass = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
} as const;

const toneClass = {
  default: "border-white/[0.08] bg-white/[0.04] text-[var(--nht-accent)]",
  owner: "border-[var(--nht-accent)]/40 bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]",
  admin: "border-violet-400/30 bg-violet-500/15 text-violet-200",
  manager: "border-sky-400/30 bg-sky-500/15 text-sky-200",
  creator: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200",
  staff: "border-white/15 bg-white/[0.06] text-white/80",
} as const;

export default function UserAvatar({
  name,
  src,
  size = "sm",
  tone = "default",
  className = "",
}: UserAvatarProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-medium ${sizeClass[size]} ${toneClass[tone]} ${className}`}
      aria-hidden={!src}
      title={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export function roleTone(
  role: string | null | undefined,
): UserAvatarProps["tone"] {
  switch (role) {
    case "owner":
      return "owner";
    case "admin":
      return "admin";
    case "manager":
      return "manager";
    case "creator":
      return "creator";
    default:
      return "staff";
  }
}
