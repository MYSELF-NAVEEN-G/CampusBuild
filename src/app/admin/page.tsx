
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FlaskConical, LogOut, Eye } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface OrderItem {
  id: string;
  title: string;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items?: OrderItem[]; // For catalog orders
  total?: number;
  createdAt: Timestamp;
  status: 'Completed' | 'Not Completed';
  assigned: string;
  deadline: string;
  // Fields for custom orders
  projectTitle?: string;
  domain?: string;
  detailedRequirements?: string;
  isCustomOrder?: boolean;
}

export default function AdminPage() {
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      if (!isUserLoading) {
        toast({
          title: "Access Denied",
          description: "You must be an admin to view this page.",
          variant: "destructive",
        });
        router.push('/schedule-meeting');
      }
      return;
    }
    
    if (user.email !== 'nafonstudios@gmail.com') {
        toast({
            title: "Access Denied",
            description: "You do not have permission to view this page.",
            variant: "destructive",
        });
        router.push('/');
        return;
    }


    if (!firestore) {
      setLoading(false);
      return;
    };

    const ordersCollection = collection(firestore, 'orders');
    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error: ", error);
      const permissionError = new FirestorePermissionError({
        path: 'orders',
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, isUserLoading, router, toast]);

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (!firestore) return;
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, updates);
      toast({
        title: 'Success',
        description: 'Order updated successfully.',
      });
    } catch (error: any) {
      console.error("Error updating order:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `orders/${orderId}`, operation: 'update', requestResourceData: updates }));
      toast({
        title: 'Error',
        description: 'Failed to update order. Check permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: 'Logout Failed',
        description: 'There was an issue logging out.',
        variant: 'destructive',
      });
    }
  }

  if (loading || isUserLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Admin Dashboard...</div>;
  }

  if (!user || user.email !== 'nafonstudios@gmail.com') {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>;
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
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
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
                <TableHead>Order Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Details</TableHead>
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
                  <TableCell>
                    {order.isCustomOrder ? (
                      <span className="font-semibold text-purple-600">Custom</span>
                    ) : (
                      <span className="font-semibold text-blue-600">Catalog</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value: 'Completed' | 'Not Completed') => handleUpdateOrder(order.id, { status: value })}>
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
                      onBlur={(e) => handleUpdateOrder(order.id, { assigned: e.target.value })}
                      placeholder="Assign to..."
                    />
                  </TableCell>
                  <TableCell>
                    <Input type="date" defaultValue={order.deadline} onBlur={(e) => handleUpdateOrder(order.id, { deadline: e.target.value })} />
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-headline">Order Details</DialogTitle>
                          <DialogDescription>
                            Full details for order #{order.id.substring(0, 7)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4 text-sm">
                            <p><strong>Deadline:</strong> {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Not set'}</p>
                          {order.isCustomOrder ? (
                            <>
                              <div className="font-semibold text-base">Custom Project: {order.projectTitle}</div>
                              <p><strong>Domain:</strong> {order.domain}</p>
                              <div>
                                <strong>Detailed Requirements:</strong>
                                <p className="p-2 mt-1 bg-slate-50 border rounded-md whitespace-pre-wrap">{order.detailedRequirements}</p>
                              </div>
                            </>
                          ) : (
                            <>
                                <div className="font-semibold text-base">Catalog Order</div>
                                <div className="space-y-2">
                                  {order.items?.map(item => (
                                      <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 border rounded-md">
                                          <span>{item.title}</span>
                                          <span className="font-bold">${item.price.toFixed(2)}</span>
                                      </div>
                                  ))}
                                </div>
                                <div className="text-right font-bold text-lg mt-4">Total: ${order.total?.toFixed(2)}</div>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
