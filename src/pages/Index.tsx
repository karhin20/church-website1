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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-church-primary text-white p-4 relative">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">The Apostolic Church - Gh</h1>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-church-secondary">Home</a>
            <a href="#" className="hover:text-church-secondary">About</a>
            <a href="#" className="hover:text-church-secondary">Ministries</a>
            <a href="#" className="hover:text-church-secondary">Contact</a>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-church-primary md:hidden z-50">
            <div className="flex flex-col items-center py-4 space-y-4">
              <a href="#" className="hover:text-church-secondary">Home</a>
              <a href="#" className="hover:text-church-secondary">About</a>
              <a href="#" className="hover:text-church-secondary">Ministries</a>
              <a href="#" className="hover:text-church-secondary">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-church-primary to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-sm uppercase tracking-wider mb-4">Welcome to The Apostolic Church</h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            PERFECT CHURCH FOR<br />IMPERFECT PEOPLE
          </h1>
          <p className="max-w-2xl mb-8 text-lg">
            Join us in worship at Nii Boiman Central as we grow together in faith and community.
          </p>
          <Link to="/chat">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full">
              Chat With Us
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto grid md:grid-cols-3 gap-12 px-4">
          {/* Worship */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Church className="w-16 h-16 text-church-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">WORSHIP</h3>
            <p className="text-gray-600">
              Join us for spirit-filled worship services every Sunday and Wednesday.
            </p>
          </div>

          {/* Connect */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Users className="w-16 h-16 text-church-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">CONNECT</h3>
            <p className="text-gray-600">
              Be part of our vibrant community through various fellowship programs.
            </p>
          </div>

          {/* God's Love */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Heart className="w-16 h-16 text-church-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">GOD'S LOVE</h3>
            <p className="text-gray-600">
              Experience and share the transforming love of God in our community.
            </p>
          </div>
        </div>
      </section>

      {/* Chat Button (Fixed) */}
      <div className="fixed bottom-8 right-8">
        <Link to="/chat">
          <Button className="bg-church-primary hover:bg-church-primary/90 text-white rounded-full p-4">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;