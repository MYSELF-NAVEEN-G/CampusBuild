import type { Metadata } from 'next';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: "CampusBuild Solutions – Student & College Project Services",
  description:
    "CampusBuild Solutions specializes in academic project development, consultations, hardware engineering, AI/ML development, and technical project support for students and colleges.",
  keywords: [
    "CampusBuild Solutions",
    "CampusBuild projects",
    "student projects",
    "college projects",
    "engineering projects",
    "mini projects",
    "final year projects",
    "project builders",
    "project development service",
    "AI projects",
    "ML projects",
    "AI ML projects",
    "machine learning projects",
    "artificial intelligence projects",
    "hardware projects",
    "IoT projects",
    "embedded systems projects",
    "electronics projects",
    "Arduino projects",
    "Raspberry Pi projects",
    "ESP8266 projects",
    "technical consultation",
    "project consultation",
    "academic project support",
    "project guidance",
    "project assistance",
    "student project help",
    "computer science projects",
    "IT projects",
    "software projects",
    "web development projects",
    "app development projects",
    "Next.js developer",
    "Firebase projects",
    "Vercel hosting",
    "technical service provider",
    "college assignment help",
    "education technology service",
    "project creation service",
    "professional project building",
    "innovation lab",
    "STEM projects",
    "capstone projects",
    "project submission help",
    "prototype development",
    "industrial project support",
    "team consultation",
    "CampusBuild Official",
    "CampusBuild Solutions project hub",
    "student projects india",
    "college projects india",
    "engineering projects tamil nadu",
    "project help nagercoil",
    "project help tamil nadu",
    "project development south india",
    "AI ML projects india",
    "hardware projects india",
    "electronics projects tamil nadu"
  ],
  openGraph: {
    title: "CampusBuild Solutions",
    description: "Professional Project Building & Technical Services",
    url: "https://campus-build.vercel.app/",
    siteName: "CampusBuild Solutions",
    images: [
      {
        url: "/your-og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="selection:bg-accent selection:text-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@700;800&family=Inter:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-slate-800">
        <FirebaseClientProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
