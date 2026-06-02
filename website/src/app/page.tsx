import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Screenshots from "@/components/Screenshots";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <hr className="divider" />
        <Features />
        <hr className="divider" />
        <Screenshots />
        <hr className="divider" />
        {/* <Testimonials /> */}
        <CTABanner />
      </main>
      <Footer />
    </>
  );
};

export default Home;
