import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import fbb from "./Img/fbb.png";
import { useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

interface NavBarProps {
  isTransparent?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ isTransparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  


  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { 
      label: 'Shop', 
      href: '/shop',
  
    },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Sell With Us', href: '/seller/dashboard' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getBgColor = () => {
    if (!isTransparent) return 'bg-black';
    return isScrolled ? 'bg-black' : 'bg-transparent';
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 h-24 ${getBgColor()} border-b border-gray-800/50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={fbb} 
              alt="FBB Luxury" 
              className="h-20 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity duration-300"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  <button
                    onClick={() => item.subItems ? toggleDropdown(item.label) : handleNavClick(item.href)}
                    className="text-white hover:text-gold-400 transition-all duration-300 px-3 py-2 text-sm font-medium flex items-center gap-1"
                  >
                    {item.label}
                    {item.subItems && <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {item.subItems && (
                    <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="bg-black/95 backdrop-blur-lg border border-gray-800 rounded-lg shadow-2xl py-3 min-w-[200px]">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.label}
                            onClick={() => handleNavClick(subItem.href)}
                            className="block w-full text-left px-6 py-3 text-white hover:text-gold-400 hover:bg-gray-900/50 transition-colors duration-200 text-sm"
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Icons */}
    

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gold-400 focus:outline-none transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute w-full bg-black/95 backdrop-blur-lg border-t border-gray-800">
          <div className="px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => item.subItems ? toggleDropdown(item.label) : handleNavClick(item.href)}
                  className="text-white hover:text-gold-400 block w-full text-left px-4 py-4 text-lg font-medium border-b border-gray-800 flex items-center justify-between"
                >
                  {item.label}
                  {item.subItems && <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />}
                </button>
                
                {item.subItems && activeDropdown === item.label && (
                  <div className="pl-8 py-2 bg-gray-900/50">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.label}
                        onClick={() => handleNavClick(subItem.href)}
                        className="text-gray-300 hover:text-gold-400 block w-full text-left px-4 py-3 text-sm transition-colors duration-200"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Icons */}
           
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;