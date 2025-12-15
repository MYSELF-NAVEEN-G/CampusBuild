
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Mail, Linkedin, MessageSquare, Twitter, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const socialLinks = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://www.instagram.com/camp.usbuildsolution2322?igsh=MWw3MG1sejRvYWhjMg==',
    bgColor: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://www.facebook.com/profile.php?id=61585168707364&sfnsn=wa',
    bgColor: 'bg-blue-600',
  },
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:campusbuildsolutions@gmail.com',
    bgColor: 'bg-red-500',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/campusbuild-solutions-8b4279394',
    bgColor: 'bg-sky-700',
  },
  {
    name: 'WhatsApp',
    icon: MessageSquare,
    href: 'https://chat.whatsapp.com/GB9OjwIE3kr0JlXGT6hsCd',
    bgColor: 'bg-green-500',
  },
  {
    name: 'X',
    icon: Twitter,
    href: 'https://x.com/CampusbuildS',
    bgColor: 'bg-black',
  },
];

const FloatingContactButtons = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

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
          size={isMobile ? 'icon' : 'lg'}
          className={cn(
            'rounded-full h-14 bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-bold justify-center',
            isMobile ? 'w-14' : 'w-40'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : isMobile ? (
            <Phone className="h-6 w-6" />
          ) : (
            'Contact'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FloatingContactButtons;
