
import type { ImagePlaceholder } from './placeholder-images';

export interface Project {
    id: string; // Changed to string to align with Firestore docId
    docId?: string;
    title: string;
    category: 'IoT' | 'Hardware' | 'Software' | 'AI';
    price: number;
    image: ImagePlaceholder | string; // Can be a placeholder object or a data URL string
    tags: string[];
    desc: string;
}
