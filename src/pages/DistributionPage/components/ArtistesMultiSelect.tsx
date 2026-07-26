import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Artiste } from "../types";

/**
 * Multi-select d'artistes basé sur les record IDs Airtable. La valeur émise
 * est un tableau d'IDs (`rec...`) pour être écrite directement dans le champ
 * linked `Artistes`.
 */
export const ArtistesMultiSelect = ({
  artistes,
  value,
  onChange,
}: {
  artistes: Artiste[];
  value: string[];
  onChange: (ids: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const byId = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of artistes) m.set(a.id, a.fields?.Name || a.id);
    return m;
  }, [artistes]);

  const sorted = useMemo(
    () =>
      [...artistes].sort((a, b) =>
        (a.fields?.Name || "").localeCompare(b.fields?.Name || ""),
      ),
    [artistes],
  );

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length > 0
              ? `${value.length} artiste(s) sélectionné(s)`
              : "Sélectionner des artistes…"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Rechercher un artiste…" />
            <CommandList>
              <CommandEmpty>Aucun artiste trouvé.</CommandEmpty>
              <CommandGroup>
                {sorted.map((a) => {
                  const selected = value.includes(a.id);
                  return (
                    <CommandItem
                      key={a.id}
                      value={a.fields?.Name || a.id}
                      onSelect={() => toggle(a.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {a.fields?.Name || a.id}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1">
              {byId.get(id) || id}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                aria-label="Retirer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};