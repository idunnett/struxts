import ErrorDisplay from "../components/ErrorDisplay"

export default function NotFound() {
  return <ErrorDisplay statusCode={404} message="Not Found" />
}
