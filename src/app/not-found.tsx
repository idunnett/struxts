import ErrorDisplay from "../components/ErrorDisplay"

export default function NotFound() {
  return <ErrorDisplay message="Not Found" statusCode={404} />
}
