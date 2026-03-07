import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Programs } from '../components/Programs';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f]" data-testid="landing-page">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Programs />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
