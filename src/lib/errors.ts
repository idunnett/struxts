import { ConvexError } from "convex/values"
import { CustomConvexErrorData } from "../types"

export class CustomConvexError extends ConvexError<CustomConvexErrorData> {
  constructor(data: CustomConvexErrorData) {
    super(data)
  }
}
