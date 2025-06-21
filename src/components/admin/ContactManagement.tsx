
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ContactManagement = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les messages",
          variant: "destructive"
        });
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const markAsRead = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ status: 'read' })
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error marking as read:', error);
        return;
      }

      const updatedContacts = contacts.map(contact => 
        contact.id === contactId ? data as Contact : contact
      );
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('Error deleting contact:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le message",
          variant: "destructive"
        });
        return;
      }

      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);

      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailDialogOpen(true);
    if (contact.status === 'unread') {
      markAsRead(contact.id);
    }
  };

  const getSubjectLabel = (subject: string) => {
    const labels: { [key: string]: string } = {
      'order': 'Commande',
      'product': 'Produit',
      'return': 'Retour',
      'feedback': 'Avis',
      'other': 'Autre'
    };
    return labels[subject] || subject;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tekno-blue"></div>
      </div>
    );
  }

  const unreadCount = contacts.filter(c => c.status === 'unread').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Messages de Contact</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''} message{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Tous les messages ({contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className={contact.status === 'unread' ? 'bg-blue-50' : ''}>
                  <TableCell>
                    <Badge variant={contact.status === 'unread' ? 'default' : 'secondary'}>
                      {contact.status === 'unread' ? 'Non lu' :  'Lu'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{getSubjectLabel(contact.subject)}</TableCell>
                  <TableCell>{new Date(contact.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewContact(contact)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Message de {selectedContact?.name}</DialogTitle>
                          </DialogHeader>
                          {selectedContact && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <strong>Nom:</strong> {selectedContact.name}
                                </div>
                                <div>
                                  <strong>Email:</strong> {selectedContact.email}
                                </div>
                                <div>
                                  <strong>Sujet:</strong> {getSubjectLabel(selectedContact.subject)}
                                </div>
                                <div>
                                  <strong>Date:</strong> {new Date(selectedContact.created_at).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                              <div>
                                <strong>Message:</strong>
                                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                                  {selectedContact.message}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteContact(contact.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManagement;
