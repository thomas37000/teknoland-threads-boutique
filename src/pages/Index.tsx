
import { useTranslation } from "react-i18next";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import CategorySection from "@/components/CategorySection";
// React Helmet provides a solution by allowing developers to update the head section as the content changes. 
// This ensures that each "page" in the SPA has the correct title and meta tags, 
// improving the user experience and making the pages more shareable on social media
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { t } = useTranslation();

  // SEO values
  const title = "Teknoland Threads Boutique – Modern Style & Comfort";
  const description = "Découvrez la collection Teknoland : vêtements tech, fashion et accessoires haut de gamme. Qualité, innovation et tendances pour tous. Livraison gratuite et retours faciles !";
  const canonicalUrl = "https://teknoland.lovable.app/";
  const ogImage = "https://lovable.dev/opengraph-image-p98pqg.png";

  return (
    <div>
      {/* head meta section */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        {/* Open Graph */}
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={description}/>
        <meta property="og:url" content={canonicalUrl}/>
        <meta property="og:type" content="website"/>
        <meta property="og:image" content={ogImage}/>
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={title}/>
        <meta name="twitter:description" content={description}/>
        <meta name="twitter:image" content={ogImage}/>
      </Helmet>
      
      <main>
        <Hero />
        <FeaturedProducts />
        <CategorySection />

        {/* Newsletter Section */}
        <section className="py-16 bg-tekno-blue text-white">
          <div className="tekno-container text-center">
            <h2 className="text-3xl font-bold mb-4">{t('home.newsletterTitle')}</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              {t('home.newsletterDesc')}
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto" aria-label="Newsletter">
              <input 
                type="email" 
                placeholder={t('home.emailPlaceholder')}
                className="px-4 py-3 rounded-l-md w-full text-tekno-black focus:outline-none"
                aria-label={t('home.emailPlaceholder')}
              />
              <button 
                type="submit"
                className="mt-2 sm:mt-0 px-6 py-3 bg-tekno-black text-white font-medium rounded-r-md sm:rounded-l-none rounded-l-md hover:bg-opacity-80 transition-colors"
              >
                {t('home.subscribe')}
              </button>
            </form>
          </div>
        </section>
        
        {/* Brand Features */}
        <section className="py-16">
          <div className="tekno-container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-tekno-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg aria-label="Qualité Premium" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <title>Premium Quality Icon</title>
                    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6.1c.3 0 .58-.13.77-.37L10 6.5v11.27a2.32 2.32 0 0 0-1 1.81c0 1.3 1.91 2.42 4 2.42s4-1.12 4-2.42c0-.76-.36-1.44-1-1.8V6.5l3.13 3.13c.19.24.47.37.77.37h2.25a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">{t('home.premiumQuality')}</h3>
                <p className="text-tekno-gray">
                  {t('home.premiumQualityDesc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-tekno-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg aria-label="Paiement Sécurisé" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <title>Secure Payment Icon</title>
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">{t('home.securePayment')}</h3>
                <p className="text-tekno-gray">
                  {t('home.securePaymentDesc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-tekno-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg aria-label="Retours et remboursements" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <title>Returns Icon</title>
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl mb-2">{t('home.returns')}</h3>
                <p className="text-tekno-gray">
                  {t('home.returnsDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
