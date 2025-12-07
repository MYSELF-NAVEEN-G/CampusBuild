
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, FlaskConical, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from '@/components/ui/label';

const adminUsers = {
    'nafonstudios@gmail.com': 'admin',
    'naveen.01@nafon.in': 'naveen',
    'john.04@nafon.in': 'johnlee',
};

export default function ScheduleMeetingPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { auth, firestore } = useFirebase();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [projectTopic, setProjectTopic] = useState('');
    const [password, setPassword] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState('');


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
            // This logic handles creating an admin user on their first login attempt
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                try {
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
    
    const handleConsultationSubmit = async () => {
        if (!firestore) {
            toast({ title: 'Error', description: 'Database service is not available.', variant: 'destructive' });
            return;
        }
        
        setIsSubmitting(true);

        const consultationData = {
            customerName: fullName,
            customerEmail: email,
            projectTopic: projectTopic,
            preferredTime,
            assignedTo: 'Not Assigned',
            createdAt: serverTimestamp(),
            fee: 100, // Add fee
            paymentInfo, // Add payment info
        };

        try {
            const consultationsCollectionRef = collection(firestore, 'consultations');
            await addDoc(consultationsCollectionRef, consultationData);

            toast({
                title: 'Consultation Booked!',
                description: "We've received your request and payment. We'll contact you shortly to confirm the meeting time.",
            });
            
            // Reset form
            setFullName('');
            setEmail('');
            setProjectTopic('');
            setPreferredTime('');
            setPaymentInfo('');

        } catch (error) {
            console.error("Error submitting consultation:", error);
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'consultations',
                operation: 'create',
                requestResourceData: consultationData,
            }));
            toast({
                title: "Submission Error",
                description: "Could not save your request. Please check your permissions or try again later.",
                variant: "destructive",
            });
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
            await handleConsultationSubmit();
        }
    };

    const lowerCaseEmail = email.toLowerCase();
    const lowerCaseFullName = fullName.toLowerCase();
    const isAdminField = (adminUsers as Record<string, string>)[lowerCaseEmail] === lowerCaseFullName;

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link href="/" className="flex items-center cursor-pointer group">
                            <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <FlaskConical className="text-accent" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-headline">CampusBuild</h1>
                                <p className="text-xs text-primary font-code font-medium tracking-widest uppercase">Solution</p>
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
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-headline">Book a Consultation</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Book a 1-hour one-on-one session with our R&D team to discuss your project in detail. The fee for this consultation is ₹100.
                        </p>
                    </div>
                    <Card className="p-6 sm:p-8 shadow-xl">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div>
                                <Label className="text-xs font-medium text-slate-600" htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" placeholder="Your Name" required type="text" className="mt-1" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-slate-600" htmlFor="email">Email</Label>
                                <Input id="email" name="email" placeholder="email@university.edu" required type="email" className="mt-1" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                             {isAdminField ? (
                              <div>
                                <Label className="text-xs font-medium text-slate-600" htmlFor="password">Admin Password</Label>
                                <Input id="password" name="password" required type="password" placeholder="Enter admin password" className="mt-1" value={password} onChange={e => setPassword(e.target.value)} />
                              </div>
                            ) : (
                                <>
                                    <div>
                                        <Label className="text-xs font-medium text-slate-600" htmlFor="projectTopic">Project Topic</Label>
                                        <Input id="projectTopic" name="projectTopic" placeholder="e.g., IoT, AI in healthcare" required type="text" className="mt-1" value={projectTopic} onChange={e => setProjectTopic(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-slate-600" htmlFor="preferredTime">Preferred Google Meet Time</Label>
                                        <Input id="preferredTime" name="preferredTime" required type="text" placeholder="e.g., Tomorrow at 2 PM" className="mt-1" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <Label className="text-xs font-medium text-slate-600" htmlFor="payment">Payment Details (₹100)</Label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input 
                                                id="payment" 
                                                name="payment" 
                                                placeholder="Card Number or UPI ID (mock field)" 
                                                required 
                                                type="text" 
                                                className="pl-9"
                                                value={paymentInfo}
                                                onChange={e => setPaymentInfo(e.target.value)} 
                                            />
                                        </div>
                                         <p className="text-xs text-slate-500 pt-1">This is a mock payment field for demonstration purposes.</p>
                                    </div>
                                </>
                            )}
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Submitting...' : isAdminField ? 'Admin Login' : 'Book Now & Pay ₹100'}
                                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
}

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={`bg-white rounded-2xl border border-slate-200 ${className}`}
      {...props}
    />
);
