'use client';
import Image from 'next/image';

const Footer = () => {
  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center mb-4">
             <div className="relative w-10 h-10 flex items-center justify-center mr-3">
                <Image src="https://image2url.com/images/1765187580651-fb73fec6-2402-4429-bd8f-dff67a1e4edc.png" alt="CampusBuild Logo" layout="fill" objectFit="contain" />
              </div>
              <div>
                <span className="font-bold text-xl font-headline text-white leading-none">CampusBuild</span>
                <p className="text-xs font-bold font-code tracking-widest text-accent -mt-1">SOLUTION</p>
              </div>
          </div>
          <p className="text-sm">Bridging the gap between theory and application. We provide high-quality engineering solutions.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 font-headline">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-primary cursor-pointer" onClick={() => scrollToSection('howItWorks')}>Process</a></li>
            <li><a className="hover:text-primary cursor-pointer" onClick={() => scrollToSection('customOrder')}>Custom Orders</a></li>
            <li><a className="hover:text-primary cursor-pointer" onClick={() => scrollToSection('projectCatalog')}>Catalog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 font-headline">Contact</h4>
          <p className="text-sm mb-2">solutionscloudbuild@gmail.com</p>
          <p className="text-xs text-slate-500">© 2025 CampusBuild Solution.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
