
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import UpdateProfileDialog from "./UpdateProfileDialog";

interface AccountTabProps {
  user: any;
}

const AccountTab = ({ user }: AccountTabProps) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2" /> Informations compte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p>{user?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nom</h3>
            <p>{user?.user_metadata?.full_name || "Non renseigné"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Compte créé le :</h3>
            <p>{new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
          <Button className="mt-4" onClick={() => setShowDialog(true)}>
            Mettre à jour mes informations
          </Button>
          <Button className="mt-4 ml-2 bg-red-600 hover:bg-red-500">
            Supprimez votre compte
          </Button>
        </div>
        <UpdateProfileDialog user={user} open={showDialog} onOpenChange={setShowDialog} />
      </CardContent>
    </Card>
  );
};

export default AccountTab;
