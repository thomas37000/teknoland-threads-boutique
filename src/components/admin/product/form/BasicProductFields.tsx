import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormRow } from "./FormRow";

type Patch = (patch: Record<string, any>) => void;

/** Nom, catégorie, prix et prix soldé — communs à l'ajout et l'édition. */
export function BasicProductFields({
  product,
  onChange,
  categories,
  idPrefix = "",
  nameHint,
}: {
  product: any;
  onChange: Patch;
  categories: string[];
  idPrefix?: string;
  nameHint?: boolean;
}) {
  return (
    <>
      <FormRow label="Nom" htmlFor={`${idPrefix}name`}>
        <Input
          id={`${idPrefix}name`}
          value={product?.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={nameHint ? "Le nom du produit doit être unique" : undefined}
        />
        {nameHint && (
          <p className="text-xs text-muted-foreground mt-1">
            Si vous avez un tshirt et un sweat qui ont le même logo modifiez le nom, ex: tshirt Tekno Attacks et sweat Tekno Attacks au lieu de juste Tekno Attacks
          </p>
        )}
      </FormRow>

      <FormRow label="Categorie" htmlFor={`${idPrefix}category`}>
        <Select value={product?.category || ""} onValueChange={(value) => onChange({ category: value })}>
          <SelectTrigger id={`${idPrefix}category`}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent position="popper">
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>

      <FormRow label="Prix" htmlFor={`${idPrefix}price`}>
        <Input
          id={`${idPrefix}price`}
          type="number"
          value={product?.price || ""}
          onChange={(e) => onChange({ price: parseFloat(e.target.value) })}
        />
      </FormRow>

      <FormRow label="Prix soldé (optionnel)" htmlFor={`${idPrefix}sold-price`}>
        <Input
          id={`${idPrefix}sold-price`}
          type="number"
          value={product?.sold_price ?? ""}
          onChange={(e) => {
            const num = e.target.value ? parseFloat(e.target.value) : null;
            // 0 ou vide => null pour supprimer la promo
            onChange({ sold_price: num && num > 0 ? num : null });
          }}
          placeholder="Laisser vide ou mettre 0 pour supprimer la promo"
        />
      </FormRow>
    </>
  );
}

export function StockField({ id, value, onChange }: { id: string; value: any; onChange: (n: number) => void }) {
  return (
    <FormRow label="Stock" htmlFor={id}>
      <Input id={id} type="number" min="0" value={value || ""} onChange={(e) => onChange(parseInt(e.target.value) || 0)} />
    </FormRow>
  );
}

export function TextField({ id, label, value, onChange, type = "text", placeholder }: {
  id: string; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <FormRow label={label} htmlFor={id}>
      <Input id={id} type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </FormRow>
  );
}

export const STREAMING_PLACEHOLDER = "https://soundcloud.com/... ou https://open.spotify.com/...";
