
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
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FavoritesSlider from "./components/FavoritesSlider";
// Import the Tabs component
import "@/components/ui/tabs";

const queryClient = new QueryClient();

const App = () => {
  const currentClient: Client = {
    id: "1",
    name: "Admin User",
    email: "admin@tekno.com",
    phone: "0000000000",
    address: "123 Admin St",
    totalOrders: 42,
    totalSpent: 9999,
    lastPurchase: "2025-04-01",
    accountStatus: "active",
    roles: "client",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <Navbar currentClient={currentClient} />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute>
                            <AdminPage />
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
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <FavoritesSlider />
                  <Footer />
                </div>
              </BrowserRouter>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
