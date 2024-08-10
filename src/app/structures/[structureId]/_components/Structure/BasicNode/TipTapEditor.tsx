import Document from "@tiptap/extension-document"
import UnderlineExtension from "@tiptap/extension-underline"
// import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Toggle } from "~/components/ui/toggle"

interface Props {
  editable: boolean
  info: string
  onInfoUpdate: (content: string) => void
}

export default function TipTapEditor({ editable, info, onInfoUpdate }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      UnderlineExtension,
      StarterKit.configure({
        document: false,
      }),
    ],
    editable,
    injectCSS: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl my-4 focus:outline-none grow min-h-0",
      },
    },
    content: info,
    onUpdate: ({ editor }) => onInfoUpdate(editor.getHTML()),
  })

  return (
    <div className="relative flex max-h-96 flex-col">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="overflow-auto" />
    </div>
  )
}

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <Undo className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <Redo className="h-3 w-3" />
          </Button>
        </div>
        <div className="h-5 w-[1px] shrink-0 bg-muted-foreground/50" />
        <div className="flex gap-1">
          <Toggle
            size="sm"
            variant="outline"
            disabled={
              !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
            }
            pressed={editor.isActive("heading", { level: 2 })}
            className="text-xs"
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            Title
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            disabled={
              !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
            }
            pressed={editor.isActive("heading", { level: 3 })}
            className="text-xs"
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            Heading
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            disabled={
              !editor.can().chain().focus().toggleHeading({ level: 4 }).run()
            }
            pressed={editor.isActive("heading", { level: 4 })}
            className="text-xs"
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
          >
            Subheading
          </Toggle>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <Toggle
            size="sm"
            variant="outline"
            pressed={editor.isActive("bold")}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            pressed={editor.isActive("italic")}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-3 w-3" />
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
          >
            <Underline className="h-3 w-3" />
          </Toggle>
        </div>
        <div className="h-5 w-[1px] shrink-0 bg-muted-foreground/50" />
        <div className="flex gap-1">
          <Toggle
            size="sm"
            variant="outline"
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            pressed={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            variant="outline"
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            pressed={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>
      </div>
    </div>
  )
}
