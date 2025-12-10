
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, PackageCheck } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  total?: number;
  createdAt: Timestamp;
  status: 'Completed' | 'Not Completed';
}

export default function FinancialManagementPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isSuperAdmin = user?.email === 'naveen.01@nafon.in';

  useEffect(() => {
    if (!isUserLoading && !isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      router.replace('/admin');
    }
  }, [user, isUserLoading, router, toast, isSuperAdmin]);

  useEffect(() => {
    if (!firestore || !isSuperAdmin) {
      setLoading(false);
      return;
    }

    const ordersCollection = collection(firestore, 'orders');
    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast({ title: 'Error', description: 'Could not fetch order data.', variant: 'destructive' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, toast, isSuperAdmin]);

  const completedOrders = orders.filter(order => order.status === 'Completed');
  const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.total || 0), 0);

  if (isUserLoading || loading) {
    return <div>Loading Financial Data...</div>;
  }

  if (!isSuperAdmin) {
    return <div>Redirecting...</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 font-headline">Financial Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Total orders marked as completed</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4 font-headline">Completed Orders Log</h2>
      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-medium">₹{order.total?.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {completedOrders.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No completed orders to display.
            </div>
        )}
      </div>
    </>
  );
}

    