
'use server';

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
