
import type { Metadata } from 'next';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: "CampusBuild Solutions – Student & College Project Services",
  description:
    "We develop academic, engineering, AI/ML, and IoT projects for students and colleges.",
  openGraph: {
    title: "CampusBuild Solutions",
    description: "Student & College Project Development Services",
    url: "https://campus-build.vercel.app/",
    siteName: "CampusBuild Solutions",
    images: [
      {
        url: "https://image2url.com/images/1765187653532-73c5f0ac-c1ed-4b37-8f1d-587411f599df.png",
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
        <link rel="icon" href="https://image2url.com/images/1765187580651-fb73fec6-2402-4429-bd8f-dff67a1e4edc.png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@700;800&family=Inter:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CampusBuild Solutions",
  "url": "https://campus-build.vercel.app/",
  "logo": "https://image2url.com/images/1765187580651-fb73fec6-2402-4429-bd8f-dff67a1e4edc.png",
  "description": "CampusBuild Solutions provides student project development services including AI/ML, IoT, hardware, software, and academic project consultation.",
  "sameAs": []
}
` }} />
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
