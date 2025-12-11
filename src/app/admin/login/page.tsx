
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useFirebase } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const adminPasswords: Record<string, string> = {
    'naveen.01@nafon.in': 'naveen0101',
    'john.04@nafon.in': 'johnlee2322',
    'karthick.02@nafon.in': 'karthick232223',
    'thamizh.03@nafon.in': 'thamizh232258',
    'jed.05@nafon.in': 'jed232211',
    'gershon.05@nafon.in': 'gershon232211',
    'laksh06@nafon.in': 'lekshmi232225',
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

export default function AdminLoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { auth } = useFirebase();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!auth) {
            toast({ title: 'Error', description: 'Authentication service not available.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        const lowerCaseEmail = email.toLowerCase();
        
        try {
            // Attempt to sign in with the provided credentials.
            await signInWithEmailAndPassword(auth, lowerCaseEmail, password);
            toast({
                title: 'Login Successful',
                description: 'Redirecting to the admin dashboard.',
            });
            router.push('/admin');
        } catch (error: any) {
            // If sign-in fails because the user doesn't exist, it might be a new admin's first login.
            if (error.code === 'auth/user-not-found') {
                const creationPassword = adminPasswords[lowerCaseEmail];
                const displayName = adminDisplayNames[lowerCaseEmail];

                if (creationPassword && displayName) {
                    try {
                        // Create the new admin user with the predefined one-time password.
                        const userCredential = await createUserWithEmailAndPassword(auth, lowerCaseEmail, creationPassword);
                        
                        // Set their display name
                        if (userCredential.user) {
                           await updateProfile(userCredential.user, { displayName: displayName });
                        }

                        // IMPORTANT: Immediately sign them in with the creation password to establish the session.
                        await signInWithEmailAndPassword(auth, lowerCaseEmail, creationPassword);
                        
                        toast({
                            title: 'Admin Account Created & Logged In',
                            description: 'Welcome! Redirecting to the admin dashboard.',
                        });
                        router.push('/admin');

                    } catch (creationError: any) {
                        // Handle cases where creation fails (e.g., email already exists but with a different auth method)
                        toast({ title: 'Account Creation Failed', description: creationError.message, variant: 'destructive'});
                    }
                } else {
                    // Not a new admin, just wrong credentials for an existing user.
                    toast({ title: 'Login Failed', description: 'Invalid credentials. Please check your email and password.', variant: 'destructive'});
                }
            } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                toast({ title: 'Login Failed', description: 'Invalid credentials. Please check your email and password.', variant: 'destructive' });
            } else if (error.code === 'auth/too-many-requests') {
                 toast({ title: 'Login Blocked', description: 'Too many failed attempts. Please wait a few minutes before trying again.', variant: 'destructive' });
            } else {
                // Handle other unexpected Firebase auth errors
                toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
             <div className="flex items-center cursor-pointer group mb-8">
                <div className="relative w-12 h-12 flex items-center justify-center mr-3">
                  <Image src="https://image2url.com/images/1765187580651-fb73fec6-2402-4429-bd8f-dff67a1e4edc.png" alt="CampusBuild Logo" layout="fill" objectFit="contain" />
                </div>
                 <div>
                    <span className="font-bold text-2xl font-headline text-slate-800 leading-none">CampusBuild</span>
                    <p className="text-sm font-bold font-code tracking-widest text-accent -mt-1">ADMIN PORTAL</p>
                </div>
            </div>
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@nafon.in"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
