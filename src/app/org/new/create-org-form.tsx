"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { createOrg } from "./actions"

export default function CreateOrgForm() {
  const [error, formAction, pending] = useActionState(createOrg, null)

  useEffect(() => {
    if (error) toast(error)
  }, [error])
  return (
    <form action={formAction}>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>New Organization</CardTitle>
          <CardDescription>
            Create a new organization for your structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Name of your organization"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button disabled={pending}>
            {pending ? "Creating..." : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
