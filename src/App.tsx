import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/hooks/use-cart";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { AuthProvider } from "@/hooks/use-auth";
import { Client } from "@/types";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import SellerPage from "./pages/SellerPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import VendorStorePage from "./pages/VendorStorePage";
import NewsletterConfirmPage from "./pages/NewsletterConfirmPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FavoritesSlider from "./components/FavoritesSlider";
import CookieConsent from "./components/CookieConsent";
// Import the Tabs component
import "@/components/ui/tabs";
// Initialize i18n
import "./i18n/config";

import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      {/* SEO context provider */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <BrowserRouter>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/product/:category/:slug" element={<ProductPage />} />
                        <Route path="/vendor/:vendorId" element={<VendorStorePage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/payment-success" element={<PaymentSuccessPage />} />
                        <Route 
                          path="/admin" 
                          element={
                            <AdminRoute>
                              <AdminPage />
                            </AdminRoute>
                          } 
                        />
                        <Route 
                          path="/seller" 
                          element={
                            <ProtectedRoute>
                              <SellerPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/profile" 
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/newsletter/confirm" element={<NewsletterConfirmPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <FavoritesSlider />
                    <Footer />
                    <CookieConsent />
                  </div>
                </BrowserRouter>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
