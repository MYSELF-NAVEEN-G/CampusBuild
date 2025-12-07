
"use server";

import { generateProjectIdea } from "@/ai/flows/generate-project-idea-flow";
import { initializeFirebase } from "@/firebase/server";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { Project } from "@/lib/projects";

export interface CustomOrderFormState {
  message: string;
  success: boolean;
}

export interface ContactFormState {
    message: string;
    success: boolean;
}

export async function submitContactForm(
    prevState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    console.log("Contact Form Submitted:");
    console.log({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        preferredTime: formData.get("preferredTime"),
    });

    return {
        message: "Request Submitted! We will contact you shortly to schedule a meeting.",
        success: true,
    };
}

export async function submitCustomOrder(
  prevState: CustomOrderFormState,
  formData: FormData
): Promise<CustomOrderFormState> {
  // This is a demo. In a real app, you would process the form data,
  // save it to a database, and send notifications.
  console.log("Custom Order Submitted:");
  console.log({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    projectTitle: formData.get("projectTitle"),
    domain: formData.get("domain"),
    deadline: formData.get("deadline"),
    requirements: formData.get("requirements"),
  });

  return {
    message: "Request Submitted! An expert will contact you.",
    success: true,
  };
}

export async function getAiResponse(topic: string): Promise<string> {
    if (!topic) {
        return "Please provide a topic to get a project idea.";
    }

    try {
        const result = await generateProjectIdea({ topic });
        return result.idea;
    } catch (error) {
        console.error("Error generating project idea:", error);
        return "Sorry, I encountered an error while generating an idea. Please try again.";
    }
}

export async function handleCheckout(cart: Project[], customerDetails: { name: string; email: string; phone: string }): Promise<{success: boolean, message: string}> {
    const { firestore } = initializeFirebase();
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    const orderData = {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price })),
        subtotal,
        taxes,
        total,
        createdAt: serverTimestamp(),
        status: 'Not Completed',
        assigned: 'Not Assigned',
        deadline: '',
    };

    try {
        const ordersCollection = collection(firestore, 'orders');
        await addDoc(ordersCollection, orderData);

        // This is where you would integrate a real email sending service (e.g., SendGrid, Resend)
        // by calling another server action or an external API.
        console.log("--- NEW ORDER SAVED TO FIRESTORE (SERVER) ---");
        console.log(orderData);
        console.log("--- END OF ORDER (SERVER) ---");
        console.log("Simulating: Sending customer confirmation email...");
        console.log("Simulating: Sending admin notification email...");

        return {
            success: true,
            message: "Order Placed! A confirmation email will be sent shortly. IMPORTANT: If you do not receive a call or email from our team within 2 business days, your order may not have been saved correctly. Please contact us.",
        };
    } catch (error: any) {
        // This is a generic server error, not a permission error.
        // We will keep the generic message for now, as the permission error
        // should be caught by the onSnapshot listener on the client.
        // In a real app, you might want to distinguish between different
        // types of server errors here.
        console.error("Error saving order to Firestore:", error);
        return {
            success: false,
            message: "There was an error placing your order. Please try again or contact support.",
        };
    }
}


export async function updateOrderStatus(orderId: string, updates: { status?: string; assigned?: string, deadline?: string }): Promise<{success: boolean, message: string}> {
    const { firestore } = initializeFirebase();
    try {
        const orderRef = doc(firestore, 'orders', orderId);
        await updateDoc(orderRef, updates);
        return { success: true, message: 'Order updated successfully' };
    } catch (error: any) {
        // This is a generic server error, not a permission error.
        // We will keep the generic message for now.
        console.error("Error updating order status:", error);
        return { success: false, message: 'Failed to update order' };
    }
}
