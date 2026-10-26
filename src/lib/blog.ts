// import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";

// Blog tables are accessed through an untyped handle so the module stays independent of generated types.
export const blogDb = supabase as any;

export type BlockType = "heading" | "text" | "image" | "video" | "quote" | "columns" | "button" | "spacer";

export interface Block {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

export type EditorMode = "blocks" | "rich";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  editor_mode: EditorMode;
  content: any;
  status: "draft" | "published";
  category: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const sanitize = (html: string) =>
  DOMPurify.sanitize(html || "", { ADD_ATTR: ["target"] });

export const defaultBlock = (type: BlockType): Block => {
  const data: Record<BlockType, Record<string, any>> = {
    heading: { text: "Nouveau titre", level: 2 },
    text: { html: "<p>Votre texte…</p>" },
    image: { url: "", alt: "", caption: "" },
    video: { url: "" },
    quote: { text: "Une citation", author: "" },
    columns: { left: "<p>Colonne gauche</p>", right: "<p>Colonne droite</p>" },
    button: { label: "En savoir plus", href: "/" },
    spacer: { size: 40 },
  };
  return { id: newId(), type, data: { ...data[type] } };
};

export const toEmbedUrl = (url: string) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  if (url.includes("soundcloud.com"))
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
  return url.startsWith("https://") ? url : "";
};
