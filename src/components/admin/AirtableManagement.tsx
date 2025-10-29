import React, { useState, useEffect } from "react";
import { Artistes } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw } from "lucide-react";
import AirtableTable from "./AirtableTable";
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
    const [minFollowers, setMinFollowers] = useState("");
    const { toast } = useToast();

    const fetchArtistes = async () => {
        try {
            setLoading(true);
            const { supabase } = await import("@/integrations/supabase/client");
            
            const { data, error } = await supabase.functions.invoke('airtable-proxy', {
                body: {
                    method: 'GET',
                    table: 'Artistes'
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setArtistes(data.records);
            console.log('Artistes loaded:', data.records);
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
        const matchesFollowers = minFollowers === "" || (artiste.fields.Followers ?? 0) >= parseInt(minFollowers);
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
                <CardContent className="p-6">
                    <div className="text-center">Chargement des artistes...</div>
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
                        <CardTitle>Artistes Teknoland</CardTitle>
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
                            <div>
                                <label className="text-sm font-medium mb-2 block">Rechercher par nom</label>
                                <Input
                                    placeholder="Nom de l'artiste..."
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Statut</label>
                                <Select value={actifFilter} onValueChange={setActifFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="Oui">Actif</SelectItem>
                                        <SelectItem value="Non">Inactif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Nombre minimum d'abonnés</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minFollowers}
                                    onChange={(e) => setMinFollowers(e.target.value)}
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
