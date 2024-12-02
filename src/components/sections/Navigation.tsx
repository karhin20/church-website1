import { Church, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-church-primary text-white p-4 fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center">
          <Church className="mr-2 h-6 w-6 text-church-secondary" />
          <div className="flex flex-col items-start">
            <span className="hidden sm:inline">The Apostolic Church - Gh</span>
            <span className="sm:hidden">TAC-Gh</span>
            <span className="text-sm text-church-secondary font-medium">
              <span className="hidden sm:inline">Nii Boiman Central</span>
              <span className="sm:hidden">NBC</span>
            </span>
          </div>
        </h1>
        
        <button 
          className="md:hidden text-white hover:text-church-secondary transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="hidden md:flex space-x-8">
          <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Home</a>
          <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">About</a>
          <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Ministries</a>
          <a href="#" className="hover:text-church-secondary transition-colors duration-200 font-medium">Contact</a>
        </div>
      </div>

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
  );
};