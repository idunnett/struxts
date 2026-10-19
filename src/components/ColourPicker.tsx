import { Circle, CircleSlash } from "lucide-react"
import { colours } from "../lib/constants"

interface Props {
  onColourChoose: (colour: string) => void
}

export function ColourPicker({ onColourChoose }: Props) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-1">
      {colours.map((colour) => (
        <button
          key={colour.value}
          className="rounded-full border transition-all hover:border-primary/50"
          style={{
            color: colour.value,
          }}
          onClick={() => onColourChoose(colour.value)}
        >
          {colour.value === "transparent" ? (
            <CircleSlash className="h-6 w-6 stroke-muted-foreground" />
          ) : (
            <Circle className="h-6 w-6 fill-current stroke-current" />
          )}
        </button>
      ))}
    </div>
  )
}
