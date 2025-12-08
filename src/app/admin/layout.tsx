
'use client';

import { ArrowLeft, LogOut, Briefcase, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
  'karthick.02@nafon.in',
  'thamizh.03@nafon.in',
  'jed.05@nafon.in',
];

const adminDisplayNames: Record<string, string> = {
    'nafonstudios@gmail.com': 'Admin',
    'naveen.01@nafon.in': 'Naveen Kumar',
    'john.04@nafon.in': 'John Lee',
    'karthick.02@nafon.in': 'Karthick',
    'thamizh.03@nafon.in': 'Thamizh',
    'jed.05@nafon.in': 'JED',
};


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
  const canManageProjects = user?.email === 'naveen.01@nafon.in' || user?.email === 'karthick.02@nafon.in' || user?.email === 'jed.05@nafon.in';
  const canManageEmployees = user?.email === 'naveen.01@nafon.in' || user?.email === 'john.04@nafon.in';
  const canManageOrders = user?.email === 'naveen.01@nafon.in' || user?.email === 'john.04@nafon.in';
  const isAdmin = user?.email && adminEmails.includes(user.email);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user, isUserLoading, router, toast, isAdmin]);

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

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Admin Dashboard...
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Order Management', icon: Briefcase, visible: canManageOrders },
    { href: '/admin/consultations', label: 'Consultation Management', icon: MessageSquare, visible: true },
    { href: '/admin/team', label: 'Our Team', icon: Users, visible: true },
    { href: '/admin/projects', label: 'Project Management', icon: Users, visible: canManageProjects },
    { href: '/admin/employees', label: 'Employee Management', icon: Users, visible: canManageEmployees },
  ];

  const currentPageLabel = navItems.find(item => item.href === pathname)?.label || 'Dashboard';
  const getDisplayName = () => {
    if (!user || !user.email) return 'Admin';
    if (user.displayName) return user.displayName;
    return adminDisplayNames[user.email] || 'Admin';
  }
  const headerTitle = getDisplayName();
  const brandingSubtitle = isSuperAdmin ? 'CEO' : 'Admin';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="flex items-center h-20 px-6 border-b">
          <div className="flex items-center cursor-pointer group" onClick={() => router.push('/')}>
              <div className="relative w-10 h-10 flex items-center justify-center mr-3">
                <Image src="https://image2url.com/images/1765187580651-fb73fec6-2402-4429-bd8f-dff67a1e4edc.png" alt="CampusBuild Logo" layout="fill" objectFit="contain" />
              </div>
               <div>
                    <span className="font-bold text-xl font-headline text-slate-800 leading-none">CampusBuild</span>
                    <p className="text-xs font-bold font-code tracking-widest text-accent -mt-1">{brandingSubtitle}</p>
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
                    {headerTitle}
                </h1>
                <p className="text-sm text-slate-500">{currentPageLabel}</p>
            </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
