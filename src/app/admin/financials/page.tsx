
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, PackageCheck, Wrench, Users, LineChart, HandCoins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Order {
  id: string;
  customerName: string;
  total?: number;
  componentCost?: number;
  handlerFee?: number;
  createdAt: Timestamp;
  status: 'Completed' | 'Not Completed';
  assigned: string;
  paymentStatus: 'Paid' | 'Unpaid';
  handlerFeeStatus?: 'Sent' | 'Not Sent';
}

interface Employee {
    id: string;
    name: string;
    salary?: number;
}

export default function FinancialManagementPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userEmail = user?.email || '';
  const canManageFinancials = userEmail === 'naveen.01@nafon.in' || userEmail === 'lux05@nafon.in';

  useEffect(() => {
    if (!isUserLoading && !canManageFinancials) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view this page.',
        variant: 'destructive',
      });
      router.replace('/admin');
    }
  }, [user, isUserLoading, router, toast, canManageFinancials]);

  useEffect(() => {
    if (!firestore || !canManageFinancials) {
      setLoading(false);
      return;
    }

    const ordersCollection = collection(firestore, 'orders');
    const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
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

    const employeesCollection = collection(firestore, 'employees');
    const unsubscribeEmployees = onSnapshot(employeesCollection, (snapshot) => {
        const fetchedEmployees = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Employee));
        setEmployees(fetchedEmployees);
    }, (error) => {
        console.error("Error fetching employees:", error);
        toast({ title: 'Error', description: 'Could not fetch employee salary data.', variant: 'destructive'});
    });

    return () => {
        unsubscribeOrders();
        unsubscribeEmployees();
    };
  }, [firestore, toast, canManageFinancials]);

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    if (!firestore || !canManageFinancials) return;
    const orderRef = doc(firestore, 'orders', orderId);
    try {
      await updateDoc(orderRef, updates);
      toast({ title: 'Success', description: 'Order status updated.' });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ title: 'Error', description: 'Failed to update order.', variant: 'destructive' });
    }
  };

  const completedOrders = orders.filter(order => order.status === 'Completed');
  const paidAndCompletedOrders = completedOrders.filter(order => order.paymentStatus === 'Paid');

  const totalRevenue = paidAndCompletedOrders.reduce((acc, order) => acc + (order.total || 0), 0);
  const totalComponentCost = paidAndCompletedOrders.reduce((acc, order) => acc + (order.componentCost || 0), 0);
  const totalHandlerFees = paidAndCompletedOrders
    .filter(order => order.handlerFeeStatus === 'Sent')
    .reduce((acc, order) => acc + (order.handlerFee ?? 300), 0);
  const totalSalaryCost = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
  const netProfit = totalRevenue - totalComponentCost - totalSalaryCost - totalHandlerFees;

  if (isUserLoading || loading) {
    return <div>Loading Financial Data...</div>;
  }

  if (!canManageFinancials) {
    return <div>Redirecting...</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 font-headline">Financial Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {paidAndCompletedOrders.length} paid orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Component Costs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalComponentCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For paid orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalHandlerFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Sent for paid orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Payouts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSalaryCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">For {employees.length} employees</p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <LineChart className="h-4 w-4 text-primary-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netProfit.toFixed(2)}</div>
            <p className="text-xs text-primary-foreground/70">Revenue - All Costs</p>
          </CardContent>
        </Card>
      </div>

       <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 font-headline">Employee Salaries</h2>
        <div className="bg-white rounded-lg shadow-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead className="text-right">Monthly Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell className="text-right">₹{(emp.salary || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 font-headline">Completed Orders Log</h2>
      <div className="bg-white rounded-lg shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Handled By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Handler Fee Status</TableHead>
              <TableHead className="text-right">Sale Amount</TableHead>
              <TableHead className="text-right">Component Cost</TableHead>
              <TableHead className="text-right">Handler Fee</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map((order) => {
              const handlerFee = order.handlerFee ?? 300;
              const calculatedProfit = (order.total || 0) - (order.componentCost || 0) - handlerFee;
              const profit = order.paymentStatus === 'Paid' ? calculatedProfit : 0;
              return (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.assigned || 'Not Assigned'}</TableCell>
                <TableCell>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select
                    value={order.paymentStatus || 'Unpaid'}
                    onValueChange={(value: 'Paid' | 'Unpaid') => handleUpdateOrder(order.id, { paymentStatus: value })}
                    disabled={!canManageFinancials}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                   <Select
                    value={order.handlerFeeStatus || 'Not Sent'}
                    onValueChange={(value: 'Sent' | 'Not Sent') => handleUpdateOrder(order.id, { handlerFeeStatus: value })}
                    disabled={!canManageFinancials}
                  >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Not Sent">Not Sent</SelectItem>
                      </SelectContent>
                    </Select>
                </TableCell>
                <TableCell className="text-right">
                    <Input
                        type="number"
                        defaultValue={order.total}
                        onBlur={(e) => handleUpdateOrder(order.id, { total: parseFloat(e.target.value) || 0 })}
                        className="w-32 ml-auto"
                        placeholder="Sale Amount"
                        disabled={!canManageFinancials}
                    />
                </TableCell>
                <TableCell className="text-right">
                    <Input
                        type="number"
                        defaultValue={order.componentCost}
                        onBlur={(e) => handleUpdateOrder(order.id, { componentCost: parseFloat(e.target.value) || 0 })}
                        className="w-32 ml-auto"
                        placeholder="Component Cost"
                        disabled={!canManageFinancials}
                    />
                </TableCell>
                <TableCell className="text-right">
                    <Select
                        value={String(order.handlerFee ?? 300)}
                        onValueChange={(value) => handleUpdateOrder(order.id, { handlerFee: parseInt(value, 10) })}
                        disabled={!canManageFinancials}
                    >
                        <SelectTrigger className="w-32 ml-auto">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="300">₹300</SelectItem>
                            <SelectItem value="500">₹500</SelectItem>
                            <SelectItem value="600">₹600</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>
                <TableCell className={`text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{profit.toFixed(2)}</TableCell>
              </TableRow>
            )})}
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
