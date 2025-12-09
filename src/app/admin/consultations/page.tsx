
'use client';
import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  deleteDoc,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

interface Consultation {
  id: string;
  customerName: string;
  customerEmail: string;
  projectTopic: string;
  preferredTime: string;
  assignedTo: string;
  createdAt: Timestamp;
  meetingLink?: string;
  meetingStatus?: 'Pending' | 'Completed';
  linkSentStatus?: 'Sent' | 'Not Sent';
}

interface Employee {
  id: string;
  name: string;
}

export default function ConsultationManagementPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const userEmail = user?.email || '';
  const isSuperAdmin = userEmail === 'naveen.01@nafon.in';
  const isAdmin = userEmail && ['nafonstudios@gmail.com', 'naveen.01@nafon.in', 'john.04@nafon.in', 'karthick.02@nafon.in', 'thamizh.03@nafon.in', 'jed.05@nafon.in', 'gershon.05@nafon.in'].includes(userEmail);
  const canAssignConsultants = isSuperAdmin || userEmail === 'thamizh.03@nafon.in';
  const canManageMeetings = isSuperAdmin || userEmail === 'thamizh.03@nafon.in';
  const canManageConsultations = isSuperAdmin || ['nafonstudios@gmail.com', 'john.04@nafon.in', 'karthick.02@nafon.in', 'thamizh.03@nafon.in', 'jed.05@nafon.in', 'gershon.05@nafon.in'].includes(userEmail);


  useEffect(() => {
    if (!isUserLoading && !canManageConsultations) {
      router.replace('/');
    }
  }, [isUserLoading, canManageConsultations, router]);

  useEffect(() => {
    if (!firestore || !canManageConsultations) {
        setLoading(false);
        return;
    };

    const consultationsCollection = collection(firestore, 'consultations');
    const unsubscribeConsultations = onSnapshot(consultationsCollection, (snapshot) => {
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

    let unsubscribeEmployees = () => {};
    if (canAssignConsultants) {
        const employeesCollection = collection(firestore, 'employees');
        unsubscribeEmployees = onSnapshot(employeesCollection, (snapshot) => {
            const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })) as Employee[];
            setEmployees(fetchedEmployees);
        }, (error) => {
            console.error("Error fetching employees:", error);
            toast({ title: "Employee Fetch Error", description: "Could not fetch employee list for assignment.", variant: 'destructive' });
        });
    }

    return () => {
        unsubscribeConsultations();
        unsubscribeEmployees();
    };
  }, [firestore, toast, canAssignConsultants, canManageConsultations]);

  const handleUpdateConsultation = async (consultationId: string, updates: Partial<Consultation>) => {
    if (!firestore || !canManageConsultations) return;
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
      if (!firestore || !isSuperAdmin) return;
      try {
          await deleteDoc(doc(firestore, 'consultations', consultationId));
          toast({title: 'Consultation Removed', description: 'The consultation has been removed.'});
      } catch (error) {
          console.error('Error deleting consultation:', error);
          toast({title: 'Delete Error', description: 'Could not remove the consultation.', variant: 'destructive'});
      }
  }

  if (isUserLoading || loading) {
    return <div>Loading Consultation Data...</div>;
  }

  if (!canManageConsultations) {
      return <div>Redirecting...</div>
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
              <TableHead>Project Topic</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Meeting Link</TableHead>
              <TableHead>Link Status</TableHead>
              <TableHead>Meeting Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell className="font-medium">{consultation.customerName}</TableCell>
                <TableCell>{consultation.customerEmail}</TableCell>
                <TableCell>{consultation.projectTopic}</TableCell>
                <TableCell>{consultation.preferredTime}</TableCell>
                <TableCell>
                  {canAssignConsultants ? (
                    <Select
                        value={consultation.assignedTo}
                        onValueChange={(value) => handleUpdateConsultation(consultation.id, { assignedTo: value })}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                            {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  ) : (
                    <span>{consultation.assignedTo || 'Not Assigned'}</span>
                  )}
                </TableCell>
                <TableCell>
                    {canManageMeetings ? (
                        <Input
                            type="text"
                            placeholder="Add meeting link..."
                            defaultValue={consultation.meetingLink}
                            onBlur={(e) => handleUpdateConsultation(consultation.id, { meetingLink: e.target.value })}
                            className="w-[180px]"
                        />
                    ) : (
                        <a href={consultation.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {consultation.meetingLink ? 'Join Meeting' : 'Not set'}
                        </a>
                    )}
                </TableCell>
                <TableCell>
                     {canManageMeetings ? (
                        <Select
                            value={consultation.linkSentStatus || 'Not Sent'}
                            onValueChange={(value: 'Sent' | 'Not Sent') => handleUpdateConsultation(consultation.id, { linkSentStatus: value })}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Not Sent">Not Sent</SelectItem>
                                <SelectItem value="Sent">Sent</SelectItem>
                            </SelectContent>
                        </Select>
                     ) : (
                        <span>{consultation.linkSentStatus || 'Not Sent'}</span>
                     )}
                </TableCell>
                <TableCell>
                     {canManageMeetings ? (
                        <Select
                            value={consultation.meetingStatus || 'Pending'}
                            onValueChange={(value: 'Pending' | 'Completed') => handleUpdateConsultation(consultation.id, { meetingStatus: value })}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                     ) : (
                        <span>{consultation.meetingStatus || 'Pending'}</span>
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
