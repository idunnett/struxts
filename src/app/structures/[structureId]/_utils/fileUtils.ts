import { type FileState } from "../../../../types"

export function sortFiles(files: FileState[]): FileState[] {
  return files.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1
    if (!a.isFolder && b.isFolder) return 1
    return a.name.localeCompare(b.name)
  })
}
