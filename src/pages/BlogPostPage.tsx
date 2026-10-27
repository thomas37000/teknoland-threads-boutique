import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { BlogComment, BlogPost, blogDb } from "@/lib/blog";
import BlockRenderer from "@/components/blog/BlockRenderer";
import PostEditor from "@/components/blog/PostEditor";

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    blogDb.from("blog_posts").select("*").eq("slug", slug).maybeSingle().then(({ data }: any) => {
      setPost(data);
      setLoading(false);
      if (data) {
        blogDb.from("blog_comments").select("*").eq("post_id", data.id).eq("approved", true).order("created_at").then(({ data: c }: any) => setComments(c || []));
      }
    });
  }, [slug, isAdmin]);

  const sendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !name.trim() || !message.trim()) return;
    setSending(true);
    const { error } = await blogDb.from("blog_comments").insert({ post_id: post.id, author_name: name.trim().slice(0, 80), content: message.trim().slice(0, 2000) });
    setSending(false);
    if (error) return toast.error("Impossible d'envoyer le commentaire");
    toast.success("Merci ! Votre commentaire sera visible après validation.");
    setName("");
    setMessage("");
  };

  if (loading) return <div className="tekno-container py-12 text-muted-foreground">Chargement…</div>;
  if (!post) return <div className="tekno-container py-12">Article introuvable. <Link to="/blog" className="underline">Retour au blog</Link></div>;

  return (
    <div className="tekno-container py-12">
      <Helmet>
        <title>{post.title} | Blog Teknoland</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Blog</Link>
        {isAdmin && !editing && <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-1 h-4 w-4" /> Modifier sur la page</Button>}
      </div>

      {isAdmin && editing ? (
        <div className="border-y border-border py-6">
          <PostEditor
            post={post}
            onCancel={() => setEditing(false)}
            onSaved={(p) => { setPost(p); setEditing(false); if (p.slug !== slug) navigate(`/blog/${p.slug}`, { replace: true }); }}
          />
        </div>
      ) : (
        <article className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {post.status === "draft" && <Badge variant="outline">Brouillon</Badge>}
            {post.category && <span className="font-semibold uppercase">{post.category}</span>}
            {post.published_at && <span>{new Date(post.published_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</span>}
          </div>
          <h1 className="mb-6 break-words text-4xl font-bold md:text-5xl">{post.title}</h1>
          {post.cover_image && <img src={post.cover_image} alt={post.title} className="mb-8 w-full rounded-xl" />}
          <BlockRenderer mode={post.editor_mode} content={post.content} />
          {post.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">{post.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}</div>
          )}

          {post.status === "published" && (
            <section className="mt-12 border-t border-border pt-8">
              <h2 className="mb-4 text-2xl font-bold">Commentaires ({comments.length})</h2>
              <div className="mb-8 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-semibold">{c.author_name} <span className="font-normal text-muted-foreground">· {new Date(c.created_at).toLocaleDateString("fr-FR")}</span></p>
                    <p className="mt-1 whitespace-pre-line">{c.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={sendComment} className="space-y-3">
                <Input aria-label="Votre nom" placeholder="Votre nom" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} required />
                <Textarea aria-label="Votre commentaire" placeholder="Votre commentaire" value={message} maxLength={2000} rows={4} onChange={(e) => setMessage(e.target.value)} required />
                <Button type="submit" disabled={sending}>{sending ? "Envoi…" : "Publier le commentaire"}</Button>
              </form>
            </section>
          )}
        </article>
      )}
    </div>
  );
};

export default BlogPostPage;
