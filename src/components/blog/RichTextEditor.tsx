import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sanitize } from "@/lib/blog";

interface Props {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}

const RichTextEditor = ({ value, onChange, minHeight = 120 }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = sanitize(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const tools = [
    { icon: Bold, label: "Gras", run: () => exec("bold") },
    { icon: Italic, label: "Italique", run: () => exec("italic") },
    { icon: Underline, label: "Souligné", run: () => exec("underline") },
    { icon: Heading2, label: "Titre", run: () => exec("formatBlock", "h2") },
    { icon: Heading3, label: "Sous-titre", run: () => exec("formatBlock", "h3") },
    { icon: List, label: "Liste", run: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Liste numérotée", run: () => exec("insertOrderedList") },
    { icon: Quote, label: "Citation", run: () => exec("formatBlock", "blockquote") },
    {
      icon: Link2,
      label: "Lien",
      run: () => {
        const url = window.prompt("Adresse du lien (https://…)");
        if (url) exec("createLink", url);
      },
    },
  ];

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap gap-1 border-b border-input p-1">
        {tools.map(({ icon: Icon, label, run }) => (
          <Button key={label} type="button" variant="ghost" size="icon" className="h-8 w-8" title={label} onMouseDown={(e) => { e.preventDefault(); run(); }}>
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="prose prose-sm dark:prose-invert max-w-none p-3 focus:outline-none"
        style={{ minHeight }}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />
    </div>
  );
};

export default RichTextEditor;
