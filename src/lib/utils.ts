import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdmin(role: string | undefined | null) {
  return role === "Owner" || role === "Admin"
}

export function isOwner(role: string | undefined | null) {
  return role === "Owner"
}

export async function loadBlobFromUrl(url: string) {
  const blob = await fetch(url).then((r) => r.blob())

  if (blob.type.startsWith("image/")) {
    const bmp = await createImageBitmap(blob)
    const { width, height } = bmp
    bmp.close()
    const src = URL.createObjectURL(blob)
    return { src, width, height, blob }
  }

  return { src: URL.createObjectURL(blob), width: 0, height: 0, blob }
}

/** @deprecated Prefer Convex `files.getDownloadUrl` + `loadBlobFromUrl` */
export async function downloadFile(
  _storageId: string,
  opts: { url?: string; token?: string | null },
) {
  if (!opts.url) throw new Error("downloadFile requires a url from getDownloadUrl")
  const { src, width, height } = await loadBlobFromUrl(opts.url)
  return { src, width, height }
}

export function getOrigin() {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" &&
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  )
    return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`

  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

  return "http://localhost:3000"
}
