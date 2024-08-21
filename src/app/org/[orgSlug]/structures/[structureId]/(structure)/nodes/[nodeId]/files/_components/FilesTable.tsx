import { useAuth } from "@clerk/nextjs"
import { ColumnDef } from "@tanstack/react-table"
import axios from "axios"
import { useQuery } from "convex/react"
import { formatDate } from "date-fns"
import {
  FaFile,
  FaFileCsv,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
} from "react-icons/fa6"
import { api } from "../../../../../../../../../../../convex/_generated/api"
import { Doc } from "../../../../../../../../../../../convex/_generated/dataModel"
import { DataTable } from "../../../../../../../../../../components/DataTable"
import { env } from "../../../../../../../../../../env"

interface Props {
  nodeId: string
  structureId: string
}

export default function FilesTable({ nodeId, structureId }: Props) {
  const session = useAuth()
  const files = useQuery(api.files.getNodeFiles, {
    nodeId,
    structureId,
    orgId: session.orgId ?? null,
  })
  function humanFileSize(size: number) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
    return (
      +(size / Math.pow(1024, i)).toFixed(2) * 1 +
      " " +
      ["B", "KB", "MB", "GB", "TB"][i]
    )
  }

  function getFileIcon(type: string) {
    if (type === "application/pdf") {
      return <FaFilePdf className="h-4 w-4 text-red-500" />
    }
    if (type.startsWith("image/")) {
      return <FaFileImage className="h-4 w-4 text-blue-500" />
    }
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FaFileWord className="h-4 w-4 text-[#175ABC]" />
    }
    if (
      type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return <FaFileExcel className="h-4 w-4 text-green-500" />
    }
    if (type === "text/csv") {
      return <FaFileCsv className="h-4 w-4 text-yellow-500" />
    }
    return <FaFile className="h-4 w-4 text-gray-500" />
  }
  async function downloadFile(storageId: string) {
    const getFileUrl = new URL(`${env.NEXT_PUBLIC_CONVEX_SITE_URL}/getFile`)
    getFileUrl.searchParams.set("storageId", storageId)
    const res = await axios.get(getFileUrl.toString(), {
      headers: {
        Authorization: `Bearer ${await session.getToken()}`,
      },
    })
    console.log(res)
  }

  const columns: ColumnDef<Doc<"files">>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const type = row.original.type
        const storageId = row.original.storageId

        return (
          <div className="flex max-w-96 items-center gap-2">
            {getFileIcon(type)}
            <button
              type="button"
              className="truncate text-primary"
              onClick={() => downloadFile(storageId)}
            >
              {row.getValue("name")}
            </button>
          </div>
        )
      },
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {humanFileSize(row.getValue("size"))}
        </span>
      ),
    },
    {
      accessorKey: "_creationTime",
      header: "Created",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(new Date(row.getValue("_creationTime")), "MMM dd, yyyy")}
        </span>
      ),
    },
  ]
  return (
    files && (
      <DataTable
        key={"files-table-" + files.map((file) => file._id).join("-")}
        columns={columns}
        data={files}
      />
    )
  )
}
