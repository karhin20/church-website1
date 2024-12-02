import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Church, Users, Heart, MessageCircle, Menu, X } from "lucide-react";
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