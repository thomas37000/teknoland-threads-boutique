
import React, { useState, useEffect } from "react";
import { Artistes } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AirtableTable from "./AirtableTable";

const AirtableManagement = () => {
    const [artistes, setArtistes] = useState<Artistes[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
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

        fetchArtistes();
    }, []);



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
                    </div>
                </CardHeader>
                <CardContent>
                    <AirtableTable
                        artistes={artistes}
                        onEdit={function (artiste: Artistes): void {
                            throw new Error("Function not implemented.");
                        }}
                        onDelete={(id: string) => {
                            console.log("Supprimer artiste", id);
                        }}
                    />
                </CardContent>

            </Card>
        </div>
    );
};

export default AirtableManagement;
