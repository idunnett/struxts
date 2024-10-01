import { clsx, type ClassValue } from "clsx"
import ky from "ky"
import { twMerge } from "tailwind-merge"
import { env } from "../env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdmin(role: string | undefined | null) {
  return role === "Owner" || role === "Admin"
}

export function isOwner(role: string | undefined | null) {
  return role === "Owner"
}

export async function downloadFile(
  storageId: string,
  opts: { token: string | null },
) {
  const getFileUrl = new URL(`${env.NEXT_PUBLIC_CONVEX_SITE_URL}/getFile`)
  getFileUrl.searchParams.set("storageId", storageId)
  const blob = await ky(getFileUrl.toString(), {
    headers: {
      Authorization: `Bearer ${opts.token}`,
    },
  }).blob()

  if (blob.type.startsWith("image/")) {
    const bmp = await createImageBitmap(blob)
    const { width, height } = bmp
    bmp.close() // free memory
    const src = URL.createObjectURL(blob)
    return { src, width, height }
  }

  return { src: URL.createObjectURL(blob), width: 0, height: 0 }
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
