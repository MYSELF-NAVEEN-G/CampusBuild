
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Eye, Trash2, Printer } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';


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
  deliveryAddress?: string;
  items?: OrderItem[]; // For catalog orders
  total?: number;
  componentCost?: number;
  handlerFee?: number;
  createdAt: Timestamp;
  status: 'Completed' | 'Not Completed';
  deliveryStatus: 'Delivered' | 'Not Delivered';
  paymentStatus: 'Paid' | 'Unpaid';
  handlerFeeStatus?: 'Sent' | 'Not Sent';
  assigned: string;
  deadline: string;
  // Fields for custom orders
  projectTitle?: string;
  domain?: string;
  detailedRequirements?: string;
  isCustomOrder?: boolean;
}

interface Employee {
  id: string;
  name: string;
}

export default function AdminOrderPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userEmail = user?.email || '';
  const isSuperAdmin = userEmail === 'naveen.01@nafon.in';
  const canManageOrders = isSuperAdmin || ['john.04@nafon.in', 'jed.05@nafon.in', 'karthick.02@nafon.in', 'gershon.05@nafon.in', 'lekshmi.06@nafon.in'].includes(userEmail);
  const canManageDelivery = isSuperAdmin;
  const canManageCosts = isSuperAdmin || ['karthick.02@nafon.in', 'jed.05@nafon.in'].includes(userEmail);
  const canManagePayment = isSuperAdmin;

  // Security check: Redirect if the user doesn't have permission.
  useEffect(() => {
    if (!isUserLoading && !canManageOrders) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      router.replace('/admin/projects'); 
    }
  }, [user, isUserLoading, router, toast, canManageOrders]);


  useEffect(() => {
    if (!firestore || !canManageOrders) {
      setLoading(false);
      return;
    };

    const ordersCollection = collection(firestore, 'orders');
    const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
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

    let unsubscribeEmployees = () => {};
    if (isSuperAdmin) {
        const employeesCollection = collection(firestore, 'employees');
        unsubscribeEmployees = onSnapshot(employeesCollection, (snapshot) => {
            const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }) as Employee[]);
            setEmployees(fetchedEmployees);
        }, (error) => {
            console.error("Error fetching employees for order assignment:", error);
            toast({ title: "Employee Fetch Error", description: "Could not fetch employee list for assignment.", variant: 'destructive' });
        });
    }

    return () => {
        unsubscribeOrders();
        unsubscribeEmployees();
    };
  }, [firestore, isSuperAdmin, toast, canManageOrders]);

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    updateDoc(orderRef, updates)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Order updated successfully.',
        });
      })
      .catch((error: any) => {
        console.error("Error updating order:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `orders/${orderId}`, operation: 'update', requestResourceData: updates }));
        toast({
          title: 'Error',
          description: 'Failed to update order. Check permissions.',
          variant: 'destructive',
        });
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    deleteDoc(orderRef)
     .then(() => {
        toast({
          title: 'Order Deleted',
          description: 'The order has been permanently removed.',
        });
      })
     .catch((error: any) => {
        console.error("Error deleting order:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `orders/${orderId}`, operation: 'delete' }));
        toast({
          title: 'Error',
          description: 'Failed to delete order. Check permissions.',
          variant: 'destructive',
        });
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    // Adding T00:00:00 ensures the date isn't affected by timezone shifts during parsing
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isUserLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading Orders...</div>;
  }
  
  if (!canManageOrders) {
    return <div className="flex justify-center items-center h-screen">Redirecting...</div>
  }
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 font-headline">Order Management</h1>
      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Order Type</TableHead>
              <TableHead>Component Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Handler Fee Status</TableHead>
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
                <TableCell>
                    {canManageCosts ? (
                        <Input
                            type="number"
                            placeholder="Cost"
                            className="w-24"
                            defaultValue={order.componentCost}
                            onBlur={(e) => handleUpdateOrder(order.id, { componentCost: parseFloat(e.target.value) || 0 })}
                        />
                    ) : (
                       <span>₹{order.componentCost?.toFixed(2) || 'N/A'}</span>
                    )}
                </TableCell>
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
                  <Select
                    value={order.deliveryStatus}
                    onValueChange={(value: 'Delivered' | 'Not Delivered') => handleUpdateOrder(order.id, { deliveryStatus: value })}
                    disabled={!canManageDelivery}
                  >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Not Delivered">Not Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={order.paymentStatus === 'Paid' ? 'default' : 'destructive'}>
                    {order.paymentStatus || 'Unpaid'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={order.handlerFeeStatus === 'Sent' ? 'secondary' : 'outline'}>
                    {order.handlerFeeStatus || 'Not Sent'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isSuperAdmin ? (
                    <Select
                        value={order.assigned}
                        onValueChange={(value) => handleUpdateOrder(order.id, { assigned: value })}
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
                    <span>{order.assigned || 'Not Assigned'}</span>
                  )}
                </TableCell>
                <TableCell>
                  {isSuperAdmin ? (
                    <Input
                      type="date"
                      defaultValue={order.deadline}
                      onBlur={(e) => handleUpdateOrder(order.id, { deadline: e.target.value })}
                      className="w-[150px]"
                    />
                  ) : (
                     formatDate(order.deadline)
                  )}
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
                          <p><strong>Deadline:</strong> {formatDate(order.deadline)}</p>
                          <p><strong>Assigned To:</strong> {order.assigned || 'Not Assigned'}</p>
                          <div>
                            <strong>Delivery Address:</strong>
                            <p className="p-2 mt-1 bg-slate-50 border rounded-md whitespace-pre-wrap">{order.deliveryAddress || 'Not Provided'}</p>
                          </div>
                        {order.isCustomOrder ? (
                          <>
                            <div className="font-semibold text-base">Custom Project: {order.projectTitle}</div>
                            <p><strong>Domain:</strong> {order.domain}</p>
                            <div>
                              <strong>Detailed Requirements:</strong>
                              <Textarea readOnly value={order.detailedRequirements} className="p-2 mt-1 bg-slate-50 border rounded-md whitespace-pre-wrap h-32" />
                            </div>
                          </>
                        ) : (
                          <>
                              <div className="font-semibold text-base">Catalog Order</div>
                              <div className="space-y-2">
                                {order.items?.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 border rounded-md">
                                        <span>{item.title}</span>
                                        <span className="font-bold">₹{item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                              </div>
                              <div className="mt-4 space-y-1 border-t pt-2">
                                  <div className="text-right font-bold text-lg mt-2">Total: ₹{order.total?.toFixed(2)}</div>
                              </div>
                          </>
                        )}
                         <div className="space-y-4 pt-4 border-t">
                            {canManageCosts && (
                                <div className="space-y-2">
                                    <Label htmlFor={`componentCost-${order.id}-dialog`} className="font-semibold">Component Cost</Label>
                                    <Input
                                        id={`componentCost-${order.id}-dialog`}
                                        type="number"
                                        placeholder="Enter component cost"
                                        defaultValue={order.componentCost}
                                        onBlur={(e) => handleUpdateOrder(order.id, { componentCost: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            )}
                            {isSuperAdmin && (
                                <div className="space-y-2">
                                    <Label className="font-semibold">Handler Fee</Label>
                                    <Select
                                        value={String(order.handlerFee ?? 100)}
                                        onValueChange={(value) => handleUpdateOrder(order.id, { handlerFee: parseInt(value, 10) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="100">₹100</SelectItem>
                                            <SelectItem value="200">₹200</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                      </div>
                      <DialogFooter className="mt-6 pt-4 border-t sm:justify-between items-center gap-2">
                            <div className="flex gap-2">
                                <Button asChild variant="secondary">
                                    <Link href={`/bill/${order.id}`} target="_blank">
                                        <Printer className="mr-2 h-4 w-4" />
                                        Generate Bill
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={!isSuperAdmin}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the
                                            order and remove its data from our servers.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                            Continue
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
