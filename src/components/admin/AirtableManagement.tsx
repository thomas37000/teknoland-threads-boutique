import React, { useState, useEffect } from "react";
import { Artistes } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, RefreshCw } from "lucide-react";
import AirtableTable from "./AirtableTable";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {
  AddEditArtisteDialog,
  DeleteArtisteDialog,
} from "./ArtistesDialogs";

const AirtableManagement = () => {
    const [artistes, setArtistes] = useState<Artistes[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [addEditOpen, setAddEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedArtiste, setSelectedArtiste] = useState<Artistes | null>(null);
    const [nameFilter, setNameFilter] = useState("");
    const [actifFilter, setActifFilter] = useState("all");
    const followerSteps = [0, 250, 500, 1000, 5000, 10000, 15000];
    const [followerStepIndex, setFollowerStepIndex] = useState([0]);
    const { toast } = useToast();

    // On calcule dynamiquement la valeur sélectionnée
    const selectedFollowers = followerSteps[followerStepIndex[0]];
    // On filtre les artistes selon le nombre d'abonnés
    const filteredArtistesFollowers = artistes.filter(
        (a) => a.fields.Followers >= selectedFollowers
    );

    const fetchArtistes = async () => {
        try {
            setLoading(true);
            const { supabase } = await import("@/integrations/supabase/client");

            const { data, error } = await supabase.functions.invoke('airtable-proxy', {
                body: {
                    action: 'get-live-followers'
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setArtistes(data.records);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les artistes.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtistes();
    }, []);

    const handleAdd = () => {
        setSelectedArtiste(null);
        setAddEditOpen(true);
    };

    const handleEdit = (artiste: Artistes) => {
        setSelectedArtiste(artiste);
        setAddEditOpen(true);
    };

    const handleDeleteClick = (artiste: Artistes) => {
        setSelectedArtiste(artiste);
        setDeleteOpen(true);
    };

    const handleSuccess = () => {
        fetchArtistes();
    };

    const filteredArtistes = artistes.filter((artiste) => {
        const matchesName = artiste.fields.Name?.toLowerCase().includes(nameFilter.toLowerCase()) ?? true;
        const matchesActif = actifFilter === "all" || artiste.fields.Actif === actifFilter;
        const minFollowerValue = followerSteps[followerStepIndex[0]];
        const matchesFollowers = ((artiste as any).liveFollowers ?? artiste.fields.Followers ?? 0) >= minFollowerValue;
        return matchesName && matchesActif && matchesFollowers;
    });

    const handleSyncFollowers = async () => {
        try {
            setSyncing(true);
            const { supabase } = await import("@/integrations/supabase/client");

            toast({
                title: "Synchronisation en cours",
                description: "La synchronisation des followers peut prendre quelques minutes...",
            });

            const { data, error } = await supabase.functions.invoke('airtable-proxy', {
                body: {
                    action: 'sync-followers'
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            toast({
                title: "Succès",
                description: `${data.updated} artistes mis à jour, ${data.skipped} ignorés`,
            });

            fetchArtistes();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible de synchroniser les followers",
                variant: "destructive",
            });
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Artistes Teknoland</CardTitle>
                </CardHeader>
                <CardContent>
                    <TableSkeleton rows={10} columns={6} />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Artistes Teknoland Production</CardTitle>
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleSyncFollowers} 
                                variant="outline"
                                disabled={syncing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                                Sync Followers
                            </Button>
                            <Button onClick={handleAdd}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un artiste
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="w-64">
                                <label className="text-sm font-medium mb-2 block">Rechercher par nom</label>
                                <Input
                                    placeholder="Nom de l'artiste..."
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                />
                            </div>
                            <div className="w-64">
                                <label className="text-sm font-medium mb-2 block">Statut</label>
                                <Select value={actifFilter} onValueChange={setActifFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="Compose">Compose</SelectItem>
                                        <SelectItem value="En pause">En pause</SelectItem>
                                        <SelectItem value="Ne compose plus">Ne compose plus</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Nombre d'abonnés : <span className="font-semibold">{followerSteps[followerStepIndex[0]].toLocaleString()}</span> - Nombre d'artistes :  <span className="font-semibold">{filteredArtistes.length}</span>
                                </label>
                                <Slider
                                    value={followerStepIndex}
                                    onValueChange={setFollowerStepIndex}
                                    min={0}
                                    max={followerSteps.length - 1}
                                    step={1}
                                    className="mt-6"
                                />
                            </div>
                        </div>
                    </div>
                    <AirtableTable
                        artistes={filteredArtistes}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                </CardContent>
            </Card>

            <AddEditArtisteDialog
                open={addEditOpen}
                onOpenChange={setAddEditOpen}
                artiste={selectedArtiste}
                onSuccess={handleSuccess}
            />

            <DeleteArtisteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                artiste={selectedArtiste}
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default AirtableManagement;