
'use client';
import { useAppContext } from "@/context/app-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import CheckoutForm from "./checkout-form";
import { useFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Project } from "@/lib/projects";

const Cart = () => {
    const { isCartOpen, toggleCart, cart, removeFromCart, clearCart } = useAppContext();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    
    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const getMinDeadline = () => {
        const hasHardwareOrIoT = cart.some(item => item.category === 'Hardware' || item.category === 'IoT');
        const minDays = hasHardwareOrIoT ? 8 : 6;
        
        const today = new Date();
        today.setDate(today.getDate() + minDays);
        return today.toISOString().split('T')[0];
    };

    const onCheckout = async (customerDetails: { name: string; email: string; phone: string; deadline: string }) => {
        if (cart.length === 0 || !firestore) {
            toast({ title: "Error", description: "Cart is empty or database is not available.", variant: "destructive" });
            return;
        }

        setIsCheckingOut(true);

        const orderData = {
            customerName: customerDetails.name,
            customerEmail: customerDetails.email,
            customerPhone: customerDetails.phone,
            items: cart.map(item => ({ id: item.id, title: item.title, price: item.price })),
            total,
            createdAt: serverTimestamp(),
            status: 'Not Completed',
            deliveryStatus: 'Not Delivered',
            assigned: 'Not Assigned',
            deadline: customerDetails.deadline,
        };

        try {
            const ordersCollection = collection(firestore, 'orders');
            await addDoc(ordersCollection, orderData);

            toast({
                title: "Order Placed!",
                description: "Your order has been successfully submitted. We will contact you shortly.",
                duration: 10000,
            });

            clearCart();
            setShowCheckoutForm(false);
            toggleCart();
        } catch (error: any) {
            console.error("Error placing order:", error);
            // Create and emit a contextual error for permission issues
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'orders',
                operation: 'create',
                requestResourceData: orderData
            }));
            toast({
                title: "Error Placing Order",
                description: "Could not save your order. Please check your permissions or contact support.",
                variant: "destructive",
                duration: 10000,
            });
        } finally {
            setIsCheckingOut(false);
        }
    };
    
    const getImageUrl = (project: Project) => {
        if (typeof project.image === 'string' && project.image.startsWith('data:image')) {
            return project.image;
        }
        const placeholder = PlaceHolderImages.find(p => p.id === project.image);
        return placeholder ? placeholder.imageUrl : 'https://picsum.photos/seed/1/80/80';
    };

    return (
        <>
            <Sheet open={isCartOpen} onOpenChange={toggleCart}>
                <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="font-headline text-2xl">Order Summary</SheetTitle>
                    </SheetHeader>
                    {cart.length > 0 ? (
                        <>
                            <ScrollArea className="flex-1 -mx-6 my-4">
                                <div className="px-6">
                                    {cart.map((item) => {
                                        const imageUrl = getImageUrl(item);
                                        return (
                                        <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                                            <Image src={imageUrl} alt={item.title} width={80} height={80} className="rounded-md object-cover" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                                <p className="font-bold mt-1">₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )})}
                                </div>
                            </ScrollArea>
                            <SheetFooter className="mt-auto pt-6 border-t">
                                <div className="w-full space-y-2 text-sm">
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                    <Button className="w-full mt-4" size="lg" onClick={() => setShowCheckoutForm(true)} disabled={isCheckingOut}>
                                        Proceed to Checkout
                                    </Button>
                                </div>
                            </SheetFooter>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-semibold mb-2">Your Cart is Empty</h3>
                            <p className="text-muted-foreground mb-4">Looks like you haven't added any projects yet.</p>
                            <Button onClick={toggleCart}>Continue Browsing</Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
            <CheckoutForm
                isOpen={showCheckoutForm}
                onClose={() => setShowCheckoutForm(false)}
                onSubmit={onCheckout}
                isSubmitting={isCheckingOut}
                minDeadlineDate={getMinDeadline()}
            />
        </>
    );
};

export default Cart;
