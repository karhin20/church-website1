import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Church, 
  Users, 
  Heart, 
  MessageCircle, 
  Play, 
  Download, 
  Calendar, 
  Facebook, 
  Youtube, 
  Map, 
  Phone, 
  Mail, 
  X
} from "lucide-react";
import { Navigation } from "@/components/sections/Navigation";
import { UpcomingEvents } from "@/components/sections/UpcomingEvents";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Index = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = ["/pictures/banner1.jpg", "/pictures/banner2.jpg"];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-church-background">
      <Navigation />

      {/* Hero Section with Carousel */}
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
          <Link to="/chat" className="animate-fade-in delay-300">
            <Button className="bg-church-secondary hover:bg-church-secondary/90 text-church-primary px-8 py-6 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105">
              Chat with Aposor Kofi
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-church-background">
        <div className="container mx-auto grid md:grid-cols-3 gap-12 px-4">
          {/* Worship */}
          <div className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-xl bg-white shadow-lg border border-gray-100">
            <div className="flex justify-center mb-6">
              <Church className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-church-primary">WORSHIP</h3>
            <p className="text-church-text leading-relaxed">
              Join us for spirit-filled worship services every Sunday and Wednesday.
            </p>
          </div>

          {/* Connect */}
          <div className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-xl bg-white shadow-lg border border-gray-100">
            <div className="flex justify-center mb-6">
              <Users className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-church-primary">CONNECT</h3>
            <p className="text-church-text leading-relaxed">
              Be part of our vibrant community through various fellowship programs.
            </p>
          </div>

          {/* God's Love */}
          <div className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-xl bg-white shadow-lg border border-gray-100">
            <div className="flex justify-center mb-6">
              <Heart className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-church-primary">GOD'S LOVE</h3>
            <p className="text-church-text leading-relaxed">
              Experience and share the transforming love of God in our community.
            </p>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">Announcements</h2>
          <p className="text-center text-church-text mb-12">Stay updated with our latest announcements</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                 src="https://www.youtube.com/embed/EB1NpZejEUo" 
                 title="Annual Fundraising" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
              ></iframe>
            </div>

            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src="https://www.youtube.com/embed/qWySWBN_Wj0" 
                title="Annual Harvest"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <UpcomingEvents />

      {/* Latest Sermons Section */}
      <section className="py-24 bg-church-primary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Latest Sermons</h2>
          <p className="text-center text-church-accent mb-12">Listen to our most recent messages</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">The Power of Faith</h3>
              <p className="text-church-accent mb-4">Pastor Ebo Ansah Awotwi • March 1, 2024</p>
              <div className="flex justify-between items-center">
                <Button variant="outline" className="bg-church-secondary text-church-primary hover:bg-church-secondary/90">
                  <Play className="w-4 h-4 mr-2" /> Listen
                </Button>
                <Button variant="outline" className="bg-transparent border-church-secondary text-church-secondary hover:bg-church-secondary/10">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">Walking in Divine Grace</h3>
              <p className="text-church-accent mb-4">Apostle J. K. Atinyo • March 2, 2024</p>
              <div className="flex justify-between items-center">
                <Button variant="outline" className="bg-church-secondary text-church-primary hover:bg-church-secondary/90">
                  <Play className="w-4 h-4 mr-2" /> Listen
                </Button>
                <Button variant="outline" className="bg-transparent border-church-secondary text-church-secondary hover:bg-church-secondary/10">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">The Spirit of Excellence</h3>
              <p className="text-church-accent mb-4">Pastor Richard Mensah • March 3, 2024</p>
              <div className="flex justify-between items-center">
                <Button variant="outline" className="bg-church-secondary text-church-primary hover:bg-church-secondary/90">
                  <Play className="w-4 h-4 mr-2" /> Listen
                </Button>
                <Button variant="outline" className="bg-transparent border-church-secondary text-church-secondary hover:bg-church-secondary/10">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-24 bg-church-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-church-primary mb-4">Latest News</h2>
          <p className="text-center text-church-text mb-12">Stay updated with our church community</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((news) => (
              <div key={news} className="bg-white rounded-lg shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
                <img 
                  src={`/pictures/community${news}.jpg`} 
                  alt="Church news" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-church-secondary mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">March {news}, 2024</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-church-primary">Community Outreach Success</h3>
                  <p className="text-church-text mb-4">Join us in celebrating the success of our recent community outreach program...</p>
                  <Button variant="link" className="text-church-primary hover:text-church-secondary p-0">
                    Read More →
                  </Button>
                </div>
              </div>
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

      {/* Footer Section */}
      <footer className="bg-church-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Map className="w-5 h-5 mr-3 text-church-secondary" />
                  <p>Nii Boiman West Road, Accra, Ghana</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-church-secondary" />
                  <p>+233 24 123 4567</p>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-church-secondary" />
                  <p>info@tacniiboiman.org</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/about" className="block hover:text-church-secondary transition-colors">About Us</Link>
                <Link to="/sermons" className="block hover:text-church-secondary transition-colors">Sermons</Link>
                <Link to="/events" className="block hover:text-church-secondary transition-colors">Events</Link>
                <Link to="/contact" className="block hover:text-church-secondary transition-colors">Contact</Link>
              </div>
            </div>

            {/* Map and Social Links */}
            <div>
              <h3 className="text-xl font-bold mb-6">Location & Social Media</h3>
              {/* Google Maps Embed */}
              <div className="mb-6 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.7358124867687!2d-0.2572909243561401!3d5.605986433143636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9907a958ff31%3A0x6bf8d0c7685caae6!2sThe%20Apostolic%20Church%20Nii%20Boiman%20Assembly!5e0!3m2!1sen!2sgh!4v1733188166229!5m2!1sen!2sgh"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/tacniiboiman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-church-secondary text-church-primary p-2 rounded-full hover:bg-church-secondary/90 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com/@tacniiboiman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-church-secondary text-church-primary p-2 rounded-full hover:bg-church-secondary/90 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="https://tiktok.com/@tacniiboiman"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-church-secondary text-church-primary p-2 rounded-full hover:bg-church-secondary/90 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} The Apostolic Church - Ghana, Nii Boiman Central Assembly. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
