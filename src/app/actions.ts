
"use server";

import { generateProjectIdea } from "@/ai/flows/generate-project-idea-flow";
import { initializeFirebase } from "@/firebase/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

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
  const { firestore } = initializeFirebase();
  
  const customOrderData = {
    customerName: formData.get("fullName"),
    customerEmail: formData.get("email"),
    projectTitle: formData.get("projectTitle"),
    domain: formData.get("domain"),
    deadline: formData.get("deadline") || '',
    detailedRequirements: formData.get("detailedRequirements"),
    isCustomOrder: true,
    createdAt: serverTimestamp(),
    status: 'Not Completed',
    assigned: 'Not Assigned',
    // Customer phone isn't on this form, so we'll leave it out
    customerPhone: '', 
  };

  try {
    const ordersCollection = collection(firestore, 'orders');
    await addDoc(ordersCollection, customOrderData);
    
    return {
      message: "Request Submitted! An expert will contact you.",
      success: true,
    };

  } catch (error) {
    console.error("Error submitting custom order:", error);
    return {
      message: "There was a server error submitting your request. Please try again later.",
      success: false,
    };
  }
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
