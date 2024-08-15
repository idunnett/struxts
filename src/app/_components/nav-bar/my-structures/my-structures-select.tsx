"use client"

import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

interface Props {
  myStructures: { id: number; name: string; createdById: string }[]
}

export default function MyStructuresSelect({ myStructures }: Props) {
  const params = useParams()
  const router = useRouter()

  const selectedStructureId = useMemo(() => {
    if (!params.structureId) return undefined
    if (typeof params.structureId !== "string") return undefined
    return params.structureId
  }, [params.structureId])

  function handleStructureChange(value?: string) {
    if (!value) return
    router.push(`/structures/${value}`)
  }

  return (
    <>
      <div className="h-1/2 w-[1px] rotate-12 bg-muted-foreground" />
      <Select
        key={selectedStructureId}
        value={selectedStructureId}
        onValueChange={handleStructureChange}
      >
        <SelectTrigger className="max-w-96 gap-2 border-none font-medium !ring-0">
          <SelectValue placeholder="Select a structure" className="truncate" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>My Structures</SelectLabel>
            {myStructures.map((structure) => (
              <SelectItem key={structure.id} value={structure.id.toString()}>
                {structure.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
