import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Church, Users, Heart, MessageCircle, Menu, X, Play, Download, Calendar } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-church-background">
      {/* Navigation */}
      <nav className="bg-church-primary text-white p-4 fixed w-full top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <Church className="mr-2 h-6 w-6 text-church-secondary" />
            <span className="hidden sm:inline">The Apostolic Church - Gh</span>
            <span className="sm:hidden">TAC-Gh</span>
          </h1>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white hover:text-church-secondary transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Home</a>
            <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">About</a>
            <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Ministries</a>
            <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Contact</a>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-church-primary/95 backdrop-blur-sm md:hidden z-50 animate-fade-in">
            <div className="flex flex-col items-center py-6 space-y-6">
              <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Home</a>
              <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">About</a>
              <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Ministries</a>
              <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-r from-church-primary to-purple-900 text-white mt-16">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-sm uppercase tracking-wider mb-4 text-church-secondary font-semibold animate-fade-in">Welcome to The Apostolic Church</h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight animate-fade-in delay-100">
            PERFECT CHURCH FOR<br />IMPERFECT PEOPLE
          </h1>
          <p className="max-w-2xl mb-10 text-lg text-gray-200 animate-fade-in delay-200">
            Join us in worship at Nii Boiman Central as we grow together in faith and community.
          </p>
          <Link to="/chat" className="animate-fade-in delay-300">
            <Button className="bg-church-secondary hover:bg-church-secondary/90 text-church-primary px-8 py-6 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105">
              Chat With Us
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-church-background">
        <div className="container mx-auto grid md:grid-cols-3 gap-12 px-4">
          {/* Worship */}
          <div className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-lg bg-white shadow-lg">
            <div className="flex justify-center mb-6">
              <Church className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-church-primary">WORSHIP</h3>
            <p className="text-church-text leading-relaxed">
              Join us for spirit-filled worship services every Sunday and Wednesday.
            </p>
          </div>

          {/* Connect */}
          <div className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-lg bg-white shadow-lg">
            <div className="flex justify-center mb-6">
              <Users className="w-16 h-16 text-church-secondary group-hover:text-church-primary transition-colors duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-church-primary">CONNECT</h3>
            <p className="text-church-text leading-relaxed">
              Be part of our vibrant community through various fellowship programs.
            </p>
          </div>

          {/* God's Love */}
          <div className="text-center group hover:scale-105 transition-transform duration-300 p-8 rounded-lg bg-white shadow-lg">
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

      {/* Latest Sermons Section */}
      <section className="py-24 bg-church-primary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Latest Sermons</h2>
          <p className="text-center text-church-accent mb-12">Listen to our most recent messages</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((sermon) => (
              <div key={sermon} className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-2">The Power of Faith</h3>
                <p className="text-church-accent mb-4">Pastor John Doe • March {sermon}, 2024</p>
                <div className="flex justify-between items-center">
                  <Button variant="outline" className="bg-church-secondary text-church-primary hover:bg-church-secondary/90">
                    <Play className="w-4 h-4 mr-2" /> Listen
                  </Button>
                  <Button variant="outline" className="bg-transparent border-church-secondary text-church-secondary hover:bg-church-secondary/10">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            ))}
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
                  src={`https://images.unsplash.com/photo-1473177104440-${news}`} 
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
              "1473177104440",
              "1494891848038",
              "1551038247",
              "1524230572899",
              "1433832597046",
              "1493397212122",
              "1466442929976",
              "1492321936769"
            ].map((imageId) => (
              <div key={imageId} className="relative group overflow-hidden rounded-lg aspect-square">
                <img
                  src={`https://images.unsplash.com/photo-${imageId}`}
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
