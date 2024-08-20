import { TabsContent } from "../../../../../../../../../components/ui/tabs"

export default function NodeFilesTabPage() {
  return (
    <TabsContent
      value="files"
      className="data-state-[active]:grow flex min-h-0 flex-col"
    >
      {/* <Files
              files={activeNode.data.files}
              editable={editable}
              onFilesChange={(files) => {
                if (editable && reactFlowInstance && currentUserCanEdit)
                  onNodeDataChange?.(activeNode.id, {
                    files,
                  })
              }}
              onFileDelete={onFileDelete}
            /> */}
    </TabsContent>
  )
}
