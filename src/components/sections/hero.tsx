'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="relative bg-slate-900 overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-code mb-6">
              <span className="flex w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
              POWERED BY NAFON STUDIOS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 font-headline">
              Your Innovation Partner. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">From Idea to Prototype.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
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
          <div className="relative hidden lg:block fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-accent blur-3xl opacity-20 rounded-full"></div>
            {heroImage && (
              <Image
                alt={heroImage.description}
                className="relative rounded-2xl shadow-2xl border border-slate-700/50 w-full h-auto object-cover animate-float"
                src={heroImage.imageUrl}
                width={800}
                height={600}
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
