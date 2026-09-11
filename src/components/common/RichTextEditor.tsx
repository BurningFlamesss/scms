import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "#/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  testId?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the notice content…",
  minHeight = "min-h-[220px]",
  testId = "rich-text-editor",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return <div className={cn("rounded-lg border border-hairline bg-surface-1", minHeight)} />;
  }

  const actions = [
    { icon: Bold, label: "Bold", run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { icon: Italic, label: "Italic", run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    {
      icon: UnderlineIcon,
      label: "Underline",
      run: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: List,
      label: "Bullet list",
      run: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      run: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote",
      run: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      icon: Link2,
      label: "Link",
      run: () => {
        const href = window.prompt("Link URL", editor.getAttributes("link").href ?? "https://");
        if (href === null) return;
        if (!href) {
          editor.chain().focus().unsetLink().run();
          return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      },
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="tiptap-shell overflow-hidden rounded-lg border border-hairline bg-surface-1" data-testid={testId}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-hairline bg-surface-2 px-1.5 py-1.5">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            aria-label={action.label}
            data-testid={`${testId}-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={action.run}
            className={cn(
              "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
              action.active && "bg-primary/12 text-primary",
            )}
          >
            <action.icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <EditorContent editor={editor} className={cn("prose-editor px-4 py-3", minHeight)} />
    </div>
  );
}
