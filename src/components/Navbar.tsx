
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, signOut, isAdmin, userRole } = useAuth();
  const { t } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="tekno-container flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-tekno-black">
          Teknoland Clothes
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
          {isAdmin && (
            <Link to="/admin" className="font-medium hover:text-tekno-blue transition-colors">
              {t('nav.admin')}
            </Link>
          )}
          {userRole === 'seller' && (
            <Link to="/seller" className="font-medium hover:text-tekno-blue transition-colors">
              {t('nav.seller')}
            </Link>
          )}
          <Link to="/" className="font-medium hover:text-tekno-blue transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/shop" className="font-medium hover:text-tekno-blue transition-colors">
            {t('nav.shop')}
          </Link>
          <Link to="/contact" className="font-medium hover:text-tekno-blue transition-colors">
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Language Selector, Cart and Profile Buttons */}
        <div className="hidden md:flex items-center gap-4 mt-1">
          <LanguageSelector />
          
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User size={24} />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut size={24} />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                {t('nav.login')}
              </Button>
            </Link>
          )}

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart size={24} />
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
              {t('nav.home')}
            </Link>
            <Link
              to="/shop"
              className="py-3 border-b font-medium"
              onClick={toggleMenu}
            >
              {t('nav.shop')}
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
              className="py-3 border-b font-medium"
              onClick={toggleMenu}
            >
              {t('nav.contact')}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="py-3 border-b font-medium text-tekno-blue"
                onClick={toggleMenu}
              >
                {t('nav.admin')}
              </Link>
            )}

            {userRole === 'seller' && (
              <Link
                to="/seller"
                className="py-3 border-b font-medium text-tekno-blue"
                onClick={toggleMenu}
              >
                {t('nav.seller')}
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="py-3 border-b font-medium"
                  onClick={toggleMenu}
                >
                  {t('nav.profile')}
                </Link>
                <button
                  className="py-3 border-b font-medium text-left"
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="py-3 border-b font-medium"
                onClick={toggleMenu}
              >
                {t('nav.login')}
              </Link>
            )}

            <div className="mt-4 flex items-center justify-between">
              <LanguageSelector />
              <Link to="/cart" onClick={toggleMenu}>
                <Button className="bg-tekno-blue text-white hover:bg-tekno-blue/90">
                  <ShoppingCart size={18} className="mr-2" />
                  {t('nav.viewCart')} ({cartItems.length})
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
