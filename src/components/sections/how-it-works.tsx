'use client';

import { Globe, Users, CodeXml, ArrowRight, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { useFormState, useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from '@/app/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Sending...' : 'Schedule a Call'} <Send className="ml-2 h-4 w-4" />
      </Button>
    );
  }

const ContactForm = () => {
    const initialState: ContactFormState = { message: "", success: false };
    const [state, dispatch] = useFormState(submitContactForm, initialState);
    const { toast } = useToast();

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
        <form action={dispatch} className="space-y-4 mt-4">
             <div>
                <label className="text-xs font-medium text-slate-500" htmlFor="fullName">Full Name</label>
                <Input id="fullName" name="fullName" placeholder="Your Name" required type="text" />
            </div>
             <div>
                <label className="text-xs font-medium text-slate-500" htmlFor="email">Email</label>
                <Input id="email" name="email" placeholder="email@university.edu" required type="email" />
            </div>
            <div>
                <label className="text-xs font-medium text-slate-500" htmlFor="preferredTime">Preferred Google Meet Time</label>
                <Input id="preferredTime" name="preferredTime" required type="text" placeholder="e.g., Tomorrow at 2 PM" />
            </div>
            <SubmitButton />
        </form>
    );
}

const steps = [
    {
        icon: Globe,
        title: "Browse the Catalog",
        description: "Explore our innovation hub. Browse through categories or use our AI Assistant to brainstorm ideas for your academic requirements.",
        interactive: true,
        action: () => scrollToSection('projectCatalog'),
        actionLabel: "Go to Catalog"
    },
    {
        icon: Users,
        title: "Contact Our Experts",
        description: "Have questions or a custom idea? Schedule a free consultation with our R&D team to discuss your project in detail.",
        interactive: false,
    },
    {
        icon: CodeXml,
        title: "Order Your Project",
        description: "After consultation, we'll finalize the project scope and you can place your order. We build, test, and deliver the complete solution to you."
    }
]

const HowItWorks = () => {
    return (
        <section className="py-20 bg-white border-b border-slate-200" id="howItWorks">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold uppercase tracking-widest text-xs font-code">Workflow</span>
                    <h2 className="text-3xl font-bold text-slate-900 mt-2 font-headline">How to Order</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group h-full">
                            <Card className="h-full bg-slate-50 border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all flex flex-col">
                                <CardHeader className="relative">
                                    <div className="absolute -top-8 -right-4 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg font-headline">{index + 1}</div>
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                                        index === 0 ? 'bg-blue-100 text-blue-600' :
                                        index === 1 ? 'bg-teal-100 text-teal-600' :
                                        'bg-purple-100 text-purple-600'
                                    }`}>
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900 font-headline">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col flex-1">
                                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                                    {index === 1 && <ContactForm />}
                                    {step.interactive && step.action && (
                                        <Button onClick={step.action} className="mt-auto">
                                            {step.actionLabel} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;