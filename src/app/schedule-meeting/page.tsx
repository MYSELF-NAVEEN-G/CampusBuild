
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, User, KeyRound } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

const adminPasswords: Record<string, string> = {
    'naveen.01@nafon.in': 'naveen0101',
    'john.04@nafon.in': 'johnlee2322',
    'karthick.02@nafon.in': 'karthick232223',
    'thamizh.03@nafon.in': 'thamizh232258',
    'jed.05@nafon.in': 'jed232211',
    'gershon.05@nafon.in': 'gershon232211',
    'laksh06@nafon.in': 'lekshmi232225',
};

const adminCredentials: Record<string, string> = {
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
    const { firestore, auth } = useFirebase();
    const router = useRouter();

    // UI State
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    // Consultation form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [projectTopic, setProjectTopic] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [isSubmittingConsultation, setIsSubmittingConsultation] = useState(false);
    
    // Admin login form state
    const [adminPassword, setAdminPassword] = useState('');
    const [isSubmittingAdminLogin, setIsSubmittingAdminLogin] = useState(false);
    
    // Check for admin credentials on input change
    useEffect(() => {
        const lowerCaseEmail = email.toLowerCase().trim();
        const lowerCaseFullName = fullName.toLowerCase().trim();
        
        // Check if the entered email is an admin email and the name matches
        const expectedName = adminCredentials[lowerCaseEmail]?.toLowerCase();
        if (expectedName && lowerCaseFullName === expectedName) {
            setShowAdminLogin(true);
        } else {
            setShowAdminLogin(false);
        }
    }, [fullName, email]);


    const handleConsultationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!firestore) {
            toast({ title: 'Error', description: 'Database service is not available.', variant: 'destructive' });
            return;
        }
        
        setIsSubmittingConsultation(true);

        const consultationData = {
            customerName: fullName,
            customerEmail: email,
            projectTopic: projectTopic,
            preferredTime,
            assignedTo: 'Not Assigned',
            createdAt: serverTimestamp(),
            meetingStatus: 'Pending',
            linkSentStatus: 'Not Sent'
        };

        try {
            const consultationsCollectionRef = collection(firestore, 'consultations');
            await addDoc(consultationsCollectionRef, consultationData);

            toast({
                title: 'Consultation Booked!',
                description: "We've received your request. We'll contact you shortly to confirm the meeting time.",
            });
            
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
            setIsSubmittingConsultation(false);
        }
    };
    
    const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!auth) {
            toast({ title: 'Error', description: 'Authentication service not available.', variant: 'destructive' });
            return;
        }

        setIsSubmittingAdminLogin(true);
        const lowerCaseEmail = email.toLowerCase().trim();
        
        try {
            // First, try to sign in with the password the user entered. This works for all existing users.
            await signInWithEmailAndPassword(auth, lowerCaseEmail, adminPassword);
            toast({
                title: 'Admin Login Successful',
                description: 'Redirecting to the admin dashboard.',
            });
            router.push('/admin');

        } catch (error: any) {
            // If sign-in fails because the user is not found, it's a first-time login for a new admin.
            if (error.code === 'auth/user-not-found') {
                const creationPassword = adminPasswords[lowerCaseEmail];
                const displayName = adminCredentials[lowerCaseEmail];

                if (creationPassword && displayName) {
                    try {
                        // Create the account using the special, one-time password.
                        const userCredential = await createUserWithEmailAndPassword(auth, lowerCaseEmail, creationPassword);
                        if (userCredential.user) {
                           await updateProfile(userCredential.user, { displayName: displayName });
                        }
                        
                        // CRITICAL: Immediately sign the user in with the same one-time password to establish a session.
                        await signInWithEmailAndPassword(auth, lowerCaseEmail, creationPassword);
                        
                        toast({
                            title: 'Admin Account Created & Logged In',
                            description: 'Welcome! Redirecting to the admin dashboard.',
                        });
                        router.push('/admin');

                    } catch (creationError: any) {
                        toast({ title: 'Account Creation Failed', description: creationError.message, variant: 'destructive'});
                    }
                } else {
                    // This happens if someone tries to log in with an unknown admin email.
                    toast({ title: 'Login Failed', description: 'This email is not registered as an administrator.', variant: 'destructive'});
                }
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                toast({ title: 'Login Failed', description: 'Invalid credentials. Please check your password.', variant: 'destructive' });
            } else if (error.code === 'auth/too-many-requests') {
                 toast({ title: 'Login Temporarily Blocked', description: 'Too many failed attempts. Please wait a few minutes before trying again.', variant: 'destructive' });
            } else {
                toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
            }
        } finally {
            setIsSubmittingAdminLogin(false);
        }
    };


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
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-headline">
                            {showAdminLogin ? 'Admin Portal' : 'Book a Consultation'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                           {showAdminLogin 
                            ? 'Enter your password to access the dashboard.'
                            : 'Schedule a one-hour session with our R&D team to discuss your project for just ₹100.'
                           }
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl">
                        
                        {showAdminLogin ? (
                             <form onSubmit={handleAdminLogin} className="space-y-6">
                                <div>
                                    <Label className="text-xs font-medium text-slate-600" htmlFor="email">Admin Email</Label>
                                    <Input id="email" name="email" required type="email" className="mt-1" value={email} readOnly disabled />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-600" htmlFor="admin-password">Password</Label>
                                    <Input 
                                        id="admin-password" 
                                        name="admin-password" 
                                        required 
                                        type="password" 
                                        className="mt-1" 
                                        value={adminPassword} 
                                        onChange={e => setAdminPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        autoFocus
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmittingAdminLogin} className="w-full">
                                    {isSubmittingAdminLogin ? 'Signing In...' : 'Sign In'}
                                    {!isSubmittingAdminLogin && <KeyRound className="ml-2 h-4 w-4" />}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleConsultationSubmit} className="space-y-6">
                                <div>
                                    <Label className="text-xs font-medium text-slate-600" htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" name="fullName" placeholder="Your Name" required type="text" className="mt-1" value={fullName} onChange={e => setFullName(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-600" htmlFor="email">Email</Label>
                                    <Input id="email" name="email" placeholder="email@university.edu" required type="email" className="mt-1" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-600" htmlFor="projectTopic">Project Topic</Label>
                                    <Input id="projectTopic" name="projectTopic" placeholder="e.g., IoT, AI in healthcare" required type="text" className="mt-1" value={projectTopic} onChange={e => setProjectTopic(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-600" htmlFor="preferredTime">Preferred Google Meet Time</Label>
                                    <Input id="preferredTime" name="preferredTime" required type="text" placeholder="e.g., Tomorrow at 2 PM" className="mt-1" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
                                </div>
                                <Button type="submit" disabled={isSubmittingConsultation} className="w-full">
                                    {isSubmittingConsultation ? 'Submitting...' : 'Book'}
                                    {!isSubmittingConsultation && <Send className="ml-2 h-4 w-4" />}
                                </Button>
                            </form>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

    

    