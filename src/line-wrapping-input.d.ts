declare module "react-line-wrapping-input" {
  import type React from "react"

  type Props = Omit<
    HTMLProps<HTMLTextAreaElement>,
    "aria-multiline" | "rows"
  > & {
    containerClassName?: string
    containerStyle?: Omit<React.CSSProperties, "display">
    blurOnLineBreak?: boolean
    onReturn?: React.ChangeEventHandler<HTMLTextAreaElement>
    suffix?: string
    suffixClassName?: string
    suffixStyle?: React.CSSProperties
    readOnly?: boolean
    overlapTechnique?: "grid" | "absolute"
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onClick?: React.MouseEventHandler<HTMLInputElement>
    onMouseDown?: React.MouseEventHandler<HTMLInputElement>
    onFocus?: React.FocusEventHandler<HTMLInputElement>
    onBlur?: React.FocusEventHandler<HTMLInputElement>
    onDoubleClick?: React.MouseEventHandler<HTMLInputElement>
  }

  declare const LineWrappingInput: React.FC<Props>

  export default LineWrappingInput
}
