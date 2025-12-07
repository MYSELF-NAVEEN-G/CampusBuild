
'use client';

import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { FlaskConical, Bot, ShoppingCart } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Header = () => {
  const { cart, toggleAiChat, toggleCart } = useAppContext();
  const [isScrolled, setIsScrolled] = React.useState(false);

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
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/90 backdrop-blur-lg border-b border-slate-200/80' : 'bg-transparent border-b border-transparent'
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
            <Button className="hidden sm:flex" onClick={toggleAiChat}>
              <Bot className="mr-2 h-4 w-4" />
              AI Assistant
            </Button>
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary" onClick={toggleCart}>
              <ShoppingCart />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
