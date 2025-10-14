import { useAuthToken } from "@convex-dev/auth/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import Spinner from "~/components/Spinner"
import { downloadFile } from "~/lib/utils"

export default function StorageImage({ storageId }: { storageId: string }) {
  const [image, setImage] = useState<{
    src: string
    width: number
    height: number
  } | null>(null)

  const token = useAuthToken()
  useEffect(() => {
    async function fetchImage() {
      const image = await downloadFile(storageId, { token })
      setImage(image)
    }
    fetchImage()
  }, [storageId])

  if (!image) return <Spinner />

  return (
    <Image
      src={image.src}
      alt={storageId}
      height={image.height}
      width={image.width}
    />
  )
}
