import { ConvexError } from "convex/values"

export type CustomConvexErrorData = {
  statusCode: number
  message: string
}

export interface CustomConvexError extends ConvexError<CustomConvexErrorData> {}

export function isCustomConvexError(
  error: CustomConvexError | unknown,
): error is CustomConvexError {
  return (error as CustomConvexError)?.data?.statusCode !== undefined
}
