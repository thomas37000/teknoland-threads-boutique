import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Block, BlogPost, EditorMode, blogDb, slugify } from "@/lib/blog";
import BlockEditor from "./BlockEditor";
import RichTextEditor from "./RichTextEditor";
import StorageImagePicker from "@/components/admin/product/StorageImagePicker";

interface Props {
  post?: BlogPost | null;
  onSaved: (post: BlogPost) => void;
  onCancel?: () => void;
}

const PostEditor = ({ post, onSaved, onCancel }: Props) => {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [cover, setCover] = useState(post?.cover_image || "");
  const [category, setCategory] = useState(post?.category || "");
  const [tags, setTags] = useState((post?.tags || []).join(", "));
  const [published, setPublished] = useState(post?.status === "published");
  const [mode, setMode] = useState<EditorMode>(post?.editor_mode || "blocks");
  const [blocks, setBlocks] = useState<Block[]>(post?.editor_mode === "blocks" && Array.isArray(post.content) ? post.content : []);
  const [html, setHtml] = useState<string>(post?.editor_mode === "rich" ? post?.content?.html || "" : "");
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return toast.error("Le titre est obligatoire");
    const normalizedSlug = slugify(slug.trim() || title);
    if (!normalizedSlug) return toast.error("Renseignez une adresse contenant des lettres ou des chiffres");
    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: normalizedSlug,
      excerpt: excerpt || null,
      cover_image: cover || null,
      category: category.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: published ? "published" : "draft",
      published_at: published ? post?.published_at || new Date().toISOString() : null,
      editor_mode: mode,
      content: mode === "blocks" ? blocks : { html },
    };
    const q = post?.id
      ? blogDb.from("blog_posts").update(payload).eq("id", post.id).select().single()
      : blogDb.from("blog_posts").insert(payload).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) return toast.error(error.code === "23505" ? "Cette adresse (slug) existe déjà" : error.message);
    toast.success(published ? "Article publié" : "Brouillon enregistré");
    onSaved(data);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="post-title">Titre</Label>
          <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-slug">Adresse (slug)</Label>
          <Input id="post-slug" value={slug} placeholder={slugify(title)} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-category">Catégorie</Label>
          <Input id="post-category" value={category} placeholder="Actu, Sorties, Interviews…" onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-tags">Tags (séparés par des virgules)</Label>
          <Input id="post-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-excerpt">Extrait</Label>
        <Textarea id="post-excerpt" value={excerpt} rows={2} onChange={(e) => setExcerpt(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Image de couverture</Label>
        <p className="text-xs text-muted-foreground">Taille conseillée : 1600 × 900 px</p>
        <div className="flex gap-2">
          <Input value={cover} placeholder="Adresse de l'image" onChange={(e) => setCover(e.target.value)} />
          <Button type="button" variant="outline" onClick={() => setPicker(true)}>Choisir</Button>
        </div>
        {cover && <img src={cover} alt="" className="max-h-48 rounded-lg" />}
        <StorageImagePicker open={picker} onClose={() => setPicker(false)} onSelect={(url) => { setCover(url); setPicker(false); }} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Éditeur :</Label>
          <Button type="button" size="sm" variant={mode === "blocks" ? "default" : "outline"} onClick={() => setMode("blocks")}>Blocs</Button>
          <Button type="button" size="sm" variant={mode === "rich" ? "default" : "outline"} onClick={() => setMode("rich")}>Texte enrichi</Button>
        </div>
        {mode === "blocks" ? (
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        ) : (
          <RichTextEditor value={html} onChange={setHtml} minHeight={320} />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch aria-label="Publier l'article" checked={published} onCheckedChange={setPublished} />
          {published ? "Publié" : "Brouillon"}
        </label>
        <div className="flex gap-2">
          {onCancel && <Button variant="outline" onClick={onCancel}>Annuler</Button>}
          <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
