
'use client';

import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { FlaskConical, MessageSquare, ShoppingCart, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Project } from '@/lib/projects';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { cart, toggleCart, addToCart } = useAppContext();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const scrollToSection = (id: string) => {
    if (document.getElementById(id)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const handleBookConsultation = () => {
    const consultationProduct: Project = {
      id: 'consult-30-min',
      title: '30-Min Expert Consultation',
      category: 'Software', // Assign a default category
      price: 150.00,
      image: 'https://picsum.photos/seed/consult/600/400',
      tags: ['Consultation', 'Expert Advice'],
      desc: 'A 30-minute one-on-one consultation with an R&D expert to discuss your project idea, scope, and technical requirements.',
      bundleIncluded: ['Expert advice', 'Project scope analysis', 'Technical feasibility report'],
    };
    addToCart(consultationProduct);
    toast({
      title: 'Consultation Added',
      description: 'The 30-minute consultation has been added to your order.',
    });
    toggleCart();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200/80' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer group" onClick={scrollToTop}>
            <div className="relative w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
              <div className="absolute inset-0 bg-primary opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <FlaskConical className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none font-headline">CampusBuild</h1>
              <p className="text-xs text-primary font-code font-medium tracking-widest uppercase">Solution</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('howItWorks')}>How It Works</a>
            <Link href="/our-team" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">Our Team</Link>
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('customOrder')}>Order Custom</a>
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('projectCatalog')}>Catalog</a>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button onClick={handleBookConsultation} className="hidden sm:flex">
              <MessageSquare className="mr-2 h-4 w-4" />
              30-Min Consultation (₹150)
            </Button>
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary" onClick={toggleCart}>
              <ShoppingCart />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {cart.length}
                </span>
              )}
            </Button>
            <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500 hover:text-primary">
                    {isMobileMenuOpen ? <X/> : <Menu/>}
                </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-lg pb-4">
          <nav className="flex flex-col items-center space-y-4">
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('howItWorks')}>How It Works</a>
            <Link href="/our-team" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>Our Team</Link>
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('customOrder')}>Order Custom</a>
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('projectCatalog')}>Catalog</a>
            <Button onClick={handleBookConsultation} className="w-4/5">
              <MessageSquare className="mr-2 h-4 w-4" />
              30-Min Consultation (₹150)
            </Button>
          </nav>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
