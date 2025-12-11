
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
      <div className="p-2 border rounded-lg bg-white shadow-sm">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!employeeData || employeeData.salary === undefined) {
    return null; // Don't render anything if there's no salary data
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-full">
            <Wallet className="h-5 w-5" />
        </div>
        <div>
            <div className="text-xs text-muted-foreground">Your Monthly Salary</div>
            <div className="text-lg font-bold">₹{employeeData.salary.toFixed(2)}</div>
        </div>
    </div>
  );
};

export default YourSalaryCard;
