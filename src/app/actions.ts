
"use server";

import { generateProjectIdea } from "@/ai/flows/generate-project-idea-flow";

export interface CustomOrderFormState {
  message: string;
  success: boolean;
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
