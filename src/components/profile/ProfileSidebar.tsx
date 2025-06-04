
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Heart, Package, Settings, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSidebarProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileSidebar = ({ user, activeTab, setActiveTab }: ProfileSidebarProps) => {
  return (
    <aside className="w-full md:w-1/3 lg:w-1/4">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
            <AvatarFallback className="text-2xl bg-tekno-blue text-white">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">{user?.user_metadata?.full_name || user?.email}</CardTitle>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className={`w-full justify-start ${activeTab === "account" ? "bg-tekno-blue/80 text-white" : ""}`} 
              onClick={() => setActiveTab("account")}
            >
              <User className="mr-2 h-4 w-4" /> Informations compte
            </Button>
            <Button 
              variant="outline" 
              className={`w-full justify-start ${activeTab === "favorites" ? "bg-tekno-blue/80 text-white" : ""}`} 
              onClick={() => setActiveTab("favorites")}
            >
              <Heart className="mr-2 h-4 w-4" /> Favorits
            </Button>
            <Button 
              variant="outline" 
              className={`w-full justify-start ${activeTab === "cart" ? "bg-tekno-blue/80 text-white" : ""}`} 
              onClick={() => setActiveTab("cart")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Panier sauvegardé
            </Button>
            <Button 
              variant="outline" 
              className={`w-full justify-start ${activeTab === "orders" ? "bg-tekno-blue/80 text-white" : ""}`} 
              onClick={() => setActiveTab("orders")}
            >
              <Package className="mr-2 h-4 w-4" /> Achats
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => supabase.auth.signOut()}
            >
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ProfileSidebar;
