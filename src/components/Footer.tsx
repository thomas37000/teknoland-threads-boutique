
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tekno-black text-white mt-16">
      <div className="tekno-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Teknoland Clothes</h3>
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
                  Sweats
                </Link>
              </li>
              <li>
                <Link to="/shop?category=vinyls" className="text-tekno-gray hover:text-white transition-colors">
                  Vinyles
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

          <div className="flex flex-col md:flex-row justify-between items-center text-tekno-gray">
            <a href="https://www.facebook.com/teknolandProd/" target="_blank" rel="noreferrer noopener" className="mr-1">
              <span className="[&>svg]:h-5 [&>svg]:w-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 320 512">

                  <path
                    d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
                </svg>
              </span>
            </a>

            <a href="https://soundcloud.com/teknolandproduction" target="_blank" rel="noreferrer noopener" className="ml-1 mr-1">
              Bandcamp
            </a>

            <a href="https://www.instagram.com/teknolandproduction/" target="_blank" rel="noreferrer noopener" className="ml-1 mr-1">
              <span className="[&>svg]:h-5 [&>svg]:w-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 448 512">
                  <path
                    d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </span>
            </a>

            <a href="https://www.discogs.com/fr/label/1625918-Teknoland-Production" target="_blank" rel="noreferrer noopener" className="ml-1">
              Discogs
            </a>
          </div>

          {/* <Link to="/#" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/#" className="hover:text-white transition-colors">
            Terms of Service
          </Link> */}
        </div>
      </div>

    </footer>
  );
};

export default Footer;
