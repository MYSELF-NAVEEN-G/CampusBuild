
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
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import type { ImagePlaceholder } from "@/lib/placeholder-images";
import type { Project } from "@/lib/projects";

const Cart = () => {
    const { isCartOpen, toggleCart, cart, removeFromCart, clearCart } = useAppContext();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [wantsDelivery, setWantsDelivery] = useState(false);

    const deliveryCharge = 25.00;
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes + (wantsDelivery ? deliveryCharge : 0);

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
            subtotal,
            taxes,
            total,
            deliveryCharge: wantsDelivery ? deliveryCharge : 0,
            createdAt: serverTimestamp(),
            status: 'Not Completed',
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
    
    const isImagePlaceholder = (image: Project['image']): image is ImagePlaceholder => {
        return typeof image === 'object' && 'imageUrl' in image;
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
                                        const imageUrl = isImagePlaceholder(item.image) ? item.image.imageUrl : item.image;
                                        const imageDescription = isImagePlaceholder(item.image) ? item.image.description : item.title;
                                        return (
                                        <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                                            <Image src={imageUrl} alt={imageDescription} width={80} height={80} className="rounded-md object-cover" />
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
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes (8%)</span>
                                        <span>₹{taxes.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-dashed">
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="delivery" checked={wantsDelivery} onCheckedChange={(checked) => setWantsDelivery(checked as boolean)} />
                                            <Label htmlFor="delivery" className="cursor-pointer">Delivery with charges</Label>
                                        </div>
                                        <span>{wantsDelivery ? 'Varies based on place' : '₹0.00'}</span>
                                    </div>
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
