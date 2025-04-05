
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategorySection from "@/components/CategorySection";

const Index = () => {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <CategorySection />
      
      {/* Newsletter Section */}
      <section className="py-16 bg-tekno-blue text-white">
        <div className="tekno-container text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter for exclusive deals, new product launches, and tech-inspired fashion tips.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-4 py-3 rounded-l-md w-full text-tekno-black focus:outline-none"
            />
            <button 
              type="button"
              className="mt-2 sm:mt-0 px-6 py-3 bg-tekno-black text-white font-medium rounded-r-md sm:rounded-l-none rounded-l-md hover:bg-opacity-80 transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      {/* Brand Features */}
      <section className="py-16">
        <div className="tekno-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-tekno-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6.1c.3 0 .58-.13.77-.37L10 6.5v11.27a2.32 2.32 0 0 0-1 1.81c0 1.3 1.91 2.42 4 2.42s4-1.12 4-2.42c0-.76-.36-1.44-1-1.8V6.5l3.13 3.13c.19.24.47.37.77.37h2.25a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Premium Quality</h3>
              <p className="text-tekno-gray">
                Crafted from the finest materials for durability and comfort.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tekno-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">Secure Payment</h3>
              <p className="text-tekno-gray">
                Multiple payment options with encrypted transaction security.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-tekno-black rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">30-Day Returns</h3>
              <p className="text-tekno-gray">
                Not completely satisfied? Return within 30 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
