
'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Employee {
  id: string;
  name: string;
  age: number;
  position: string;
  specialization: string;
}

export default function TeamPage() {
  const { firestore } = useFirebase();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    const employeesCollection = collection(firestore, 'employees');
    const unsubscribe = onSnapshot(employeesCollection, (snapshot) => {
      const fetchedEmployees = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Employee));
      setEmployees(fetchedEmployees);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching employees:', error);
      
      const contextualError = new FirestorePermissionError({
        path: 'employees',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', contextualError);

      toast({ title: 'Error', description: 'Could not fetch employee data. Check your permissions.', variant: 'destructive'});
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast]);

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <p>This is the current list of team members and their roles within the organization.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Specialization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.age}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.specialization}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
