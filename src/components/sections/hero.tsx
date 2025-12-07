'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Box, Circle, Triangle } from 'lucide-react';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures this code runs only on the client, after hydration
    setIsClient(true);
    
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const calculateParallax = (strength: number) => {
    if (!isClient) return {}; // Don't apply transform on server or before hydration
    const x = (mousePosition.x - window.innerWidth / 2) / strength;
    const y = (mousePosition.y - window.innerHeight / 2) / strength;
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="relative bg-slate-900 overflow-hidden pt-16 lg:pt-24 pb-20 lg:pb-28">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
      
      {/* Animated Shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none z-0">
          <div style={calculateParallax(-20)} className="transition-transform duration-500 ease-out">
            <Circle className="absolute -right-20 top-1/4 w-48 h-48 text-accent/10" />
          </div>
          <div style={calculateParallax(30)} className="transition-transform duration-500 ease-out">
            <Box className="absolute right-1/4 top-1/2 w-32 h-32 text-primary/10" />
          </div>
          <div style={calculateParallax(-50)} className="transition-transform duration-500 ease-out">
            <Triangle className="absolute right-1/2 bottom-1/4 w-40 h-40 text-accent/5" />
          </div>
          <div style={calculateParallax(15)} className="transition-transform duration-500 ease-out">
            <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
          <div style={calculateParallax(40)} className="transition-transform duration-500 ease-out">
            <div className="absolute bottom-10 right-1/2 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          <div className="text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-code mb-6">
              <span className="flex w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
              POWERED BY NAFON STUDIOS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 font-headline">
              Your Innovation Partner. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">From Idea to Prototype.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl">
              Browse our catalog of ready-made projects or use our AI assistant to spec out a completely custom build. We deliver hardware, code, and documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="shadow-lg shadow-primary/30" onClick={() => scrollToSection('projectCatalog')}>
                Browse Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => scrollToSection('customOrder')}>
                Build Custom Project
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative h-full w-full">
            {/* This space is intentionally left for the animation background elements */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
