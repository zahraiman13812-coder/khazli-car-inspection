"use client";

import LinkExtension from "@tiptap/extension-link";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type ArticleRichEditorProps = {
  initialContent: string;
  onChange: (html: string) => void;
  disabled?: boolean;
};

export default function ArticleRichEditor({
  initialContent,
  onChange,
  disabled = false,
}: ArticleRichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    editable: !disabled,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),

      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,

        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],

    content: initialContent,

    editorProps: {
      attributes: {
        class: [
          "min-h-[420px]",
          "w-full",
          "outline-none",
          "px-5",
          "py-5",
          "text-sm",
          "leading-9",
          "text-ink",
        ].join(" "),
      },
    },

    onUpdate: ({ editor: updatedEditor }) => {
      onChange(
        updatedEditor.getHTML(),
      );
    },
  });

  /*
   * useEditor can return null during the first render.
   */
  if (!editor) {
    return (
      <div className="min-h-[480px] animate-pulse rounded-[1.5rem] border border-line bg-surface-muted" />
    );
  }

  /*
   * From this point on we use a non-null reference.
   * This avoids TypeScript null errors inside callbacks.
   */
  const currentEditor = editor;

  function handleSetLink() {
    const attributes =
      currentEditor.getAttributes(
        "link",
      );

    const previousUrl =
      typeof attributes.href ===
      "string"
        ? attributes.href
        : "";

    const url =
      window.prompt(
        "آدرس لینک را وارد کنید:",
        previousUrl ||
          "https://",
      );

    if (url === null) {
      return;
    }

    const trimmedUrl =
      url.trim();

    /*
     * Empty input removes the link.
     */
    if (!trimmedUrl) {
      currentEditor
        .chain()
        .focus()
        .unsetLink()
        .run();

      return;
    }

    currentEditor
      .chain()
      .focus()
      .setLink({
        href: trimmedUrl,
      })
      .run();
  }

  function handleRemoveLink() {
    currentEditor
      .chain()
      .focus()
      .unsetLink()
      .run();
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-line bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-muted p-3">
        <ToolbarButton
          label="متن"
          active={currentEditor.isActive(
            "paragraph",
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .setParagraph()
              .run();
          }}
        />

        <ToolbarButton
          label="H2"
          active={currentEditor.isActive(
            "heading",
            {
              level: 2,
            },
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run();
          }}
        />

        <ToolbarButton
          label="H3"
          active={currentEditor.isActive(
            "heading",
            {
              level: 3,
            },
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run();
          }}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="B"
          title="بولد"
          active={currentEditor.isActive(
            "bold",
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleBold()
              .run();
          }}
        />

        <ToolbarButton
          label="I"
          title="ایتالیک"
          active={currentEditor.isActive(
            "italic",
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleItalic()
              .run();
          }}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="• لیست"
          title="لیست نقطه‌ای"
          active={currentEditor.isActive(
            "bulletList",
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleBulletList()
              .run();
          }}
        />

        <ToolbarButton
          label="۱. لیست"
          title="لیست شماره‌دار"
          active={currentEditor.isActive(
            "orderedList",
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleOrderedList()
              .run();
          }}
        />

        <ToolbarButton
          label="نقل‌قول"
          active={currentEditor.isActive(
            "blockquote",
          )}
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .toggleBlockquote()
              .run();
          }}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="لینک"
          active={currentEditor.isActive(
            "link",
          )}
          disabled={disabled}
          onClick={
            handleSetLink
          }
        />

        {currentEditor.isActive(
          "link",
        ) && (
          <ToolbarButton
            label="حذف لینک"
            danger
            disabled={disabled}
            onClick={
              handleRemoveLink
            }
          />
        )}

        <ToolbarDivider />

        <ToolbarButton
          label="—"
          title="خط جداکننده"
          disabled={disabled}
          onClick={() => {
            currentEditor
              .chain()
              .focus()
              .setHorizontalRule()
              .run();
          }}
        />

        <div className="mr-auto flex gap-2">
          <ToolbarButton
            label="↶"
            title="برگشت"
            disabled={
              disabled ||
              !currentEditor
                .can()
                .chain()
                .focus()
                .undo()
                .run()
            }
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .undo()
                .run();
            }}
          />

          <ToolbarButton
            label="↷"
            title="جلو"
            disabled={
              disabled ||
              !currentEditor
                .can()
                .chain()
                .focus()
                .redo()
                .run()
            }
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .redo()
                .run();
            }}
          />
        </div>
      </div>

      {/* Editor area */}
      <div className="article-editor">
        <EditorContent
          editor={
            currentEditor
          }
        />
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-muted px-4 py-3">
        <p className="text-[11px] leading-6 text-ink-muted">
          برای ساختار صحیح مقاله از H2 و
          H3 استفاده کنید. عنوان اصلی
          مقاله به‌صورت H1 توسط سایت ساخته
          می‌شود.
        </p>

        <p className="text-[11px] font-bold text-ink-muted">
          {new Intl.NumberFormat(
            "fa-IR",
          ).format(
            currentEditor.getText()
              .length,
          )}{" "}
          کاراکتر
        </p>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active = false,
  disabled = false,
  danger = false,
  title,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  let classes =
    "border-line bg-surface text-ink hover:bg-surface-hover";

  if (active) {
    classes =
      "border-brand-border bg-brand-soft text-brand-active";
  }

  if (danger) {
    classes =
      "border-danger bg-danger-soft text-danger";
  }

  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={
        title ?? label
      }
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${classes}`}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      aria-hidden="true"
      className="hidden h-9 w-px bg-line sm:block"
    />
  );
}