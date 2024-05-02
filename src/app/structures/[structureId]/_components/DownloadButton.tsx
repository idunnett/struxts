import React from "react"
import {
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow"
import { toJpeg } from "html-to-image"
import { Button } from "~/components/ui/button"
import { Download } from "lucide-react"

interface Props {
  structureName: string
}

function downloadImage(dataUrl: string, structureName: string) {
  const a = document.createElement("a")

  a.setAttribute("download", `${structureName}.jpeg`)
  a.setAttribute("href", dataUrl)
  a.click()
}

const imageWidth = 1024
const imageHeight = 768

function DownloadButton({ structureName }: Props) {
  const { getNodes } = useReactFlow()
  async function onClick() {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes())
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    )

    const reactFlowViewport: HTMLElement = document.querySelector(
      ".react-flow__viewport",
    )!

    const dataUrl = await toJpeg(reactFlowViewport, {
      backgroundColor: "#fff",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth.toString(),
        height: imageHeight.toString(),
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
      type: "image/jpeg",
      quality: 1,
    })

    downloadImage(dataUrl, structureName)
  }

  return (
    <Panel position="top-right">
      <Button
        size="sm"
        variant="secondary"
        className="download-btn gap-2 text-xs"
        onClick={onClick}
      >
        <Download className="h-3 w-3" />
        Download Image
      </Button>
    </Panel>
  )
}

export default DownloadButton
