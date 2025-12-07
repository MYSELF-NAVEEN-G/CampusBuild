
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { updateOrderStatus } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { id: string; title: string; price: number }[];
  total: number;
  createdAt: Timestamp;
  status: 'Completed' | 'Not Completed';
  assigned: string;
  deadline: string;
}

export default function AdminPage() {
  const { firestore } = useFirebase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const ordersCollection = collection(firestore, 'orders');

    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Order));
        setOrders(fetchedOrders);
        setLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'orders',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const handleStatusChange = async (orderId: string, status: 'Completed' | 'Not Completed') => {
    const result = await updateOrderStatus(orderId, { status });
    toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
    });
  };

  const handleAssignedChange = async (orderId: string, assigned: string) => {
    const result = await updateOrderStatus(orderId, { assigned });
    toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
    });
  };
    
  const handleDeadlineChange = async (orderId: string, deadline: string) => {
    const result = await updateOrderStatus(orderId, { deadline });
    toast({
        title: result.success ? 'Success' : 'Error',
        description: result.message,
    });
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
                <div className="flex items-center cursor-pointer group">
                    <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                        <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <FlaskConical className="text-accent" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-headline">NAFON</h1>
                        <p className="text-xs text-primary font-code font-medium tracking-widest uppercase">Admin Dashboard</p>
                    </div>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    </header>
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 font-headline">Order Management</h1>
      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Order Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                    <div>{order.customerEmail}</div>
                    <div>{order.customerPhone}</div>
                </TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(value: 'Completed' | 'Not Completed') => handleStatusChange(order.id, value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Not Completed">Not Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    type="text" 
                    defaultValue={order.assigned} 
                    onBlur={(e) => handleAssignedChange(order.id, e.target.value)}
                    placeholder="Assign to..."
                   />
                </TableCell>
                <TableCell>
                    <Input type="date" defaultValue={order.deadline} onBlur={(e) => handleDeadlineChange(order.id, e.target.value)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
    </>
  );
}
