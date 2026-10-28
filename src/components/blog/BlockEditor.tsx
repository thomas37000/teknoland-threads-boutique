import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Heading, Image as ImageIcon, Video, Quote, Columns2, MousePointerClick, Type, MoveVertical, Trash2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Block, BlockType, defaultBlock, newId } from "@/lib/blog";
import RichTextEditor from "./RichTextEditor";
import { RenderBlock } from "./BlockRenderer";
import StorageImagePicker from "@/components/admin/product/StorageImagePicker";

const PALETTE: { type: BlockType; label: string; icon: any }[] = [
  { type: "heading", label: "Titre", icon: Heading },
  { type: "text", label: "Texte", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Vidéo", icon: Video },
  { type: "quote", label: "Citation", icon: Quote },
  { type: "columns", label: "2 colonnes", icon: Columns2 },
  { type: "button", label: "Bouton", icon: MousePointerClick },
  { type: "spacer", label: "Espace", icon: MoveVertical },
];

interface Props {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const BlockFields = ({ block, update }: { block: Block; update: (data: Record<string, any>) => void }) => {
  const d = block.data;
  const [picker, setPicker] = useState(false);
  switch (block.type) {
    case "heading":
      return (
        <div className="flex gap-2">
          <Input value={d.text} onChange={(e) => update({ text: e.target.value })} />
          <select className="rounded-md border border-input bg-background px-2 text-sm" value={d.level} onChange={(e) => update({ level: Number(e.target.value) })}>
            <option value={2}>Grand</option>
            <option value={3}>Moyen</option>
          </select>
        </div>
      );
    case "text":
      return <RichTextEditor value={d.html} onChange={(html) => update({ html })} />;
    case "image":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input placeholder="Adresse de l'image" value={d.url} onChange={(e) => update({ url: e.target.value })} />
            <Button type="button" variant="outline" onClick={() => setPicker(true)}>Choisir</Button>
          </div>
          <Input placeholder="Description (alt)" value={d.alt} onChange={(e) => update({ alt: e.target.value })} />
          <Input placeholder="Légende" value={d.caption} onChange={(e) => update({ caption: e.target.value })} />
          {d.url && <img src={d.url} alt="" className="max-h-40 rounded" />}
          <StorageImagePicker preferredBucket="blog" open={picker} onClose={() => setPicker(false)} onSelect={(url) => { update({ url }); setPicker(false); }} />
        </div>
      );
    case "video":
      return <Input placeholder="Lien YouTube, Vimeo ou SoundCloud" value={d.url} onChange={(e) => update({ url: e.target.value })} />;
    case "quote":
      return (
        <div className="space-y-2">
          <Input value={d.text} onChange={(e) => update({ text: e.target.value })} />
          <Input placeholder="Auteur" value={d.author} onChange={(e) => update({ author: e.target.value })} />
        </div>
      );
    case "columns":
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <RichTextEditor value={d.left} onChange={(left) => update({ left })} minHeight={80} />
          <RichTextEditor value={d.right} onChange={(right) => update({ right })} minHeight={80} />
        </div>
      );
    case "button":
      return (
        <div className="flex gap-2">
          <Input value={d.label} onChange={(e) => update({ label: e.target.value })} />
          <Input placeholder="/shop ou https://…" value={d.href} onChange={(e) => update({ href: e.target.value })} />
        </div>
      );
    case "spacer":
      return <Input type="number" min={8} max={200} value={d.size} onChange={(e) => update({ size: Number(e.target.value) })} />;
  }
  return null;
};

const BlockEditor = ({ blocks, onChange }: Props) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const add = (type: BlockType) => {
    const b = defaultBlock(type);
    onChange([...blocks, b]);
    setEditing(b.id);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [b] = next.splice(from, 1);
    next.splice(to, 0, b);
    onChange(next);
  };
  const update = (id: string, data: Record<string, any>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...data } } : b)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border border-dashed border-border p-3">
        <span className="w-full text-xs text-muted-foreground">Ajouter un bloc :</span>
        {PALETTE.map(({ type, label, icon: Icon }) => (
          <Button key={type} type="button" variant="secondary" size="sm" onClick={() => add(type)}>
            <Icon className="mr-1 h-4 w-4" /> {label}
          </Button>
        ))}
      </div>

      {blocks.length === 0 && <p className="text-center text-sm text-muted-foreground">Aucun bloc pour l'instant.</p>}

      {blocks.map((block, i) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (dragIndex !== null) move(dragIndex, i); setDragIndex(null); }}
          className={`group rounded-lg border bg-card p-3 ${editing === block.id ? "border-primary" : "border-border"}`}
        >
          <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
            <GripVertical className="h-4 w-4 cursor-grab" />
            <span className="flex-1 uppercase tracking-wide">{PALETTE.find((p) => p.type === block.type)?.label}</span>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title={editing === block.id ? "Aperçu" : "Modifier"} onClick={() => setEditing(editing === block.id ? null : block.id)}>
              {editing === block.id ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Monter" onClick={() => move(i, i - 1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Descendre" onClick={() => move(i, i + 1)}><ArrowDown className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Dupliquer" onClick={() => { const next = [...blocks]; next.splice(i + 1, 0, { ...block, id: newId(), data: { ...block.data } }); onChange(next); }}><Copy className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Supprimer" onClick={() => onChange(blocks.filter((b) => b.id !== block.id))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          {editing === block.id ? (
            <BlockFields block={block} update={(data) => update(block.id, data)} />
          ) : (
            <div className="cursor-pointer" onClick={() => setEditing(block.id)}><RenderBlock block={block} /></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlockEditor;
