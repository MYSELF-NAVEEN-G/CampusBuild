
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitContactForm, type ContactFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const adminUsers = {
    'nafonstudios@gmail.com': 'admin',
    'naveen.contactme1@gmail.com': 'naveen',
    'john.04@nafon.in': 'johnlee',
};

export default function ScheduleMeetingPage() {
    const initialState: ContactFormState = { message: "", success: false };
    const [state, dispatch] = useActionState(submitContactForm, initialState);
    const { toast } = useToast();
    const router = useRouter();
    const { auth } = useFirebase();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (state.message && !state.success) { // Only show errors for contact form
            toast({
                title: "Error",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, toast]);

    const handleAdminLogin = async () => {
        if (!auth) {
            toast({ title: 'Error', description: 'Authentication service is not available.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Admin Login Successful',
                description: 'Redirecting to the admin dashboard.',
            });
            router.push('/admin');
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                try {
                    // Create user only if they are in the admin list
                    if ((adminUsers as Record<string, string>)[email.toLowerCase()]) {
                        await createUserWithEmailAndPassword(auth, email, password);
                        toast({
                            title: 'Admin Account Created',
                            description: 'Login successful. Redirecting to the admin dashboard.',
                        });
                        router.push('/admin');
                    } else {
                         toast({
                            title: 'Admin Login Failed',
                            description: 'Please check your credentials.',
                            variant: 'destructive',
                        });
                    }
                } catch (creationError: any) {
                    console.error("Admin account creation failed:", creationError);
                    toast({
                        title: 'Admin Creation Failed',
                        description: creationError.message || 'Could not create the admin account.',
                        variant: 'destructive',
                    });
                }
            } else {
                console.error("Admin login failed:", error);
                toast({
                    title: 'Admin Login Failed',
                    description: error.message || 'Please check your credentials.',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const lowerCaseEmail = email.toLowerCase();
        const lowerCaseFullName = fullName.toLowerCase();

        const isAdminLogin = (adminUsers as Record<string, string>)[lowerCaseEmail] === lowerCaseFullName;

        if (isAdminLogin) {
            await handleAdminLogin();
        } else {
            setIsSubmitting(true);
            const formData = new FormData(event.currentTarget);
            dispatch(formData);
            setIsSubmitting(false);
        }
    };

    const lowerCaseEmail = email.toLowerCase();
    const lowerCaseFullName = fullName.toLowerCase();
    const isAdminField = (adminUsers as Record<string, string>)[lowerCaseEmail] === lowerCaseFullName;

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link href="/" className="flex items-center cursor-pointer group">
                            <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <FlaskConical className="text-accent" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-headline">NAFON</h1>
                                <p className="text-xs text-primary font-code font-medium tracking-widest uppercase">Project Hub</p>
                            </div>
                        </Link>
                        <Button asChild variant="outline">
                            <Link href="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-80px)]">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-headline">Schedule a Consultation</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Have questions or a custom idea? Schedule a free consultation with our R&D team to discuss your project in detail.
                        </p>
                    </div>
                    <Card className="p-8 shadow-xl">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-medium text-slate-600" htmlFor="fullName">Full Name</label>
                                <Input id="fullName" name="fullName" placeholder="Your Name" required type="text" className="mt-1" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600" htmlFor="email">Email</label>
                                <Input id="email" name="email" placeholder="email@university.edu" required type="email" className="mt-1" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                             {isAdminField && (
                              <div>
                                <label className="text-xs font-medium text-slate-600" htmlFor="password">Admin Password</label>
                                <Input id="password" name="password" required type="password" placeholder="Enter admin password" className="mt-1" value={password} onChange={e => setPassword(e.target.value)} />
                              </div>
                            )}
                            {!isAdminField && (
                                <div>
                                    <label className="text-xs font-medium text-slate-600" htmlFor="preferredTime">Preferred Google Meet Time</label>
                                    <Input id="preferredTime" name="preferredTime" required type="text" placeholder="e.g., Tomorrow at 2 PM" className="mt-1"/>
                                </div>
                            )}
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Submitting...' : isAdminField ? 'Admin Login' : 'Submit Request'}
                                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    </Card>
                </div>
            </main>
        </>
    );
}

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={`bg-white rounded-2xl border border-slate-200 ${className}`}
      {...props}
    />
);
