import axios from "axios"
import { clsx, type ClassValue } from "clsx"
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
  const res = await axios.get(getFileUrl.toString(), {
    headers: {
      Authorization: `Bearer ${opts.token}`,
    },
    responseType: "blob",
  })
  const blob = res.data
  const bmp = await createImageBitmap(blob)
  const { width, height } = bmp
  bmp.close() // free memory
  const src = URL.createObjectURL(blob)
  return { src, width, height }
}
