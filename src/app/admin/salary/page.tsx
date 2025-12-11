
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    salary?: number;
    position: string;
}

export default function SalaryManagementPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userEmail = user?.email || '';
  const isSuperAdmin = userEmail === 'naveen.01@nafon.in';
  const canManageSalaries = isSuperAdmin || userEmail === 'john.04@nafon.in' || userEmail === 'lekshmi.06@nafon.in';

  useEffect(() => {
    if (!isUserLoading && !canManageSalaries) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      router.replace('/admin');
    }
  }, [user, isUserLoading, router, toast, canManageSalaries]);

  useEffect(() => {
    if (!firestore || !canManageSalaries) {
      setLoading(false);
      return;
    }

    const employeesCollection = collection(firestore, 'employees');
    const unsubscribe = onSnapshot(employeesCollection, (snapshot) => {
        const fetchedEmployees = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Employee));
        setEmployees(fetchedEmployees);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching employees:", error);
        toast({ title: 'Error', description: 'Could not fetch employee salary data.', variant: 'destructive'});
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast, canManageSalaries]);

  const handleUpdateSalary = async (employeeId: string, newSalary: number) => {
    if (!firestore || !canManageSalaries) return;
    const employeeRef = doc(firestore, 'employees', employeeId);
    try {
      await updateDoc(employeeRef, { salary: newSalary });
      toast({ title: 'Salary Updated', description: `Salary has been updated.` });
    } catch (error) {
      console.error('Error updating salary:', error);
      toast({ title: 'Update Error', description: 'Could not update salary.', variant: 'destructive'});
    }
  };

  const totalSalaryCost = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);

  if (isUserLoading || loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
  }

  if (!canManageSalaries) {
    return <div>Redirecting...</div>;
  }

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Salary Management</h1>
                <p className="text-muted-foreground mt-1">View and manage monthly salaries for all team members.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Wallet className="h-6 w-6" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Total Monthly Payout</div>
                    <div className="text-2xl font-bold">₹{totalSalaryCost.toFixed(2)}</div>
                </div>
            </div>
        </div>
      
        <div className="bg-white rounded-lg shadow-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-right">Monthly Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell className="text-right">
                    <Input
                        type="number"
                        defaultValue={emp.salary}
                        onBlur={(e) => handleUpdateSalary(emp.id, parseFloat(e.target.value) || 0)}
                        className="w-32 ml-auto text-right"
                        placeholder="Set Salary"
                        disabled={!canManageSalaries}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </>
  );
}
