'use server';

import {generateProjectIdea} from '@/ai/flows/generate-project-idea-flow';

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
  console.log('Contact Form Submitted:');
  console.log({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    preferredTime: formData.get('preferredTime'),
  });

  return {
    message: 'Request Submitted! We will contact you shortly to schedule a meeting.',
    success: true,
  };
}

export async function getAiResponse(topic: string): Promise<string> {
  if (!topic) {
    return 'Please provide a topic to get a project idea.';
  }

  try {
    const result = await generateProjectIdea({topic});
    return result.idea;
  } catch (error) {
    console.error('Error in getAiResponse:', error);
    // Check if the error is related to the API key
    if (error instanceof Error && error.message.includes('API key')) {
      return 'Sorry, there seems to be an issue with the AI service configuration. The API key might be missing or invalid.';
    }
    return 'Sorry, I encountered an error while generating an idea. Please check the server logs for more details.';
  }
}
