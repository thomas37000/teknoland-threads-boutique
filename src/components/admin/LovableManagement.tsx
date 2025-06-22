
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, TrendingUp, RefreshCw } from "lucide-react";

interface LovableStats {
  dailyCredits: number;
  monthlyCredits: number;
  dailyUsed: number;
  monthlyUsed: number;
  resetDate: string;
}

const LovableManagement = () => {
  const [stats, setStats] = useState<LovableStats>({
    dailyCredits: 50,
    monthlyCredits: 500,
    dailyUsed: 12,
    monthlyUsed: 125,
    resetDate: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(false);

  const refreshStats = async () => {
    setLoading(true);
    // Simulation d'un appel API - à remplacer par l'API Lovable réelle
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        dailyUsed: Math.floor(Math.random() * prev.dailyCredits),
        monthlyUsed: Math.floor(Math.random() * prev.monthlyCredits),
      }));
      setLoading(false);
    }, 1000);
  };

  const dailyRemaining = stats.dailyCredits - stats.dailyUsed;
  const monthlyRemaining = stats.monthlyCredits - stats.monthlyUsed;
  
  const dailyPercentage = (stats.dailyUsed / stats.dailyCredits) * 100;
  const monthlyPercentage = (stats.monthlyUsed / stats.monthlyCredits) * 100;

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-orange-500";
    return "text-green-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-blue-500";
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
        <Button 
          onClick={refreshStats} 
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crédits Journaliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Crédits Journaliers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">{dailyRemaining}</span>
              <Badge variant={dailyRemaining > 10 ? "default" : "destructive"}>
                Restants
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(dailyPercentage)}`}
                style={{ width: `${dailyPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Utilisés: {stats.dailyUsed}</span>
              <span>Total: {stats.dailyCredits}</span>
            </div>
            
            <div className={`text-sm font-medium ${getUsageColor(dailyPercentage)}`}>
              {dailyPercentage.toFixed(1)}% utilisé
            </div>
          </CardContent>
        </Card>

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
              <span className="text-2xl font-bold">{monthlyRemaining}</span>
              <Badge variant={monthlyRemaining > 50 ? "default" : "destructive"}>
                Restants
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getProgressColor(monthlyPercentage)}`}
                style={{ width: `${monthlyPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Utilisés: {stats.monthlyUsed}</span>
              <span>Total: {stats.monthlyCredits}</span>
            </div>
            
            <div className={`text-sm font-medium ${getUsageColor(monthlyPercentage)}`}>
              {monthlyPercentage.toFixed(1)}% utilisé
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations Supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Prochaine Réinitialisation</div>
              <div className="text-blue-600">
                {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Plan Actuel</div>
              <div className="text-green-600">Gratuit</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-800">Dernière Mise à Jour</div>
              <div className="text-purple-600">
                {new Date().toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LovableManagement;
