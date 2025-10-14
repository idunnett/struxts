"use client"

import { api } from "convex/_generated/api"
import { useMutation } from "convex/react"
import _ from "lodash"
import { LucideCircleCheck, LucideRefreshCcw } from "lucide-react"
import { use, useEffect, useRef, useState } from "react"
import { TabsContent } from "../../../../../../../components/ui/tabs"
import { useDebounce } from "../../../../../../../hooks/useDebounce"
import { StructureContext } from "../../../../_components/StructureProvider"
import CompanyForm from "./_components/CompanyForm"
import TipTapEditor from "./_components/TipTapEditor"

export default function NodeInfoTabPage() {
  const { activeNode, editable } = use(StructureContext)
  const inputRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState(activeNode!.data.info)
  const [company, setCompany] = useState(activeNode!.data.company)
  const debouncedInput = useDebounce(input, 3000)
  const debouncedCompany = useDebounce(company, 3000)

  const updateNode = useMutation(api.nodes.update)
  const updateCompany = useMutation(api.companies.update)

  useEffect(() => {
    if (!activeNode) return
    setInput(activeNode.data.info)
  }, [activeNode?.data.info])

  useEffect(() => {
    if (!activeNode || debouncedInput === activeNode.data.info) return
    updateNode({
      nodeId: activeNode.id,
      data: {
        info: debouncedInput,
      },
    })
  }, [debouncedInput])

  useEffect(() => {
    if (
      !activeNode ||
      !debouncedCompany ||
      !activeNode.data.company ||
      _.isEqual(debouncedCompany, activeNode.data.company)
    )
      return
    updateCompany({
      companyId: activeNode.data.company._id,
      data: {
        name: debouncedCompany.name,
        description: debouncedCompany.description,
        city: debouncedCompany.city,
        stateProvince: debouncedCompany.stateProvince,
        country: debouncedCompany.country,
        employees: debouncedCompany.employees,
        yearFounded: debouncedCompany.yearFounded,
      },
    })
  }, [debouncedCompany])

  const saved =
    input === activeNode?.data.info &&
    _.isEqual(company, activeNode.data.company)

  function handleDestroyed() {
    if (!activeNode || input === debouncedInput) return
    updateNode({
      nodeId: activeNode.id,
      data: {
        info: input,
      },
    })
  }

  if (!activeNode) return null
  return (
    <TabsContent
      value="info"
      className="-mx-4 !mt-0 flex min-h-0 flex-col overflow-auto px-4 data-[state=active]:grow"
    >
      {editable && (
        <div className="flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          {saved ? (
            <>
              <LucideCircleCheck className="h-3 w-3" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <LucideRefreshCcw className="h-3 w-3" />
              <span>Saving...</span>
            </>
          )}
        </div>
      )}
      {company ? (
        <CompanyForm
          editable={editable}
          company={company}
          onCompanyUpdate={(input) => {
            setCompany((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                ...input,
              }
            })
          }}
        />
      ) : (
        <TipTapEditor
          contentRef={inputRef}
          editable={editable}
          info={input}
          onInfoUpdate={setInput}
          onDestroy={handleDestroyed}
        />
      )}
    </TabsContent>
  )
}
