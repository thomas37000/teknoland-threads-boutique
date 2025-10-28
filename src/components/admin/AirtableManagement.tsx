import React, { useState, useEffect } from "react";
import { Artistes } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AirtableTable from "./AirtableTable";
import {
  AddEditArtisteDialog,
  DeleteArtisteDialog,
} from "./ArtistesDialogs";

const AirtableManagement = () => {
    const [artistes, setArtistes] = useState<Artistes[]>([]);
    const [loading, setLoading] = useState(true);
    const [addEditOpen, setAddEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedArtiste, setSelectedArtiste] = useState<Artistes | null>(null);
    const { toast } = useToast();

    const fetchArtistes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_AIRTABLE_URL}/Artistes`, {
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_KEY}`,
                },
            });

            if (!res.ok) throw new Error("Erreur de chargement des artistes");

            const data = await res.json();
            setArtistes(data.records);
            console.log(data.records[0].fields)
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
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un artiste
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <AirtableTable
                        artistes={artistes}
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
