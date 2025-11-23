import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export interface Project {
    id: number;
    title: string;
    category: 'IoT' | 'Hardware' | 'Software' | 'AI';
    price: number;
    image: ImagePlaceholder;
    tags: string[];
    desc: string;
}

const getImage = (id: string): ImagePlaceholder => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        throw new Error(`Placeholder image with id "${id}" not found.`);
    }
    return img;
};

export const projects: Project[] = [
    {
        id: 1,
        title: "Smart Parking System",
        category: "IoT",
        price: 135.00,
        image: getImage('smart-parking'),
        tags: ["IoT", "ESP8266", "IR Sensors"],
        desc: "An IoT-based parking management system. Uses IR sensors to detect vehicle presence in slots and updates a real-time cloud dashboard/mobile app to show availability."
    },
    {
        id: 2,
        title: "Piezoelectric Power Generator",
        category: "Hardware",
        price: 95.00,
        image: getImage('piezo-generator'),
        tags: ["Renewable Energy", "Piezo Sensors", "Power Electronics"],
        desc: "Generate electricity from footsteps! This project uses piezoelectric transducers to convert mechanical stress into electrical energy, stored in a battery to light up LEDs."
    },
    {
        id: 3,
        title: "Face Recognition Attendance",
        category: "Software",
        price: 60.00,
        image: getImage('face-recognition'),
        tags: ["Python", "OpenCV", "Face Recognition"],
        desc: "Automated attendance system using computer vision. Detects faces from a camera feed and logs attendance directly into an SQL/Excel database."
    },
    {
        id: 4,
        title: "Stock Price Prediction AI",
        category: "AI",
        price: 80.00,
        image: getImage('stock-prediction'),
        tags: ["Machine Learning", "LSTM", "Python"],
        desc: "Predict future stock trends using Long Short-Term Memory (LSTM) neural networks. Includes data preprocessing scripts and visualization dashboards."
    },
    {
        id: 5,
        title: "Home Automation (Voice)",
        category: "IoT",
        price: 110.00,
        image: getImage('home-automation'),
        tags: ["ESP32", "Google Assistant", "Relays"],
        desc: "Control home appliances via voice commands using Google Assistant or Alexa. Features an ESP32 microcontroller and a 4-channel relay module."
    },
    {
        id: 6,
        title: "Automatic Plant Watering",
        category: "Hardware",
        price: 55.00,
        image: getImage('plant-watering'),
        tags: ["Arduino", "Sensors", "Automation"],
        desc: "Keeps plants alive by monitoring soil moisture. Automatically triggers a water pump when the soil is dry. Perfect for biology/tech integration."
    }
];
