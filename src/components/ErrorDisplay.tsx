import Link from "next/link"
import { buttonVariants } from "./ui/button"

interface Props {
  statusCode: number
  message: string
}

export default function ErrorDisplay({ statusCode, message }: Props) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">{statusCode}</h2>
        <p className="text-lg">{message}</p>
      </div>
      <Link
        href="/structures"
        className={buttonVariants({
          variant: "secondary",
        })}
      >
        Return to dashboard
      </Link>
    </div>
  )
}
