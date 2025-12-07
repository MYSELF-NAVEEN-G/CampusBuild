'use client';

import {
  ArrowLeft,
  FlaskConical,
  LogOut,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useFirebase, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const adminEmails = [
  'nafonstudios@gmail.com',
  'naveen.contactme1@gmail.com',
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && (!user || !adminEmails.includes(user.email!))) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user, isUserLoading, router, toast]);

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
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an issue logging out.',
        variant: 'destructive',
      });
    }
  };

  if (isUserLoading || !user || !adminEmails.includes(user.email!)) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Admin Dashboard...
      </div>
    );
  }

  const isSuperAdmin = user.email === 'naveen.contactme1@gmail.com';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center cursor-pointer group">
              <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <FlaskConical className="text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-headline">
                  NAFON
                </h1>
                <p className="text-xs text-primary font-code font-medium tracking-widest uppercase">
                  Admin Dashboard
                </p>
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
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 p-4">
          <nav className="flex flex-col gap-2">
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900',
                pathname === '/admin' && 'bg-slate-200 font-semibold'
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              Order Management
            </Link>
            {isSuperAdmin && (
              <>
                <Link
                  href="/admin/projects"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900',
                    pathname === '/admin/projects' &&
                      'bg-slate-200 font-semibold'
                  )}
                >
                  <Package className="h-4 w-4" />
                  Project Management
                </Link>
                <Link
                  href="/admin/employees"
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900',
                    pathname === '/admin/employees' &&
                      'bg-slate-200 font-semibold'
                  )}
                >
                  <Users className="h-4 w-4" />
                  Employee Management
                </Link>
              </>
            )}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
