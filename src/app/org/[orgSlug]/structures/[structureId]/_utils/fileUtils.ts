import { type FileState } from "../../../../../../types"

export function sortFiles(files: FileState[]): FileState[] {
  return files.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.name.localeCompare(b.name)
  })
}

export function getAllFileDescendantsIds(files: FileState[], fileId: string) {
  const children = files.filter(
    (file) => file.parentId === fileId && file.id !== fileId,
  )

  let allDescendantsIds: string[] = []

  for (const child of children) {
    allDescendantsIds.push(child.id)
    const descendantsOfChild = getAllFileDescendantsIds(files, child.id)
    allDescendantsIds = allDescendantsIds.concat(descendantsOfChild)
  }

  return allDescendantsIds
}
