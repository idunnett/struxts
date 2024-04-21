"use client"

import { useEffect, useState } from "react"
import { cn } from "~/lib/utils"

interface Props {
  texts: string[]
  duration?: number
  className?: string
}

export default function RotatingText({
  texts,
  duration = 3000,
  className,
}: Props) {
  const [currentText, setCurrentText] = useState(texts[0] ?? "")

  useEffect(() => {
    const interval = setInterval(rotateText, duration)
    return () => clearInterval(interval)
  })

  function rotateText() {
    const currentIndex = texts.indexOf(currentText)
    let nextText = texts[currentIndex + 1]
    if (!nextText) nextText = texts[0] ?? ""
    setCurrentText(nextText)
  }

  return <span className={cn("", className)}>{currentText}</span>
}
