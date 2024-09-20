import { useEffect, useState } from "react"

// A simple React hook that grabs a URL query parameter and erases
// it from the URL.
export function useConsumeQueryParam(name: string) {
  const [value] = useState(
    // get the param value
    new URLSearchParams(window.location.search).get(name),
  )

  useEffect(() => {
    const currentUrl = new URL(window.location.href)
    const searchParams = currentUrl.searchParams
    searchParams.delete(name)
    const consumedUrl =
      currentUrl.origin + currentUrl.pathname + searchParams.toString()
    // reset the URL
    window.history.replaceState(null, "", consumedUrl)
  }, [])
  return value
}
