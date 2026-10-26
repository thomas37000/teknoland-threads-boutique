import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogComment, BlogPost, blogDb } from "@/lib/blog";
import PostEditor from "@/components/blog/PostEditor";

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<(BlogComment & { blog_posts?: { title: string } })[]>([]);
  const [editing, setEditing] = useState<BlogPost | null | "new">(null);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      blogDb.from("blog_posts").select("*").order("created_at", { ascending: false }),
      blogDb.from("blog_comments").select("*, blog_posts(title)").order("created_at", { ascending: false }),
    ]);
    setPosts(p || []);
    setComments(c || []);
  };
  useEffect(() => { load(); }, []);

  const removePost = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await blogDb.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Article supprimé");
    load();
  };
  const approve = async (id: string) => { await blogDb.from("blog_comments").update({ approved: true }).eq("id", id); load(); };
  const removeComment = async (id: string) => { await blogDb.from("blog_comments").delete().eq("id", id); load(); };

  const pending = comments.filter((c) => !c.approved).length;

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">{editing === "new" ? "Nouvel article" : "Modifier l'article"}</h2>
        <PostEditor post={editing === "new" ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="posts">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="posts">Articles ({posts.length})</TabsTrigger>
          <TabsTrigger value="comments">Commentaires {pending > 0 && <Badge variant="destructive" className="ml-2">{pending}</Badge>}</TabsTrigger>
        </TabsList>
        <Button onClick={() => setEditing("new")}><Plus className="mr-1 h-4 w-4" /> Nouvel article</Button>
      </div>

      <TabsContent value="posts" className="space-y-2">
        {posts.length === 0 && <p className="text-muted-foreground">Aucun article.</p>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            {p.cover_image ? <img src={p.cover_image} alt="" className="h-12 w-20 rounded object-cover" /> : <div className="h-12 w-20 rounded bg-muted" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.category || "Sans catégorie"} · {p.editor_mode === "blocks" ? "Blocs" : "Texte enrichi"}</p>
            </div>
            <Badge variant={p.status === "published" ? "default" : "outline"}>{p.status === "published" ? "Publié" : "Brouillon"}</Badge>
            <Button variant="ghost" size="icon" asChild title="Voir"><Link to={`/blog/${p.slug}`}><ExternalLink className="h-4 w-4" /></Link></Button>
            <Button variant="ghost" size="icon" title="Modifier" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" title="Supprimer" className="text-destructive" onClick={() => removePost(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="comments" className="space-y-2">
        {comments.length === 0 && <p className="text-muted-foreground">Aucun commentaire.</p>}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm"><span className="font-semibold">{c.author_name}</span> sur « {c.blog_posts?.title} »</p>
              <p className="mt-1 whitespace-pre-line text-sm">{c.content}</p>
            </div>
            {!c.approved && <Button size="sm" onClick={() => approve(c.id)}><Check className="mr-1 h-4 w-4" /> Valider</Button>}
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeComment(c.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default BlogManagement;
