
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Mail, Linkedin, MessageSquare, Twitter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const socialLinks = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://www.instagram.com/nafon_ai_lab/',
    bgColor: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: '#',
    bgColor: 'bg-blue-600',
  },
  {
    name: 'Gmail',
    icon: Mail,
    href: 'mailto:solutionscloudbuild@gmail.com',
    bgColor: 'bg-red-500',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: 'https://www.linkedin.com/company/nafon-ai-lab/',
    bgColor: 'bg-sky-700',
  },
  {
    name: 'WhatsApp',
    icon: MessageSquare,
    href: 'https://api.whatsapp.com/send?phone=919500782813',
    bgColor: 'bg-green-500',
  },
  {
    name: 'X',
    icon: Twitter,
    href: 'https://x.com/NafonAILab',
    bgColor: 'bg-black',
  },
];

const FloatingContactButtons = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-6 z-50 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative flex flex-col items-start gap-3">
        {isOpen && (
          <div className="flex flex-col items-start gap-3 transition-all duration-300">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                    'transition-all duration-300 transform',
                    isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <Button
                  className={cn('rounded-full h-12 text-white shadow-lg justify-start w-40', social.bgColor)}
                  aria-label={social.name}
                >
                  <social.icon className="h-6 w-6 mr-4" />
                  <span className="font-semibold">{social.name}</span>
                </Button>
              </a>
            ))}
          </div>
        )}
        <Button
          size="lg"
          className="rounded-full h-14 bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-bold w-40 justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : 'Contact'}
        </Button>
      </div>
    </div>
  );
};

export default FloatingContactButtons;
