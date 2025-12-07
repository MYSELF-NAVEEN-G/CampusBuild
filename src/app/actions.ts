
"use server";

import { generateProjectIdea } from "@/ai/flows/generate-project-idea-flow";

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
