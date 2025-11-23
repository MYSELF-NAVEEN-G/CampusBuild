import AiAssistant from '@/components/ai-assistant';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import CustomOrder from '@/components/sections/custom-order';
import Hero from '@/components/sections/hero';
import HowItWorks from '@/components/sections/how-it-works';
import ProjectCatalog from '@/components/sections/project-catalog';

export default function Home() {
  return (
    <>
      <Header />
      <main id="mainContent">
        <Hero />
        <HowItWorks />
        <CustomOrder />
        <ProjectCatalog />
      </main>
      <Footer />
      <AiAssistant />
    </>
  );
}
