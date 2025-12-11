
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from '@/components/ui/label';

const adminUsers: Record<string, string> = {
    'nafonstudios@gmail.com': 'admin',
    'naveen.01@nafon.in': 'naveen',
    'john.04@nafon.in': 'johnlee',
    'karthick.02@nafon.in': 'karthick',
    'thamizh.03@nafon.in': 'thamizh',
    'jed.05@nafon.in': 'jed',
    'gershon.05@nafon.in': 'gershon',
    'laksh06@nafon.in': 'lekshmi',
};

const adminDisplayNames: Record<string, string> = {
    'nafonstudios@gmail.com': 'Admin',
    'naveen.01@nafon.in': 'NAVEEN',
    'john.04@nafon.in': 'John Lee',
    'karthick.02@nafon.in': 'Karthick',
    'thamizh.03@nafon.in': 'Thamizh',
    'jed.05@nafon.in': 'JED',
    'gershon.05@nafon.in': 'Gershon',
    'laksh06@nafon.in': 'Lekshmi',
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


    const handleAdminLogin = async () => {
        if (!auth) {
            toast({ title: 'Error', description: 'Authentication service is not available.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        const lowerCaseEmail = email.toLowerCase();
        
        // Special passwords provided for one-time creation
        const adminPasswords: Record<string, string> = {
            'karthick.02@nafon.in': 'karthick232223',
            'thamizh.03@nafon.in': 'thamizh232258',
            'jed.05@nafon.in': 'jed232211',
            'gershon.05@nafon.in': 'gershon232211',
            'laksh06@nafon.in': 'lekshmi232225',
        };
        const creationPassword = adminPasswords[lowerCaseEmail];
        const adminName = adminDisplayNames[lowerCaseEmail] || adminUsers[lowerCaseEmail];

        try {
            // First, just try to sign in with the user-provided password.
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Admin Login Successful',
                description: 'Redirecting to the admin dashboard.',
            });
            router.push('/admin');
        } catch (error: any) {
            // If sign-in fails because the user doesn't exist, and it's a designated admin with a creation password,
            // we attempt to create the account with the predefined password.
            if (error.code === 'auth/user-not-found' && creationPassword) {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, creationPassword);
                    if (userCredential.user) {
                        await updateProfile(userCredential.user, { displayName: adminName });
                    }
                    // After creating, sign them in to establish the session.
                    await signInWithEmailAndPassword(auth, email, creationPassword);
                    toast({
                        title: 'Admin Account Created',
                        description: 'Login successful. Redirecting to the admin dashboard.',
                    });
                    router.push('/admin');
                } catch (creationError: any) {
                    // This will catch errors during creation itself, like 'email-already-in-use'.
                    // This can happen if the user was created but the first sign-in attempt failed.
                    // We'll try to sign in with the creation password just in case.
                    if (creationError.code === 'auth/email-already-exists') {
                         try {
                            await signInWithEmailAndPassword(auth, email, creationPassword);
                            toast({
                                title: 'Admin Login Successful',
                                description: 'Redirecting to the admin dashboard.',
                            });
                            router.push('/admin');
                         } catch (finalSignInError) {
                             console.error("Final sign-in attempt failed:", finalSignInError);
                             toast({ title: 'Login Failed', description: 'Your account exists, but the password was incorrect.', variant: 'destructive'});
                         }
                    } else {
                        console.error("Admin account creation failed:", creationError);
                        toast({
                            title: 'Admin Creation Failed',
                            description: creationError.message || 'Could not create the admin account.',
                            variant: 'destructive',
                        });
                    }
                }
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                // This handles the case where the user exists but the password is wrong.
                 toast({
                    title: 'Admin Login Failed',
                    description: 'Invalid credentials. Please check your password.',
                    variant: 'destructive',
                });
            }
            else {
                // Catch-all for other login errors.
                console.error("Admin login failed:", error);
                toast({
                    title: 'Admin Login Failed',
                    description: error.message || 'An unknown error occurred.',
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
        };

        try {
            const consultationsCollectionRef = collection(firestore, 'consultations');
            await addDoc(consultationsCollectionRef, consultationData);

            toast({
                title: 'Consultation Booked!',
                description: "We've received your request. We'll contact you shortly to confirm the meeting time.",
            });
            
            // Reset form
            setFullName('');
            setEmail('');
            setProjectTopic('');
            setPreferredTime('');

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
        
        // Use a case-insensitive check for admin login
        const isAdminLogin = Object.keys(adminUsers).some(
            adminEmail => adminEmail.toLowerCase() === lowerCaseEmail && adminUsers[adminEmail].toLowerCase() === fullName.toLowerCase()
        );

        if (isAdminLogin) {
            await handleAdminLogin();
        } else {
            await handleConsultationSubmit();
        }
    };

    const lowerCaseEmail = email.toLowerCase();
    const isAdminField = Object.keys(adminUsers).some(
        adminEmail => adminEmail.toLowerCase() === lowerCaseEmail && adminUsers[adminEmail].toLowerCase() === fullName.toLowerCase()
    );

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link href="/" className="flex items-center cursor-pointer group">
                            <div className="relative w-10 h-10 flex items-center justify-center mr-3">
                                <Image src="https://image2url.com/images/1765187580651-fb73fec6-2402-4429-bd8f-dff67a1e4edc.png" alt="CampusBuild Logo" layout="fill" objectFit="contain" />
                            </div>
                             <div>
                                <span className="font-bold text-xl font-headline text-slate-800 leading-none">CampusBuild</span>
                                <p className="text-xs font-bold font-code tracking-widest text-accent -mt-1">SOLUTION</p>
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
                           Schedule a one-hour session with our R&D team to discuss your project for just ₹100.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl">
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
                                </>
                            )}
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'Submitting...' : isAdminField ? 'Admin Login' : 'Book'}
                                {!isSubmitting && !isAdminField && <Send className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

    

    