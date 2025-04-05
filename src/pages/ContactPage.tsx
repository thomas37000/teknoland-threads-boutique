
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", formData);
    
    // Show success message
    toast.success("Message sent successfully! We'll get back to you soon.");
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-tekno-black text-white py-16">
        <div className="tekno-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>
      
      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="tekno-container">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium mb-2"
                    >
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium mb-2"
                    >
                      Your Email
                    </label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label 
                    htmlFor="subject" 
                    className="block text-sm font-medium mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="product">Product Question</option>
                    <option value="return">Return Request</option>
                    <option value="feedback">General Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <Button 
                    type="submit" 
                    className="bg-tekno-blue text-white hover:bg-tekno-blue/90 px-8 py-3"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-bold mb-6">Contact Info</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-xl mb-2">Address</h3>
                  <p className="text-tekno-gray">
                    123 Tech Avenue<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-xl mb-2">Contact</h3>
                  <p className="text-tekno-gray mb-1">
                    Email: info@teknoland.com
                  </p>
                  <p className="text-tekno-gray">
                    Phone: +1 (555) 123-4567
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-xl mb-2">Business Hours</h3>
                  <p className="text-tekno-gray mb-1">
                    Monday - Friday: 9AM - 6PM
                  </p>
                  <p className="text-tekno-gray">
                    Saturday: 10AM - 4PM
                  </p>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-bold text-xl mb-2">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Facebook</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Instagram</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Twitter</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-tekno-lightgray">
        <div className="tekno-container">
          <h2 className="text-3xl font-bold mb-8 text-center">Find Us</h2>
          <div className="h-96 bg-gray-300 rounded-lg w-full">
            {/* In a real app, you would integrate a Google Map or similar */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-tekno-gray">Map placeholder</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
