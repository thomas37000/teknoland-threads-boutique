import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link2, Quote, Type, Highlighter } from "lucide-react";
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

  const savedRange = useRef<Range | null>(null);
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel && !ref.current?.contains(sel.anchorNode)) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const tools = [
    { icon: Bold, label: "Gras", run: () => exec("bold") },
    { icon: Italic, label: "Italique", run: () => exec("italic") },
    { icon: Underline, label: "Souligné", run: () => exec("underline") },
    { icon: Heading2, label: "Titre", run: () => exec("formatBlock", "<h2>") },
    { icon: Heading3, label: "Sous-titre", run: () => exec("formatBlock", "<h3>") },
    { icon: List, label: "Liste", run: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Liste numérotée", run: () => exec("insertOrderedList") },
    { icon: Quote, label: "Citation", run: () => exec("formatBlock", "<blockquote>") },
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
        <select
          title="Taille du texte"
          className="h-8 rounded-md border border-input bg-background px-1 text-sm"
          defaultValue=""
          onChange={(e) => { if (e.target.value) exec("fontSize", e.target.value); e.target.value = ""; }}
        >
          <option value="" disabled>Taille</option>
          <option value="1">Très petit</option>
          <option value="2">Petit</option>
          <option value="3">Normal</option>
          <option value="4">Moyen</option>
          <option value="5">Grand</option>
          <option value="6">Très grand</option>
          <option value="7">Énorme</option>
        </select>
        <label title="Couleur du texte" className="flex h-8 items-center gap-1 rounded-md px-1 text-xs hover:bg-accent cursor-pointer">
          <Type className="h-4 w-4" />
          <input type="color" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" defaultValue="#000000"
            onChange={(e) => exec("foreColor", e.target.value)} />
        </label>
        <label title="Couleur de surlignage" className="flex h-8 items-center gap-1 rounded-md px-1 text-xs hover:bg-accent cursor-pointer">
          <Highlighter className="h-4 w-4" />
          <input type="color" className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" defaultValue="#ffff00"
            onChange={(e) => exec("hiliteColor", e.target.value)} />
        </label>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="prose prose-sm dark:prose-invert max-w-none p-3 focus:outline-none"
        style={{ minHeight }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={saveSelection}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />
    </div>
  );
};

export default RichTextEditor;
