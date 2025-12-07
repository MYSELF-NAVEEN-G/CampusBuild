
'use client';

import { ArrowLeft, FlaskConical, LogOut, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useFirebase, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const adminEmails = [
  'nafonstudios@gmail.com',
  'naveen.01@nafon.in',
  'john.04@nafon.in',
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

  const isSuperAdmin = user?.email === 'naveen.01@nafon.in';

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

  const navItems = [
    { href: '/admin', label: 'Order Management', icon: Briefcase, visible: true },
    { href: '/admin/projects', label: 'Project Management', icon: Users, visible: isSuperAdmin },
    { href: '/admin/employees', label: 'Employee Management', icon: Users, visible: isSuperAdmin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="flex items-center h-20 px-6 border-b">
          <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
              <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <FlaskConical className="text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-headline">
                  NAFON
                </h1>
                <p className="text-xs text-primary font-code font-medium tracking-widest uppercase">
                  Admin
                </p>
              </div>
            </div>
        </div>
        <nav className="flex-1 p-4">
            <ul className="space-y-2">
                {navItems.filter(item => item.visible).map(item => (
                    <li key={item.href}>
                        <Link href={item.href} className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-slate-600 hover:bg-slate-100"
                            )}>
                            
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
        <div className="p-4 border-t">
          <Button asChild variant="outline" className="w-full justify-start mb-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b h-20 flex items-center px-6">
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800">
                    {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                </h1>
            </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
