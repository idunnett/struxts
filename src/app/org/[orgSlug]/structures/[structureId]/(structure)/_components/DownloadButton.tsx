import {
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react"
import { toJpeg } from "html-to-image"
import { Download } from "lucide-react"
import { Button } from "~/components/ui/button"

interface Props {
  structureName: string
}

function downloadImage(dataUrl: string, structureName: string) {
  const a = document.createElement("a")

  a.setAttribute("download", `${structureName}.jpeg`)
  a.setAttribute("href", dataUrl)
  a.click()
}

const imageWidth = 4200
const imageHeight = 2550

function DownloadButton({ structureName }: Props) {
  const { getNodes } = useReactFlow()
  async function onClick() {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getNodesBounds(getNodes())
    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0,
      2,
      0.1,
    )

    const reactFlowViewport: HTMLElement = document.querySelector(
      ".react-flow__viewport",
    )!

    const dataUrl = await toJpeg(reactFlowViewport, {
      backgroundColor: "#EEF0F2",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
      type: "image/jpeg",
      quality: 1,
    })

    downloadImage(dataUrl, structureName)
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      className="download-btn gap-2 text-xs"
      onClick={onClick}
    >
      <Download className="h-3 w-3" />
      {/* Download Image */}
    </Button>
  )
}

export default DownloadButton
