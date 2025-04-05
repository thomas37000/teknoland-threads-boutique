
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-tekno-black text-white mt-16">
      <div className="tekno-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TEKNOLAND</h3>
            <p className="text-tekno-gray">
              Fashion-forward clothing with a tech-inspired aesthetic.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-tekno-gray hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=tshirts" className="text-tekno-gray hover:text-white transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=hoodies" className="text-tekno-gray hover:text-white transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-tekno-gray hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-tekno-gray hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-tekno-gray hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-tekno-gray hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-tekno-gray hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <p className="text-tekno-gray mb-4">
              Subscribe to our newsletter for updates and promotions
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="px-3 py-2 bg-white/10 rounded-l-md text-white w-full"
              />
              <button 
                type="button" 
                className="px-4 py-2 bg-tekno-blue text-white rounded-r-md hover:bg-tekno-blue/90 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-tekno-gray">
          <p>© {currentYear} Teknoland Clothes. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
