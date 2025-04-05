
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-tekno-black text-white py-16 md:py-24">
        <div className="tekno-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Teknoland</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Where technology meets fashion. Innovating the future of clothing since 2023.
          </p>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-16">
        <div className="tekno-container">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&h=600" 
                alt="Teknoland team working"
                className="rounded-lg w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-tekno-gray mb-4">
                Teknoland Clothes was founded by a group of tech enthusiasts who also had a passion for fashion. We saw a gap in the market for clothing that truly represented the digital age we live in.
              </p>
              <p className="text-tekno-gray mb-4">
                What started as a small online store run from a garage has grown into a brand recognized for its unique designs and quality materials. We're proud to blend the worlds of technology and apparel in ways that inspire and excite.
              </p>
              <p className="text-tekno-gray">
                Our mission is to create clothing that not only looks great but also represents the innovative spirit of the tech community. Each piece tells a story of digital creativity and forward-thinking design.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-16 bg-tekno-lightgray">
        <div className="tekno-container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-tekno-blue rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3">Innovation</h3>
              <p className="text-tekno-gray">
                We embrace new technologies and techniques to create unique clothing that pushes the boundaries of fashion.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-tekno-blue rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3">Quality</h3>
              <p className="text-tekno-gray">
                We source premium materials and partner with ethical manufacturers to ensure our products are built to last.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-tekno-blue rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3">Community</h3>
              <p className="text-tekno-gray">
                We support and celebrate the tech community, collaborating with designers and developers to create authentic products.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16">
        <div className="tekno-container text-center">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-tekno-gray max-w-2xl mx-auto mb-12">
            The creative minds behind Teknoland Clothes. A diverse group of designers, developers, and fashion experts.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Team members would go here */}
            <div className="team-member">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold">Alex Chen</h3>
              <p className="text-tekno-gray">Founder & CEO</p>
            </div>
            <div className="team-member">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold">Jamie Smith</h3>
              <p className="text-tekno-gray">Lead Designer</p>
            </div>
            <div className="team-member">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold">Morgan Lee</h3>
              <p className="text-tekno-gray">Tech Director</p>
            </div>
            <div className="team-member">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold">Taylor Kim</h3>
              <p className="text-tekno-gray">Marketing Lead</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-tekno-blue text-white">
        <div className="tekno-container text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Teknoland Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be the first to know about new product launches, exclusive deals, and tech fashion trends.
          </p>
          <Link to="/shop">
            <Button className="bg-white text-tekno-blue hover:bg-gray-100">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
