
'use client';

import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { ShoppingCart, Menu, X, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const { cart, toggleCart } = useAppContext();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <>
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200/80' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center cursor-pointer group" onClick={scrollToTop}>
            <div className="relative w-10 h-10 flex items-center justify-center mr-3">
              <Image src="https://image2url.com/images/1765187653532-73c5f0ac-c1ed-4b37-8f1d-587411f599df.png" alt="CampusBuild Logo" layout="fill" objectFit="contain" />
            </div>
             <div>
                <span className="font-bold text-xl font-headline text-slate-800 leading-none">CampusBuild</span>
                <p className="text-xs font-bold font-code tracking-widest text-accent -mt-1">SOLUTION</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('howItWorks')}>How It Works</a>
            <Link href="/our-team" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">Our Team</Link>
            <a className="text-sm font-medium text-slate-600 hover-text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('customOrder')}>Order Custom</a>
            <a className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer" onClick={() => scrollToSection('projectCatalog')}>Catalog</a>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button asChild className="hidden sm:flex">
                <Link href="/schedule-meeting">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Schedule Meeting
                </Link>
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
            <Button asChild className="w-4/5">
              <Link href="/schedule-meeting" onClick={() => setIsMobileMenuOpen(false)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
