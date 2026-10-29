import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { useAuth } from "@/hooks/use-auth";
import { BlogPost, blogDb } from "@/lib/blog";
import PostEditor from "@/components/blog/PostEditor";

// Au-delà de 8 articles, la liste se découpe en pages.
const PAGE_SIZE = 8;


const BlogPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let query = blogDb.from("blog_posts").select("*").order("published_at", { ascending: false, nullsFirst: false });
    if (!isAdmin) query = query.eq("status", "published");
    query.then(({ data, error }: any) => {
      if (error) toast.error("Impossible de charger les articles");
      setPosts(data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  // Changer de catégorie ou de tag ramène à la première page.
  useEffect(() => { setPage(1); }, [category, tag]);

  const categories = useMemo(() => [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[], [posts]);
  const filtered = posts.filter((p) => (!category || p.category === category) && (!tag || p.tags?.includes(tag)));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div className="tekno-container py-12">
      <Helmet>
        <title>Blog | Teknoland</title>
        <meta name="description" content="Actualités, sorties et coulisses de Teknoland." />
      </Helmet>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Blog</h1>
        {isAdmin && !creating && <Button onClick={() => setCreating(true)}><Plus className="mr-1 h-4 w-4" /> Nouvel article</Button>}
      </div>

      {isAdmin && creating && (
        <div className="mb-10 border-y border-border py-6">
          <PostEditor onSaved={(p) => navigate(`/blog/${p.slug}`)} onCancel={() => setCreating(false)} />
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button size="sm" variant={!category ? "default" : "outline"} onClick={() => setCategory(null)}>Tout</Button>
          {categories.map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)}>{c}</Button>
          ))}
          {tag && <Badge variant="secondary" className="cursor-pointer" onClick={() => setTag(null)}>#{tag} ✕</Badge>}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Aucun article pour le moment.</p>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <Link to={`/blog/${p.slug}`}>
                  <div className="aspect-video bg-muted">
                    {p.cover_image && <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                </Link>
                <div className="space-y-2 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {p.status === "draft" && <Badge variant="outline">Brouillon</Badge>}
                    {p.category && <span className="font-semibold uppercase">{p.category}</span>}
                    {p.published_at && <span>{new Date(p.published_at).toLocaleDateString("fr-FR")}</span>}
                  </div>
                  <Link to={`/blog/${p.slug}`}><h2 className="text-xl font-bold hover:underline">{p.title}</h2></Link>
                  {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                  <div className="flex flex-wrap gap-1">
                    {p.tags?.map((t) => <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => setTag(t)}>#{t}</Badge>)}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length > PAGE_SIZE && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <Button variant="outline" size="icon" aria-label="Page précédente" disabled={current === 1} onClick={() => goTo(current - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <Button variant={p === current ? "default" : "outline"} size="icon" aria-label={`Page ${p}`} aria-current={p === current ? "page" : undefined} onClick={() => goTo(p)}>{p}</Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button variant="outline" size="icon" aria-label="Page suivante" disabled={current === totalPages} onClick={() => goTo(current + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

    </div>
  );
};

export default BlogPage;
