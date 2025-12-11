
'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from './ui/button';

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
        setLoading(false);
    });

    return () => unsubscribe();
  }, [employeeQuery, toast]);


  if (loading) {
    return (
      <div className="w-full p-2 border rounded-lg bg-white shadow-sm mb-2">
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  if (!employeeData || employeeData.salary === undefined) {
    return null;
  }

  return (
    <Card className="mb-2 border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <CardTitle className="text-xs font-medium">Your Monthly Salary</CardTitle>
        <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs">
            <Link href="/admin/salary">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-xl font-bold text-primary">₹{employeeData.salary.toFixed(2)}</div>
      </CardContent>
    </Card>
  );
};

export default YourSalaryCard;
