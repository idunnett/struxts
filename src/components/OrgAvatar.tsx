import { cn } from "~/lib/utils"

interface Props {
  name: string
  src?: string | null
  className?: string
  size?: number
}

export function OrgAvatar({ name, src, className, size = 20 }: Props) {
  const initials = name.trim().slice(0, 2).toUpperCase() || "?"

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-sm object-cover", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm bg-primary/10 text-[9px] font-semibold text-primary",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  )
}
