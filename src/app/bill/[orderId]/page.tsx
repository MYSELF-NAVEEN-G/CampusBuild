
'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

interface OrderItem {
  id: string;
  title: string;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items?: OrderItem[];
  total?: number;
  createdAt: Timestamp;
  projectTitle?: string;
  isCustomOrder?: boolean;
}

export default function BillPage() {
  const { firestore } = useFirebase();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const orderId = params.orderId as string;

  useEffect(() => {
    if (firestore && orderId) {
      const getOrder = async () => {
        const orderRef = doc(firestore, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
        }
        setLoading(false);
      };
      getOrder();
    } else {
        setLoading(false);
    }
  }, [firestore, orderId]);

  const handlePrint = () => {
      window.print();
  }

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white">
            <Skeleton className="h-16 w-1/3 mb-8" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-32 w-full mb-8" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20">Order not found.</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:bg-white">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 sm:p-12 print:shadow-none">
            <header className="flex justify-between items-start pb-8 border-b">
                <div>
                     <div className="flex items-center mb-4">
                        <div className="relative w-12 h-12 flex items-center justify-center mr-3 bg-transparent">
                        <Image src="https://image2url.com/images/1765805274483-f20c73c8-70c3-4417-bcd8-f5cc4667300e.png" alt="CampusBuild Logo" layout="fill" objectFit="contain" />
                        </div>
                        <div>
                            <h1 className="font-bold text-3xl font-headline text-slate-800 leading-none">CampusBuild</h1>
                            <p className="text-sm font-bold font-code tracking-widest text-accent">SOLUTION</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">campusbuildsolutions@gmail.com</p>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold text-slate-800 uppercase">Invoice</h2>
                    <p className="text-sm text-slate-500 mt-1">Order ID: #{order.id.substring(0, 7)}</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-8 my-8">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Bill To</h3>
                    <p className="font-semibold text-slate-700">{order.customerName}</p>
                    <p className="text-slate-600">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Date</h3>
                    <p className="font-semibold text-slate-700">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>
                </div>
            </section>

            <section>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-3 font-semibold uppercase text-xs text-slate-600">Description</th>
                            <th className="p-3 font-semibold uppercase text-xs text-slate-600 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.isCustomOrder ? (
                             <tr className="border-b">
                                <td className="p-3">{order.projectTitle || 'Custom Project'}</td>
                                <td className="p-3 text-right">₹{(order.total || 0).toFixed(2)}</td>
                            </tr>
                        ) : order.items?.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-3">{item.title}</td>
                                <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs">
                    <div className="flex justify-between items-center bg-slate-100 p-4 rounded-t-lg">
                        <span className="font-bold text-lg text-slate-800">Total</span>
                        <span className="font-bold text-lg text-slate-800">₹{(order.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </section>
            <footer className="text-center mt-12 pt-8 border-t text-sm text-slate-500">
                <p>Thank you for your business!</p>
                <p>For any queries regarding this invoice, please contact us at campusbuildsolutions@gmail.com.</p>
                <div className="mt-8 print:hidden">
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print or Save as PDF
                    </Button>
                </div>
            </footer>
        </div>
    </div>
  );
}

    

    