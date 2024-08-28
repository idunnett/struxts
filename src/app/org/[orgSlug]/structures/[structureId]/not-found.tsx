import ErrorDisplay from "~/components/ErrorDisplay"

export default function StructureNotFound() {
  return <ErrorDisplay statusCode={404} message="Structure Not Found" />
}
