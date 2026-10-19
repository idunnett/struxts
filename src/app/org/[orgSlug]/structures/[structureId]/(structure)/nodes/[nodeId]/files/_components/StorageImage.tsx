import { useQuery } from "convex/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { api } from "../../../../../../../../../../../convex/_generated/api"
import Spinner from "../../../../../../../../../../components/Spinner"
import { loadBlobFromUrl } from "../../../../../../../../../../lib/utils"

export default function StorageImage({ storageId }: { storageId: string }) {
  const download = useQuery(api.files.getDownloadUrl, { storageId })
  const [image, setImage] = useState<{
    src: string
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    if (!download?.url) return
    let cancelled = false
    let objectUrl: string | null = null
    void loadBlobFromUrl(download.url).then((img) => {
      if (cancelled) {
        URL.revokeObjectURL(img.src)
        return
      }
      objectUrl = img.src
      setImage(img)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [download?.url])

  if (!image) return <Spinner />

  return (
    <Image
      src={image.src}
      alt={download?.name ?? "File"}
      height={image.height}
      width={image.width}
    />
  )
}
