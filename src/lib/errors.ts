import { ConvexError } from "convex/values"
import { CustomConvexErrorData } from "./custom-convex-error"

export class CustomConvexError extends ConvexError<CustomConvexErrorData> {
  constructor(data: CustomConvexErrorData) {
    super(data)
  }
}
