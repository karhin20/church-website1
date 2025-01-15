import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { LiveServiceSection } from "@/components/sections/LiveServiceSection";
import { AnnouncementsSection } from "@/components/sections/AnnouncementsSection";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { SermonsSection } from "@/components/sections/SermonsSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { Calendar, MessageCircle, Music4, X, BookPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link, useLocation, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatButton } from "@/components/ChatButton";


const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if we have a section to scroll to
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Small delay to ensure the page is loaded
      }
    }
  }, [location]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-church-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />


      <LiveServiceSection />

     
      {/* Hymn and Bible Section with Full-Width Background */}
      <div className="bg-church-primary pb-16 p-4"> 
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Hymn Card */}
          <motion.div 
            className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            viewport={{ once: false }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.6
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Music4 className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-church-primary mb-2">TAC Hymns</h3>
            <p className="text-lg text-church-text mb-4">Explore our rich collection of spiritual hymns.</p> 
            <Link to="/hymns">
              <Button className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-xl py-3 px-6 rounded-lg">
                View Hymns
              </Button>
            </Link>
          </motion.div>

          {/* Bible Card */}
          <motion.div 
            className="p-6 pb-8 bg-white rounded-lg shadow-lg text-center"
            whileHover={{ scale: 1.05 }}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            viewport={{ once: false }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.6
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <BookPlus className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-church-primary mb-2">THE BIBLE</h3>
            <p className="text-lg text-church-text mb-4">Read and study the Word of God in multiple languages.</p> 
            <Link to="/bible">
              <Button className="bg-church-primary text-white hover:bg-church-secondary transition-colors text-xl py-3 px-6 rounded-lg">
                Read Bible
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <AnnouncementsSection />
      <div id="events">
        <UpcomingEvents />
      </div>
      <div id="sermons">
        <SermonsSection />
      </div>
       {/* Latest News Section */}
       <section className="py-24 bg-church-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.6
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">
              Latest News
            </h2>
            <p className="text-center text-church-text mb-12">
              Stay updated with our church community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Items with staggered animations */}
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 0.6,
                  delay: index * 0.1
                }}
              >
                <img
                  src={`/pictures/community${index}.jpg`}
                  alt="Church news"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-church-secondary mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {index === 1 ? "March 10, 2024" :
                       index === 2 ? "December 19, 2024" :
                       "January 09, 2025"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-church-primary">
                    {index === 1 ? "Children Ministry Center Construction Commenced" :
                     index === 2 ? "Successful Community Outreach" :
                     "National 21 days Fasting and Prayers Ongoing"}
                  </h3>
                  <p className="text-church-text mb-4">
                    {index === 1 ? "We are excited to announce the commencement of the contruction of our new Children Ministry..." :
                     index === 2 ? "Join us in celebrating the success of our recent community outreach program..." :
                     "A time to seek the face of God as the year commences ..."}
                  </p>
                  <Button
                    variant="link"
                    className="text-church-primary hover:text-church-secondary p-0"
                  >
                    Read More →
                  </Button>
                </div>
              </motion.div>
            ))}
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
      <div id="contact">
        <FooterSection />
      </div>

      {/* ChatButton */}
      <ChatButton />
    </div>
  );
};

export default Index;
