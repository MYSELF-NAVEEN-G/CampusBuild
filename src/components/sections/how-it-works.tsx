'use client';

import { Globe, Users, CodeXml } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const steps = [
    {
        icon: Globe,
        title: "Browse the Catalog",
        description: "Explore our innovation hub. Browse through categories or use our AI Assistant to brainstorm ideas for your academic requirements.",
        href: '#projectCatalog'
    },
    {
        icon: Users,
        title: "Contact Our Experts",
        description: "Have questions or a custom idea? Schedule a free consultation with our R&D team to discuss your project in detail.",
        href: '/schedule-meeting'
    },
    {
        icon: CodeXml,
        title: "Order Your Project",
        description: "After consultation, we'll finalize the project scope and you can place your order. We build, test, and deliver the complete solution to you.",
        href: '#customOrder'
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
                        <Link key={index} href={step.href} className="block h-full">
                            <Card className="h-full bg-slate-50 border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all flex flex-col group">
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
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
