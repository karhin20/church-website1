import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Radio, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = ["/pictures/banner1.jpg", "/pictures/banner2.jpg"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen mt-16">
      {banners.map((banner, index) => (
        <div
          key={banner}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentBanner ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url('${banner}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-church-primary/90 to-black/75"></div>
        </div>
      ))}

      {/* Carousel Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentBanner
                ? 'bg-church-secondary'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
        <h4 className="text-xs md:text-sm uppercase tracking-wider mb-4 text-white font-bold animate-fade-in">
          Welcome to The Apostolic Church - Ghana
        </h4>
        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight animate-fade-in delay-100 text-church-secondary">
          NII BOIMAN<br />CENTRAL ASSEMBLY
        </h1>
        <p className="max-w-2xl mb-10 text-lg text-gray-200 animate-fade-in delay-200">
          Join us in worship at Nii Boiman Central Auditorium as we grow together in faith and community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-in delay-300">
          <Link to="/chat">
            <Button className="bg-church-secondary hover:bg-church-secondary/90 text-church-primary px-8 py-6 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105">
              Chat with Aposor Kofi
            </Button>
          </Link>
          

         <Link to="/live">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-transparent hover:text-church-secondary text-3xl flex items-center"
            >
              <Radio className="w-10 h-10 text-church-secondary animate-pulse" />
              <span className="animate-pulse">Live Service</span>
              <ArrowRight className="w-6 h-6 text-church-secondary mr-2 animate-pulse" />
            </Button>
          </Link>



        </div>
      </div>
    </section>
  );
}; 
