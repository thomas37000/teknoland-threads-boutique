import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Block, sanitize, toEmbedUrl } from "@/lib/blog";

export const RenderBlock = ({ block }: { block: Block }) => {
  const d = block.data;
  switch (block.type) {
    case "heading": {
      const Tag = (d.level === 3 ? "h3" : "h2") as "h2" | "h3";
      return <Tag className={d.level === 3 ? "text-xl font-semibold" : "text-2xl md:text-3xl font-bold"}>{d.text}</Tag>;
    }
    case "text":
      return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(d.html) }} />;
    case "image":
      return d.url ? (
        <figure>
          <img src={d.url} alt={d.alt || ""} loading="lazy" className="w-full rounded-lg" />
          {d.caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{d.caption}</figcaption>}
        </figure>
      ) : null;
    case "video": {
      const src = toEmbedUrl(d.url || "");
      return src ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <iframe src={src} title="Vidéo" className="h-full w-full" allowFullScreen loading="lazy" />
        </div>
      ) : null;
    }
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
          {d.text}
          {d.author && <footer className="mt-2 text-sm not-italic text-muted-foreground">— {d.author}</footer>}
        </blockquote>
      );
    case "columns":
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(d.left) }} />
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(d.right) }} />
        </div>
      );
    case "button":
      return (
        <div className="text-center">
          {String(d.href || "").startsWith("/") ? (
            <Button asChild><Link to={d.href}>{d.label}</Link></Button>
          ) : (
            <Button asChild><a href={d.href} target="_blank" rel="noopener noreferrer">{d.label}</a></Button>
          )}
        </div>
      );
    case "spacer":
      return <div style={{ height: Number(d.size) || 40 }} />;
    default:
      return null;
  }
};

const BlockRenderer = ({ mode, content }: { mode: string; content: any }) => {
  if (mode === "rich") {
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitize(content?.html || "") }} />;
  }
  const blocks: Block[] = Array.isArray(content) ? content : [];
  return (
    <div className="space-y-6">
      {blocks.map((b) => <RenderBlock key={b.id} block={b} />)}
    </div>
  );
};

export default BlockRenderer;
