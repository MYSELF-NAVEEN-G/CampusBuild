'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { submitContactForm, type ContactFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, FlaskConical } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Sending...' : 'Schedule a Call'} <Send className="ml-2 h-4 w-4" />
      </Button>
    );
}

export default function ScheduleMeetingPage() {
    const initialState: ContactFormState = { message: "", success: false };
    const [state, dispatch] = useActionState(submitContactForm, initialState);
    const { toast } = useToast();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (fullName.toLowerCase() === 'admin' && email.toLowerCase() === 'nafonstudios@gmail.com') {
            router.push('/admin');
            return;
        }
        
        const formData = new FormData(event.currentTarget);
        dispatch(formData);
    };

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
                        <div>
                            <label className="text-xs font-medium text-slate-600" htmlFor="preferredTime">Preferred Google Meet Time</label>
                            <Input id="preferredTime" name="preferredTime" required type="text" placeholder="e.g., Tomorrow at 2 PM" className="mt-1"/>
                        </div>
                        <SubmitButton />
                    </form>
                </Card>
            </div>
        </main>
        </>
    );
}

// Add a simple Card component for styling consistency.
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={`bg-white rounded-2xl border border-slate-200 ${className}`}
      {...props}
    />
  );