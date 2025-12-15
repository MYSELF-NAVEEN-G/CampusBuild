
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

const terms = [
    {
        title: "1. Acceptance of Terms",
        content: "By placing an order on our website, the customer acknowledges that they have read, understood, and agreed to all the terms and conditions mentioned below. These terms apply to all users, orders, services, and deliveries made through our platform."
    },
    {
        title: "2. Nature of Projects",
        content: "All projects provided through our website are academic, educational, and demonstration-based. They are intended solely for learning, reference, and practical understanding purposes.",
        points: [
            "University marks or grades",
            "Academic approval by institutions",
            "Placement or job outcomes"
        ],
        disclaimer: "We do not guarantee:"
    },
    {
        title: "3. Order Confirmation",
        content: "An order is considered confirmed only after full or partial payment, as specified during checkout, is successfully received.",
        points: [
            "Project details are locked",
            "Customization requests must be submitted immediately",
            "Changes after confirmation may not be possible"
        ],
        disclaimer: "Once the order is confirmed:"
    },
    {
        title: "4. Pricing & Payment Policy",
        content: "All prices displayed are final unless stated otherwise. Payment once made is non-refundable under any circumstances. Refunds, cancellations, or exchanges are strictly not permitted after order confirmation.",
        points: [
            "The customer no longer requires the project",
            "The institution changes requirements",
            "The project is partially used"
        ],
        disclaimer: "This applies even if:"
    },
    {
        title: "5. No Refund Policy",
        content: "Due to the academic and customized nature of projects: No refunds will be issued once the project is delivered or dispatched. No refunds for delay caused by courier services, technical issues, or external factors. No refunds for dissatisfaction after delivery. Customers are advised to review project descriptions carefully before ordering."
    },
    {
        title: "6. Delivery & Shipping Policy",
        content: "Projects may be delivered digitally, physically, or both, depending on the order. Delivery timelines provided are estimated, not guaranteed. Courier delays, strikes, weather issues, or regional restrictions are beyond our control.",
        points: [
            "We are not responsible for damage, loss, or delay caused during courier delivery",
            "Once handed over to the courier service, responsibility shifts to the courier provider"
        ],
        disclaimer: "Important:"
    },
    {
        title: "7. Deadline Disclaimer",
        content: "While we make best efforts to deliver projects within the estimated timeline, we are not responsible if the project does not arrive exactly on the expected deadline. Delays due to courier services, public holidays, technical failures, or force majeure events are excluded. Customers are advised to order well in advance of their academic deadlines."
    },
    {
        title: "8. Project Damage Disclaimer",
        content: "All projects are tested and verified before dispatch. Any physical damage occurring during transportation is not our responsibility. Customers must raise courier damage issues directly with the courier service.",
        points: [
            "Recording an unboxing video",
            "Inspecting the package immediately upon receipt"
        ],
        disclaimer: "We strongly recommend:"
    },
    {
        title: "9. Technical Support Scope",
        content: "We provide limited guidance and support.",
        points: [
            "Basic explanation of project working",
            "Installation or setup guidance",
            "Code overview (for software projects)"
        ],
        disclaimer: "This may include:",
        points2: [
            "Full viva coaching",
            "Continuous long-term support",
            "Rewriting entire projects"
        ],
        disclaimer2: "We do not provide:",
        finalNote: "Support is provided within reasonable limits only."
    },
    {
        title: "10. Customization Policy",
        content: "Customizations are subject to feasibility. Additional charges may apply. Custom requirements must be clearly communicated before order confirmation. Once development begins, changes may not be accepted."
    },
    {
        title: "11. Intellectual Property",
        content: "Project source code, documents, and designs remain the intellectual property of the company unless explicitly stated. Customers may use the project for academic purposes only. Commercial resale, redistribution, or public hosting without permission is prohibited."
    },
    {
        title: "12. User Responsibility",
        content: "Customers are responsible for:",
        points: [
            "Providing correct delivery address and contact details",
            "Understanding project scope before ordering",
            "Ensuring project compatibility with their academic requirements"
        ],
        finalNote: "Incorrect details provided by the customer may result in delays or non-delivery."
    },
    {
        title: "13. Limitation of Liability",
        content: "Under no circumstances shall we be held liable for:",
        points: [
            "Academic consequences",
            "Missed deadlines",
            "Marks, evaluations, or institutional outcomes",
            "Courier-related issues",
            "Indirect or consequential losses"
        ],
        finalNote: "Our maximum liability, if any, shall not exceed the amount paid by the customer."
    },
    {
        title: "14. Order Cancellation",
        content: "Order cancellation is not allowed once confirmed. Abandoned or unpaid orders may be automatically cancelled."
    },
    {
        title: "15. Modifications to Terms",
        content: "We reserve the right to modify these terms at any time and update policies without prior notice. Continued use of the website implies acceptance of revised terms."
    },
    {
        title: "16. Governing Law",
        content: "All terms shall be governed by and interpreted under the laws applicable in India. Any disputes shall be subject to the jurisdiction of the appropriate courts."
    },
    {
        title: "17. Contact & Support",
        content: "For any clarifications regarding policies or orders, customers may contact us through the official communication channels provided on the website."
    }
];

export default function TermsAndConditionsPage() {
    return (
        <>
            <Header />
            <main className="bg-slate-50 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-slate-900 font-headline">Terms & Conditions</h1>
                        <p className="mt-2 text-lg text-slate-600">Please read our policies carefully before placing an order.</p>
                    </div>

                    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200">
                        <div className="space-y-8">
                            {terms.map((term) => (
                                <div key={term.title} className="prose prose-slate max-w-none">
                                    <h2 className="text-xl font-bold text-slate-800 font-headline">{term.title}</h2>
                                    <p className="text-slate-600">{term.content}</p>
                                    {term.disclaimer && <p className="text-slate-600 font-semibold">{term.disclaimer}</p>}
                                    {term.points && (
                                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                            {term.points.map((point, index) => <li key={index}>{point}</li>)}
                                        </ul>
                                    )}
                                    {term.disclaimer2 && <p className="text-slate-600 font-semibold mt-4">{term.disclaimer2}</p>}
                                     {term.points2 && (
                                        <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                            {term.points2.map((point, index) => <li key={index}>{point}</li>)}
                                        </ul>
                                    )}
                                    {term.finalNote && <p className="text-slate-600 mt-2">{term.finalNote}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}