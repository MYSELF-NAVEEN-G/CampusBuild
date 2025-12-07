'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

interface Employee {
  id: string;
  name: string;
  age: number;
  position: string;
  specialization: string;
}

export default function OurTeamPage() {
  const { firestore } = useFirebase();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    const employeesCollection = collection(firestore, 'employees');
    const unsubscribe = onSnapshot(
      employeesCollection,
      (snapshot) => {
        const fetchedEmployees = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Employee)
        );
        setEmployees(fetchedEmployees);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch team data. Please try again later.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast]);

  return (
    <>
      <Header />
      <main className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-xs font-code">Our Experts</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 font-headline">Meet the Team</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl mx-auto">
              We are a team of passionate engineers, designers, and thinkers dedicated to bringing innovative ideas to life.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {employees.map((employee, index) => (
                <Card
                  key={employee.id}
                  className="text-center bg-white hover:shadow-xl transition-shadow duration-300"
                  style={{ animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`, opacity: 0 }}
                >
                  <CardHeader className="items-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Users className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">{employee.name}</CardTitle>
                    <p className="text-sm text-primary font-medium">{employee.position}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{employee.specialization}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
