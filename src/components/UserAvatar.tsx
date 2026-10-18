import { cn } from "~/lib/utils"

interface Props {
  src?: string | null
  name?: string | null
  className?: string
  size?: number
}

function initials(name?: string | null) {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?"
}

export function UserAvatar({ src, name, className, size = 24 }: Props) {
  const label = name?.trim() || "User"

  if (src) {
    // Native img avoids next/image remotePatterns issues; no-referrer is
    // required for Google profile photos to load when hotlinked.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  )
}
