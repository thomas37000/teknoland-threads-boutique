
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-tekno-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-tekno-black via-tekno-black/70 to-transparent" /> */}
        <div className="bg-custom-bg bg-cover bg-center w-full h-64"></div>
      </div>

      <div className="tekno-container py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
            {t('hero.title')} <span className="text-tekno-blue"></span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop">
              <Button size="lg" className="bg-tekno-blue text-white hover:bg-tekno-blue/90 w-full sm:w-auto">
                {t('hero.shopButton')}
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white text-tekno-black hover:bg-white/90 hover:text-tekno-black w-full sm:w-auto">
                {t('hero.aboutButton')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
