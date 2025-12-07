'use client';
import { useAppContext } from "@/context/app-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { Trash2 } from "lucide-react";

const Cart = () => {
    const { isCartOpen, toggleCart, cart, removeFromCart } = useAppContext();

    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    return (
        <Sheet open={isCartOpen} onOpenChange={toggleCart}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">Order Summary</SheetTitle>
                </SheetHeader>
                {cart.length > 0 ? (
                    <>
                        <ScrollArea className="flex-1 -mx-6">
                            <div className="px-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                                        <Image src={item.image.imageUrl} alt={item.title} width={80} height={80} className="rounded-md object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground">{item.category}</p>
                                            <p className="font-bold mt-1">${item.price.toFixed(2)}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <SheetFooter className="mt-auto pt-6 border-t">
                            <div className="w-full space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes (8%)</span>
                                    <span>${taxes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <Button className="w-full mt-4" size="lg">Proceed to Checkout</Button>
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
    );
};

export default Cart;
