import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { LiveServiceSection } from "@/components/sections/LiveServiceSection";
import { AnnouncementsSection } from "@/components/sections/AnnouncementsSection";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { SermonsSection } from "@/components/sections/SermonsSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-church-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      {/*<LiveServiceSection />*/}
      <AnnouncementsSection />
      <UpcomingEvents />
      <SermonsSection />
       {/* Latest News Section */}
       <section className="py-24 bg-church-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">
            Latest News
          </h2>
          <p className="text-center text-church-text mb-12">
            Stay updated with our church community
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Item 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img
                src="/pictures/community1.jpg"
                alt="Church news"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-church-secondary mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">March 10, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-church-primary">
                  Children Ministry Center Construction Commenced
                </h3>
                <p className="text-church-text mb-4">
                We are excited to announce the commencement of the contruction of our new Children Ministry...,
                </p>
                <Button
                  variant="link"
                  className="text-church-primary hover:text-church-secondary p-0"
                >
                  Read More →
                </Button>
              </div>
            </div>

            {/* News Item 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img
                src="/pictures/community2.jpg"
                alt="Church news"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-church-secondary mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">December 19, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-church-primary">
                  Successful Community Outreach
                </h3>
                <p className="text-church-text mb-4">
                  Join us in celebrating the success of our recent community
                  outreach program...
                </p>
                <Button
                  variant="link"
                  className="text-church-primary hover:text-church-secondary p-0"
                >
                  Read More →
                </Button>
              </div>
            </div>

            {/* News Item 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img
                src="/pictures/community3.jpg"
                alt="Church news"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-church-secondary mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">January 09, 2025</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-church-primary">
                  National 21 days Fasting and Prayers Ongoing
                </h3>
                <p className="text-church-text mb-4">
                  A time to seek the face of God as the year commences ...
                </p>
                <Button
                  variant="link"
                  className="text-church-primary hover:text-church-secondary p-0"
                >
                  Read More →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-church-accent/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">Our Gallery</h2>
          <p className="text-center text-church-text mb-12">Moments captured in our church community</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "image1.jpg",
              "image2.jpg",
              "image3.jpg",
              "image4.jpg",
              "image5.jpg",
              "image6.jpg",
              "image7.jpg",
              "image8.jpg"
            ].map((image) => (
              <div 
                key={image} 
                className="relative group overflow-hidden rounded-lg aspect-square cursor-pointer"
                onClick={() => setSelectedImage(`/pictures/${image}`)}
              >
                <img
                  src={`/pictures/${image}`}
                  alt="Church gallery"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-church-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    View Image
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-0">
          {selectedImage && (
            <div className="relative w-full h-full">
              <img
                src={selectedImage}
                alt="Gallery preview"
                className="w-full h-full object-contain"
              />
              <Button
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/75 text-white rounded-full p-2"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <FooterSection />

      {/* Chat Button (Fixed) */}
      <div className="fixed bottom-8 right-8">
        <Link to="/chat">
          <Button className="bg-church-secondary hover:bg-church-secondary/90 text-church-primary rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-300">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
