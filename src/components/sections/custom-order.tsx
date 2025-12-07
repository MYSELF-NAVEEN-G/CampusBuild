
'use client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useFirebase, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const CustomOrder = () => {
    const { toast } = useToast();
    const { openAiChat } = useAppContext();
    const { firestore } = useFirebase();
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [domain, setDomain] = useState('iot');
    const [wantsDelivery, setWantsDelivery] = useState(false);

    const deliveryCharge = 25.00;

    const getMinDate = () => {
        let minDays;
        switch (domain) {
            case 'embedded':
            case 'iot':
            case 'power':
                minDays = 8;
                break;
            case 'software':
            case 'ai':
                minDays = 6;
                break;
            default:
                minDays = 8;
        }
        const today = new Date();
        today.setDate(today.getDate() + minDays);
        return today.toISOString().split('T')[0];
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!firestore || !user) {
            toast({
                title: "Authentication Required",
                description: "You must be signed in to submit a custom order. We've initiated a secure, anonymous session for you. Please try submitting again.",
                variant: "destructive",
            });
            // The FirebaseProvider automatically handles anonymous sign-in,
            // so the user just needs to retry.
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const customOrderData = {
            customerName: formData.get("fullName") as string,
            customerEmail: formData.get("email") as string,
            projectTitle: formData.get("projectTitle") as string,
            domain: formData.get("domain") as string,
            deadline: formData.get("deadline") as string || '',
            detailedRequirements: formData.get("requirements") as string,
            isCustomOrder: true,
            deliveryCharge: wantsDelivery ? deliveryCharge : 0,
            createdAt: serverTimestamp(),
            status: 'Not Completed',
            deliveryStatus: 'Not Delivered',
            assigned: 'Not Assigned',
            customerPhone: '', // Not in this form, can be added if needed
        };

        try {
            // Use the user's UID to create a user-specific subcollection path
            const ordersCollectionRef = collection(firestore, 'orders');
            await addDoc(ordersCollectionRef, customOrderData);
            
            toast({
                title: "Custom Order Submitted!",
                description: "Your request has been received. An expert will contact you shortly to follow up.",
            });
            (event.target as HTMLFormElement).reset();
            setDomain('iot');
            setWantsDelivery(false);
        } catch (error) {
            console.error("Error submitting custom order:", error);
            // This will emit a detailed error for the developer overlay
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${user.uid}/customOrders`,
                operation: 'create',
                requestResourceData: customOrderData,
            }));
            toast({
                title: "Submission Error",
                description: "Could not save your request. Please ensure you have the correct permissions or try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <section className="py-20 bg-background border-b border-border relative overflow-hidden" id="customOrder">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between">
                        <div>
                            <span className="text-primary font-code text-xs uppercase tracking-wider">Custom Fabrication</span>
                            <h3 className="text-2xl font-bold mt-2 mb-4 font-headline">Order a New Project</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Can&apos;t find what you need in the catalog? Our R&D team can build it from scratch. Fill out the details, and we&apos;ll engineer it for you.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex items-center mb-2">
                                <Lightbulb className="text-yellow-400 mr-2" />
                                <span className="font-bold text-sm">Need Ideas?</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">Use the NAFON AI Assistant (powered by Gemini) to generate a project abstract before ordering.</p>
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm" onClick={openAiChat}>
                                Ask AI Assistant
                            </Button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="md:w-2/3 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="fullName">Full Name</label>
                                <Input id="fullName" name="fullName" placeholder="Your Name" required type="text" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="email">Contact Email</label>
                                <Input id="email" name="email" placeholder="email@university.edu" required type="email" />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="projectTitle">Project Title / Concept</label>
                            <Input id="projectTitle" name="projectTitle" placeholder="e.g. AI-Based Traffic Management System" required type="text" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Domain</label>
                                <Select name="domain" value={domain} onValueChange={setDomain}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a domain" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="embedded">Embedded Systems (Hardware)</SelectItem>
                                        <SelectItem value="iot">IoT & Automation</SelectItem>
                                        <SelectItem value="software">Software Development</SelectItem>
                                        <SelectItem value="ai">AI / Machine Learning</SelectItem>
                                        <SelectItem value="power">Power Electronics</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="deadline">Deadline</label>
                                <Input id="deadline" name="deadline" type="date" min={getMinDate()} />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="requirements">Detailed Requirements</label>
                            <Textarea id="requirements" name="requirements" placeholder="Describe the features, specific sensors (e.g. Piezo, Ultrasonic), and any software preferences..." className="h-24 resize-none" />
                        </div>
                         <div className="flex items-center gap-2 mb-6">
                            <Checkbox id="custom-delivery" name="delivery" checked={wantsDelivery} onCheckedChange={(checked) => setWantsDelivery(checked as boolean)} />
                            <Label htmlFor="custom-delivery" className="cursor-pointer text-sm">Delivery with charges</Label>
                        </div>
                        <div className="flex justify-end">
                             <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-800 transition-all">
                                {isSubmitting ? 'Submitting...' : 'Submit Custom Order'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default CustomOrder;
