
'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  name: string;
  salary?: number;
}

const YourSalaryCard = () => {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const employeeQuery = useMemo(() => {
    if (!firestore || !user?.email) return null;
    return query(collection(firestore, 'employees'), where('email', '==', user.email));
  }, [firestore, user?.email]);

  useEffect(() => {
    if (!employeeQuery) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(employeeQuery, (snapshot) => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data() as Omit<Employee, 'id'>;
            setEmployeeData({ id: doc.id, ...data });
        } else {
            setEmployeeData(null);
        }
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch salary:", error);
        toast({
            title: "Salary Error",
            description: "Could not fetch your salary information.",
            variant: "destructive"
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [employeeQuery, toast]);


  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Monthly Salary</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </CardContent>
      </Card>
    );
  }

  if (!employeeData || employeeData.salary === undefined) {
    // Don't show the card if there's no salary data for this user
    return null;
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Monthly Salary</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">₹{employeeData.salary.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">This is your recorded salary for the current month.</p>
      </CardContent>
    </Card>
  );
};

export default YourSalaryCard;
