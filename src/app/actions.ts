
"use server";

import { generateProjectIdea } from "@/ai/flows/generate-project-idea-flow";
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

export async function handleCheckout(cart: Project[]): Promise<{success: boolean, message: string}> {
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    // --- SERVER-SIDE LOG ---
    // This is where you would integrate an email sending service (e.g., SendGrid, Resend).
    // The details are logged on the server, not the client's browser.
    console.log("--- NEW ORDER RECEIVED (SERVER) ---");
    console.log("Items:", cart.map(item => ({ title: item.title, price: item.price })));
    console.log("Subtotal:", subtotal.toFixed(2));
    console.log("Taxes:", taxes.toFixed(2));
    console.log("Total:", total.toFixed(2));
    console.log("--- END OF ORDER (SERVER) ---");
    
    // Simulate sending emails
    console.log("Simulating: Sending customer confirmation email...");
    console.log("Simulating: Sending admin notification email...");

    return {
        success: true,
        message: "Order Placed! A confirmation email with your bill details has been sent.",
    };
}
