
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="tekno-container flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-tekno-black">
          TEKNOLAND
        </Link>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="font-medium hover:text-tekno-blue transition-colors">
            Home
          </Link>
          <Link to="/shop" className="font-medium hover:text-tekno-blue transition-colors">
            Shop
          </Link>
          <Link to="/about" className="font-medium hover:text-tekno-blue transition-colors">
            About
          </Link>
          <Link to="/contact" className="font-medium hover:text-tekno-blue transition-colors">
            Contact
          </Link>
        </nav>
        
        {/* Cart Button */}
        <div className="hidden md:block">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag size={24} />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-tekno-blue text-white rounded-full">
                  {cartItems.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-white border-b animate-fade-in">
          <div className="tekno-container py-4 flex flex-col">
            <Link 
              to="/" 
              className="py-3 border-b font-medium"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className="py-3 border-b font-medium"
              onClick={toggleMenu}
            >
              Shop
            </Link>
            <Link 
              to="/about" 
              className="py-3 border-b font-medium"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="py-3 font-medium"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <div className="mt-4">
              <Link to="/cart" onClick={toggleMenu}>
                <Button className="w-full bg-tekno-blue text-white hover:bg-tekno-blue/90">
                  <ShoppingBag size={18} className="mr-2" />
                  View Cart ({cartItems.length})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
