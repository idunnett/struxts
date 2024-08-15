import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CustomConvexError } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdmin(role: string | undefined | null) {
  return role === "Owner" || role === "Admin"
}

export function isOwner(role: string | undefined | null) {
  return role === "Owner"
}

export function isCustomConvexError(
  error: CustomConvexError | unknown,
): error is CustomConvexError {
  return (error as CustomConvexError).data.statusCode !== undefined
}
