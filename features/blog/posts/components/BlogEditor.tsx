"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link2,
  Undo2,
  Redo2,
} from "lucide-react";
import type { TipTapDoc } from "@/features/blog/posts/types";
import { EMPTY_DOC } from "@/features/blog/posts/types";

type BlogEditorProps = {
  value: TipTapDoc;
  onChange: (doc: TipTapDoc) => void;
  labels: {
    bold: string;
    italic: string;
    h2: string;
    h3: string;
    bulletList: string;
    orderedList: string;
    code: string;
    link: string;
    linkUrl: string;
    undo: string;
    redo: string;
  };
};

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--nht-text-secondary)] transition-colors ${
        active
          ? "border-[var(--nht-border-hover)] bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]"
          : "border-transparent hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function BlogEditor({ value, onChange, labels }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[var(--nht-accent-warm)] underline" },
      }),
    ],
    content: value?.type === "doc" ? value : EMPTY_DOC,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[220px] px-4 py-3 text-sm leading-relaxed text-white outline-none focus:outline-none [&_a]:text-[var(--nht-accent-warm)]",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON() as TipTapDoc);
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[280px] rounded-[var(--nht-radius-xl)] border border-white/10 bg-white/[0.02]" />
    );
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(labels.linkUrl, previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="overflow-hidden rounded-[var(--nht-radius-xl)] border border-white/10 bg-white/[0.02]">
      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] px-2 py-2">
        <ToolbarButton
          label={labels.bold}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.italic}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.h2}
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.h3}
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.bulletList}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.orderedList}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.code}
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.link}
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.undo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={labels.redo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
