import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save, Database } from "lucide-react";
import { toast } from "sonner";

interface UsageData {
  month: string;
  count: number;
  quota: number;
  remaining: number;
  percent: number;
}

const AirtableUsageCard = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotaInput, setQuotaInput] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("airtable-proxy", {
        body: { action: "get-usage" },
      });
      if (error) throw error;
      setUsage(data as UsageData);
      setQuotaInput(String((data as UsageData).quota));
    } catch (e: any) {
      console.error(e);
      toast.error("Impossible de charger le compteur Airtable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const saveQuota = async () => {
    const value = parseInt(quotaInput, 10);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Quota invalide");
      return;
    }
    setSaving(true);
    try {
      // Met à jour la ligne unique de settings (ou la crée si absente)
      const { data: existing } = await supabase.from("settings").select("id").limit(1).maybeSingle();
      let error;
      if (existing) {
        ({ error } = await supabase
          .from("settings")
          .update({ airtable_monthly_quota: value })
          .eq("id", existing.id));
      } else {
        ({ error } = await supabase.from("settings").insert({ airtable_monthly_quota: value }));
      }
      if (error) throw error;
      toast.success("Quota mis à jour");
      await fetchUsage();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const percent = usage?.percent ?? 0;
  const barTone =
    percent >= 90 ? "bg-destructive" : percent >= 70 ? "bg-yellow-500" : "bg-primary";

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Consommation API Airtable</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsage} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        </div>
        <CardDescription>
          Mois en cours : <strong>{usage?.month ?? "—"}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Appels consommés</div>
            <div className="text-2xl font-semibold">{usage?.count ?? 0}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Quota mensuel</div>
            <div className="text-2xl font-semibold">{usage?.quota ?? 0}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Restants (estim.)</div>
            <div className="text-2xl font-semibold">{usage?.remaining ?? 0}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progression</span>
            <span className="font-medium">{percent}%</span>
          </div>
          <Progress value={percent} indicatorClassName={barTone} />
        </div>

        <p className="text-xs text-muted-foreground italic">
          Estimation basée uniquement sur les appels effectués par cette application.
        </p>

        <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label htmlFor="airtable-quota">Quota mensuel configuré</Label>
            <Input
              id="airtable-quota"
              type="number"
              min={0}
              value={quotaInput}
              onChange={(e) => setQuotaInput(e.target.value)}
            />
          </div>
          <Button onClick={saveQuota} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde…" : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirtableUsageCard;