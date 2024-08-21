"use client"

import { useAuth } from "@clerk/nextjs"
import { LucideTriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { isCustomConvexError } from "../lib/utils"
import { buttonVariants } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

interface Props {
  statusCode?: number
  message?: string
  error?: unknown
  type?: "page" | "component" | "icon"
}

export default function ErrorDisplay({
  statusCode,
  message,
  error,
  type = "page",
}: Props) {
  const session = useAuth()
  const errorDetails = useMemo(() => {
    let errorDetails = { statusCode: 500, message: "An error occurred" }
    if (error && isCustomConvexError(error))
      errorDetails = {
        statusCode: error.data.statusCode,
        message: error.data.message,
      }
    if (statusCode) errorDetails.statusCode = statusCode
    if (message) errorDetails.message = message

    return errorDetails
  }, [error])

  if (type === "icon")
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <LucideTriangleAlert className="h-5 w-5 text-primary" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="relative flex items-center gap-2">
              <span className="font-bold">{errorDetails.statusCode}</span>
              <div className="h-4 w-px bg-background" />
              <p>{errorDetails.message}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

  if (type === "component")
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 py-4">
        <LucideTriangleAlert className="h-5 w-5 text-primary" />
        <div className="relative flex items-center gap-2">
          <span className="font-bold">{errorDetails.statusCode}</span>
          <div className="h-4 w-px bg-background" />
          <p>{errorDetails.message}</p>
        </div>
      </div>
    )

  const hasActiveOrg = !!(session.orgSlug ?? session.userId)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">{errorDetails.statusCode}</h2>
        <p className="text-lg">{errorDetails.message}</p>
      </div>
      <Link
        href={hasActiveOrg ? `/orgs/${session.orgSlug ?? session.userId}` : "/"}
        className={buttonVariants({
          variant: "secondary",
        })}
      >
        Return to {hasActiveOrg ? "dashboard" : "home page"}
      </Link>
    </div>
  )
}
