import { Globe, Users, CodeXml } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
    {
        icon: Globe,
        title: "Visit & Get Ideas",
        description: "Explore our innovation hub. Browse through categories or use our AI Assistant to brainstorm ideas for your academic requirements."
    },
    {
        icon: Users,
        title: "Consult Our Experts",
        description: "Connect with our team. Choose to buy a pre-existing project from our catalog OR order a completely new custom build tailored to you."
    },
    {
        icon: CodeXml,
        title: "Build & Deploy",
        description: "We collect all details, build your project, and deliver the hardware kit, source code, and documentation. You get a ready-to-present solution."
    }
]

const HowItWorks = () => {
    return (
        <section className="py-20 bg-white border-b border-slate-200" id="howItWorks">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold uppercase tracking-widest text-xs font-code">Workflow</span>
                    <h2 className="text-3xl font-bold text-slate-900 mt-2 font-headline">How NAFON Works</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <Card className="h-full bg-slate-50 border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all">
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
                                <CardContent>
                                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
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
