"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { api } from "~/trpc/react"
import { Button } from "../../../../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card"
import { Input } from "../../../../../../components/ui/input"
import { Label } from "../../../../../../components/ui/label"

export function CreateStructure() {
  const router = useRouter()
  const [name, setName] = useState("")

  const createStructure = api.structure.create.useMutation({
    onSuccess: (newId: number) => {
      router.replace(`/structures/${newId}`)
      router.refresh()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        createStructure.mutate({ name })
      }}
    >
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create Structure</CardTitle>
          <CardDescription>
            Create a new structure to organize your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name of your structure"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button disabled={createStructure.isPending}>
            {createStructure.isPending ? "Creating..." : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
