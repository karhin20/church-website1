import { Facebook, Youtube, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-church-primary z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Text */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/pictures/logo.png" 
              alt="TAC Logo" 
              className="h-9 w-auto"
            />
            <div className="text-white">
              <div className="font-bold text-sm leading-tight">
                <span className="hidden sm:inline">The Apostolic Church-Ghana</span>
                <span className="sm:hidden">TAC-GH</span>
              </div>
              <div className="text-xs text-church-secondary font-bold">
                <span className="hidden sm:inline">Nii Boiman Central</span>
                <span className="sm:hidden">NBC</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-church-secondary transition-colors">Home</Link>
            <Link to="/hymns" className="text-white hover:text-church-secondary transition-colors">TAC Hymns</Link>
            <Link to="/sermons" className="text-white hover:text-church-secondary transition-colors">Sermons</Link>
            <Link to="/events" className="text-white hover:text-church-secondary transition-colors">Events</Link>
            <Link to="/contact" className="text-white hover:text-church-secondary transition-colors">Contact</Link>
          </div>

          {/* Social Media Links - Always Visible */}
          <div className="flex items-center space-x-4">
            <a
              href="https://facebook.com/tac.niiboimancentral"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-church-secondary transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com/@TAC-NIIBOIMAN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-church-secondary transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@niiboimanCENTRAL"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-church-secondary transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white ml-4"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden absolute left-0 right-0 bg-church-primary border-t border-white/10`}
        >
          <div className="flex flex-col px-4 py-4 space-y-4">
            <Link 
              to="/" 
              className="text-white hover:text-church-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/hymns" 
              className="text-white hover:text-church-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              TAC Hymns
            </Link>
            <Link 
              to="/sermons" 
              className="text-white hover:text-church-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sermons
            </Link>
            <Link 
              to="/events" 
              className="text-white hover:text-church-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-church-secondary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};