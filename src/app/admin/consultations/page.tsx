
'use client';
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Consultation {
  id: string;
  customerName: string;
  customerEmail: string;
  preferredTime: string;
  assignedTo: string;
  createdAt: Timestamp;
}

export default function ConsultationManagementPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const isSuperAdmin = user?.email === 'naveen.01@nafon.in';

  useEffect(() => {
    if (!firestore) return;

    const consultationsCollection = collection(firestore, 'consultations');
    const unsubscribe = onSnapshot(consultationsCollection, (snapshot) => {
      const fetchedConsultations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Consultation));
      setConsultations(fetchedConsultations.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching consultations:', error);
      toast({ title: 'Error', description: 'Could not fetch consultation data.', variant: 'destructive'});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  const handleUpdateConsultation = async (consultationId: string, updates: Partial<Consultation>) => {
    if (!firestore) return;
    const consultationRef = doc(firestore, 'consultations', consultationId);
    try {
      await updateDoc(consultationRef, updates);
      toast({ title: 'Success', description: 'Consultation updated successfully.' });
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({ title: 'Error', description: 'Failed to update consultation. Check permissions.', variant: 'destructive' });
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
      if (!firestore) return;
      try {
          await deleteDoc(doc(firestore, 'consultations', consultationId));
          toast({title: 'Consultation Removed', description: 'The consultation has been removed.'});
      } catch (error) {
          console.error('Error deleting consultation:', error);
          toast({title: 'Delete Error', description: 'Could not remove the consultation.', variant: 'destructive'});
      }
  }

  if (loading) {
    return <div>Loading Consultation Data...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p>Manage all scheduled customer consultations.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell className="font-medium">{consultation.customerName}</TableCell>
                <TableCell>{consultation.customerEmail}</TableCell>
                <TableCell>{consultation.preferredTime}</TableCell>
                <TableCell>
                  {isSuperAdmin ? (
                    <Input
                      type="text"
                      defaultValue={consultation.assignedTo}
                      onBlur={(e) => handleUpdateConsultation(consultation.id, { assignedTo: e.target.value })}
                      placeholder="Assign to..."
                    />
                  ) : (
                    <span>{consultation.assignedTo || 'Not Assigned'}</span>
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm" disabled={!isSuperAdmin}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete this consultation record. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteConsultation(consultation.id)}>Confirm</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
