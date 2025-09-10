
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
                <Link to="/shop?category=all" className="text-tekno-gray hover:text-white transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/shop?category=t-shirts" className="text-tekno-gray hover:text-white transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=sweats" className="text-tekno-gray hover:text-white transition-colors">
                  Sweats
                </Link>
              </li>
              <li>
                <Link to="/shop?category=vinyles" className="text-tekno-gray hover:text-white transition-colors">
                  Vinyles
                </Link>
              </li>
              <li>
                <Link to="/shop?category=stickers" className="text-tekno-gray hover:text-white transition-colors">
                  Stickers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-tekno-gray hover:text-white transition-colors">
                  À propos
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

            <a href="https://teknolandproduction.bandcamp.com/music" target="_blank" rel="noreferrer noopener" className="ml-1 mr-1">
              <span className="[&>svg]:h-5 [&>svg]:w-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    d="m0 18.75 7.437-13.5H24l-7.438 13.5H0z" />
                </svg>
              </span>
            </a>

            <a href="https://soundcloud.com/teknolandproduction" target="_blank" rel="noreferrer noopener" className="ml-1 mr-1 mt-2">
              <span className="[&>svg]:h-5 [&>svg]:w-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path
                    d='M19.982 6.362c-.08-1.218-1.032-2.196-2.194-2.255a2.22 2.22 0 0 0-1.222.292C16.518 1.974 14.632.023 12.311.023c-.615 0-1.198.137-1.725.382a.332.332 0 0 0-.186.303v7.925c0 .183.142.332.316.332h6.957c1.333 0 2.402-1.183 2.31-2.603zM9.785.536a.326.326 0 0 0-.318.334v7.752c0 .184.142.334.318.334.175 0 .318-.15.318-.334V.87a.326.326 0 0 0-.318-.334zM8.733 1.36a.326.326 0 0 0-.318.334v6.928c0 .184.143.334.318.334.176 0 .318-.15.318-.334V1.694a.326.326 0 0 0-.318-.334zM7.681 1.736a.326.326 0 0 0-.318.334v6.552c0 .184.143.334.318.334.176 0 .318-.15.318-.334V2.07a.326.326 0 0 0-.318-.334zM6.63 1.235a.326.326 0 0 0-.319.334v7.053c0 .184.143.334.318.334.176 0 .318-.15.318-.334V1.57a.326.326 0 0 0-.318-.334zM5.577 1.569a.326.326 0 0 0-.318.334v6.72c0 .183.143.333.318.333.176 0 .318-.15.318-.334v-6.72a.326.326 0 0 0-.318-.333zM4.525 2.237a.326.326 0 0 0-.317.334v6.051c0 .184.142.334.317.334.176 0 .318-.15.318-.334V2.571a.326.326 0 0 0-.318-.334zM3.474 3.53a.326.326 0 0 0-.318.334v4.758c0 .184.142.334.318.334.175 0 .317-.15.317-.334V3.864a.326.326 0 0 0-.317-.333zM2.422 4.073a.326.326 0 0 0-.318.334v4.215c0 .184.142.334.318.334.175 0 .318-.15.318-.334V4.407a.326.326 0 0 0-.318-.334zM1.37 4.198a.326.326 0 0 0-.318.333v3.967c0 .184.142.333.318.333.175 0 .318-.15.318-.333V4.53a.326.326 0 0 0-.318-.333zM.318 5.07A.326.326 0 0 0 0 5.402v2.285c0 .185.142.334.318.334.175 0 .318-.15.318-.334V5.403a.326.326 0 0 0-.318-.334z' />
                </svg>
              </span>
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
              <span className="[&>svg]:h-5 [&>svg]:w-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M1.742 11.982c0-5.668 4.61-10.278 10.276-10.278 1.824 0 3.537.48 5.025 1.317l.814-1.488A11.914 11.914 0 0 0 12.19.003h-.195C5.41.013.072 5.31 0 11.885V12a11.983 11.983 0 0 0 3.775 8.72l1.185-1.28a10.249 10.249 0 0 1-3.218-7.459zm18.62-8.577-1.154 1.24a10.25 10.25 0 0 1 3.088 7.337c0 5.666-4.61 10.276-10.276 10.276-1.783 0-3.46-.456-4.922-1.258l-.854 1.522A11.946 11.946 0 0 0 12 23.998c6.626 0 12.001-5.373 12.001-12a11.977 11.977 0 0 0-3.638-8.593zM1.963 11.982a10.03 10.03 0 0 0 3.146 7.295l1.18-1.276a8.295 8.295 0 0 1-2.586-6.019c0-4.586 3.73-8.315 8.315-8.315 1.483 0 2.875.391 4.082 1.075l.835-1.526a9.973 9.973 0 0 0-4.917-1.289C6.475 1.925 1.963 6.437 1.963 11.982zm18.37 0c0 4.586-3.73 8.315-8.315 8.315a8.273 8.273 0 0 1-3.962-1.005l-.852 1.516a10.006 10.006 0 0 0 4.814 1.229c5.543 0 10.055-4.512 10.055-10.055 0-2.808-1.157-5.347-3.017-7.173l-1.183 1.274a8.282 8.282 0 0 1 2.46 5.899zm-1.948 0a6.37 6.37 0 0 1-6.365 6.364 6.329 6.329 0 0 1-3.006-.756l-.848 1.507a8.039 8.039 0 0 0 3.854.977c4.464 0 8.095-3.63 8.095-8.094a8.07 8.07 0 0 0-2.39-5.738l-1.179 1.267a6.356 6.356 0 0 1 1.839 4.473zm-14.459 0c0 2.301.967 4.382 2.515 5.858l1.173-1.27a6.344 6.344 0 0 1-1.96-4.588 6.37 6.37 0 0 1 6.364-6.364 6.32 6.32 0 0 1 3.144.835l.83-1.517a8.055 8.055 0 0 0-3.974-1.048c-4.461 0-8.092 3.63-8.092 8.094zm12.53 0a4.438 4.438 0 0 1-4.438 4.437 4.42 4.42 0 0 1-2.061-.509l-.835 1.488a6.114 6.114 0 0 0 2.896.727 6.149 6.149 0 0 0 6.143-6.143 6.123 6.123 0 0 0-1.768-4.308l-1.162 1.25a4.43 4.43 0 0 1 1.224 3.058zm-10.581 0a6.12 6.12 0 0 0 1.888 4.425l1.157-1.25.014.014a4.419 4.419 0 0 1-1.355-3.187 4.436 4.436 0 0 1 4.437-4.437 4.4 4.4 0 0 1 2.217.598l.82-1.498a6.097 6.097 0 0 0-3.037-.806c-3.384-.005-6.141 2.753-6.141 6.141zm6.68 0a.538.538 0 0 1-1.074 0 .537.537 0 1 1 1.075 0zm-3.94 0a3.4 3.4 0 1 1 6.801 0 3.4 3.4 0 0 1-6.8 0zm.149 0a3.256 3.256 0 0 0 3.252 3.252 3.255 3.255 0 0 0 3.254-3.252 3.253 3.253 0 1 0-6.506 0z" /></svg>
              </span></a>
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
