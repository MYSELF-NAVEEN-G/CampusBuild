
'use client';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { submitCustomOrder, CustomOrderFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb } from 'lucide-react';
import { useAppContext } from '@/context/app-context';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-slate-800 transition-all">
      {pending ? 'Submitting...' : 'Submit Custom Order'}
    </Button>
  );
}

const CustomOrder = () => {
    const initialState: CustomOrderFormState = { message: "", success: false };
    const [state, dispatch] = useActionState(submitCustomOrder, initialState);
    const { toast } = useToast();
    const { openAiChat } = useAppContext();


    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);

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
                    <form action={dispatch} className="md:w-2/3 p-8">
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
                                <Select name="domain" defaultValue="iot">
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
                                <Input id="deadline" name="deadline" type="date" />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="requirements">Detailed Requirements</label>
                            <Textarea id="requirements" name="requirements" placeholder="Describe the features, specific sensors (e.g. Piezo, Ultrasonic), and any software preferences..." className="h-24 resize-none" />
                        </div>
                        <div className="flex justify-end">
                            <SubmitButton />
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default CustomOrder;
