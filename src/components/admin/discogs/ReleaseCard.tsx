import { ExternalLink, Disc3, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeltaBadge } from "./DeltaBadge";
import type { DiscogsRelease } from "@/hooks/useDiscogs";

interface ReleaseCardProps {
  release: DiscogsRelease;
  deltaCollection: number;
  deltaWantlist: number;
}

export function ReleaseCard({ release, deltaCollection, deltaWantlist }: ReleaseCardProps) {
  const hasNew = deltaCollection > 0 || deltaWantlist > 0;
  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {hasNew && (
        <span className="absolute -top-1 -right-1 z-10 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-background" />
        </span>
      )}
      <div className="aspect-square bg-muted relative">
        {release.thumbnail ? (
          <img
            src={release.thumbnail}
            alt={release.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Disc3 className="h-12 w-12" />
          </div>
        )}
        {(deltaCollection > 0 || deltaWantlist > 0) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <DeltaBadge label="Coll." delta={deltaCollection} tone="collection" />
            <DeltaBadge label="Want" delta={deltaWantlist} tone="wantlist" />
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-2">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">{release.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {release.artist ?? "—"} {release.year ? `· ${release.year}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1">
            <Disc3 className="h-3 w-3" />
            {release.current_collection_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {release.current_wantlist_count}
          </span>
          {release.discogs_url && (
            <a
              href={release.discogs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}