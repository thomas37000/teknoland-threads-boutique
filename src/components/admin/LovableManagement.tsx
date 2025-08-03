
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lovable {
  id: string;
  prompt: number;
  created_at: string;
}

interface LovableStats {
  dailyCredits: number;
  monthlyCredits: number;
  dailyUsed: number;
  monthlyUsed: number;
  resetDate: string;
}

const LovableManagement = () => {
  const [prompts, setPrompts] = useState<Lovable[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Lovable | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch prompts from Supabase
  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lovable')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching lovable prompts:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le nombre de prompts",
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        setCurrentPrompt(data[0]);
      }
      setPrompts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const decrementPrompt = async () => {
    if (!currentPrompt || currentPrompt.prompt <= 0) return;

    const newPromptCount = currentPrompt.prompt - 1;
    
    try {
      const { data, error } = await supabase
        .from('lovable')
        .update({
          prompt: newPromptCount
        })
        .eq('id', currentPrompt.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt:', error);
        toast({
          title: "Erreur",
          description: "Impossible de décrémenter le nombre de prompts",
          variant: "destructive"
        });
        return;
      }

      setCurrentPrompt(data);
      const updatedPrompts = prompts.map(pro => 
        pro.id === currentPrompt.id ? data : pro
      );
      setPrompts(updatedPrompts);

      toast({
        title: "Succès",
        description: "Prompt utilisé avec succès",
      });

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetPrompts = async () => {
    if (!currentPrompt) return;

    try {
      const { data, error } = await supabase
        .from('lovable')
        .update({
          prompt: 30
        })
        .eq('id', currentPrompt.id)
        .select()
        .single();

      if (error) {
        console.error('Error resetting prompts:', error);
        toast({
          title: "Erreur",
          description: "Impossible de réinitialiser les prompts",
          variant: "destructive"
        });
        return;
      }

      setCurrentPrompt(data);
      const updatedPrompts = prompts.map(pro => 
        pro.id === currentPrompt.id ? data : pro
      );
      setPrompts(updatedPrompts);

      toast({
        title: "Succès",
        description: "Prompts réinitialisés à 30",
      });

    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-purple-500" />
            Lovable - Gestion des Crédits
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Suivez votre utilisation des crédits Lovable
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchPrompts}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            onClick={resetPrompts}
            disabled={loading || !currentPrompt}
            variant="destructive"
            className="flex items-center gap-2"
          >
            Réinitialiser à 30 à chaque fin du mois
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crédits Mensuels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Crédits Mensuels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">
                {currentPrompt ? currentPrompt.prompt : 0}
              </span>
              <Badge variant={currentPrompt && currentPrompt.prompt > 10 ? "default" : "destructive"}>
                Restants
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={decrementPrompt}
                disabled={loading || !currentPrompt || currentPrompt.prompt <= 0}
                variant="outline"
                size="sm"
              >
                Utiliser un prompt (-1)
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Prompts disponibles ce mois-ci
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LovableManagement;
