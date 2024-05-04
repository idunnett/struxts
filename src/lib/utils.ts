import { type ClassValue, clsx } from "clsx"
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
