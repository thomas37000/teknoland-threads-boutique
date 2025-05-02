
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Pour touter question vous pouvez nous contacter via le formulaire ci-dessous ou par email à teknolandproduction@gmail.com
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="tekno-container">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Contact Form */}
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold mb-6">Envoyez nous un message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Nom
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                      placeholder="Prénom Nom"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                      placeholder="prénom.nom@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-tekno-blue"
                  >
                    <option value="">Choissez un sujet</option>
                    <option value="order">Question sur une commande</option>
                    <option value="product">Question sur un produit</option>
                    <option value="return">Retournez un produit</option>
                    <option value="feedback">Amélioration du site</option>
                    <option value="other">Autre</option>
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
                    placeholder="Rédigez votre message selon le sujet séléctionné, nous répondrons dans les plus bref délais."
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    className="bg-tekno-blue text-white hover:bg-tekno-blue/90 px-8 py-3"
                  >
                    Envoyez
                  </Button>
                </div>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:w-1/3">
              <h2 className="text-3xl font-bold mb-6">Contact Info</h2>

              <div className="space-y-8">

                <div>
                  <h3 className="font-bold text-xl mb-2">Email :</h3>
                  <p className="text-tekno-gray mb-1">
                    teknolandproduction@gmail.com
                  </p>
                </div>

                <div className="pt-4">
                  <h3 className="font-bold text-xl mb-2">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/teknolandProd/" target="_blank" rel="noreferrer noopener" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Facebook</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </a>
                    <a href="https://www.instagram.com/teknolandproduction/" target="_blank" rel="noreferrer noopener" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Instagram</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a href="https://teknolandproduction.bandcamp.com/music" target="_blank" rel="noreferrer noopener" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Bandcamp</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg" fill="#f1f1f1"><path d="m0 18.75 7.437-13.5H24l-7.438 13.5H0z" /></svg>
                    </a>
                    <a href="https://soundcloud.com/teknolandproduction" target="_blank" rel="noreferrer noopener" className="w-10 h-10 rounded-full bg-tekno-black text-white flex items-center justify-center hover:bg-tekno-blue transition-colors">
                      <span className="sr-only">Soundcloud</span>
                      <svg fill="#f1f1f1" width="30" height="30" viewBox="-2 -7.5 24 24" xmlns="http://www.w3.org/2000/svg"><path d='M19.982 6.362c-.08-1.218-1.032-2.196-2.194-2.255a2.22 2.22 0 0 0-1.222.292C16.518 1.974 14.632.023 12.311.023c-.615 0-1.198.137-1.725.382a.332.332 0 0 0-.186.303v7.925c0 .183.142.332.316.332h6.957c1.333 0 2.402-1.183 2.31-2.603zM9.785.536a.326.326 0 0 0-.318.334v7.752c0 .184.142.334.318.334.175 0 .318-.15.318-.334V.87a.326.326 0 0 0-.318-.334zM8.733 1.36a.326.326 0 0 0-.318.334v6.928c0 .184.143.334.318.334.176 0 .318-.15.318-.334V1.694a.326.326 0 0 0-.318-.334zM7.681 1.736a.326.326 0 0 0-.318.334v6.552c0 .184.143.334.318.334.176 0 .318-.15.318-.334V2.07a.326.326 0 0 0-.318-.334zM6.63 1.235a.326.326 0 0 0-.319.334v7.053c0 .184.143.334.318.334.176 0 .318-.15.318-.334V1.57a.326.326 0 0 0-.318-.334zM5.577 1.569a.326.326 0 0 0-.318.334v6.72c0 .183.143.333.318.333.176 0 .318-.15.318-.334v-6.72a.326.326 0 0 0-.318-.333zM4.525 2.237a.326.326 0 0 0-.317.334v6.051c0 .184.142.334.317.334.176 0 .318-.15.318-.334V2.571a.326.326 0 0 0-.318-.334zM3.474 3.53a.326.326 0 0 0-.318.334v4.758c0 .184.142.334.318.334.175 0 .317-.15.317-.334V3.864a.326.326 0 0 0-.317-.333zM2.422 4.073a.326.326 0 0 0-.318.334v4.215c0 .184.142.334.318.334.175 0 .318-.15.318-.334V4.407a.326.326 0 0 0-.318-.334zM1.37 4.198a.326.326 0 0 0-.318.333v3.967c0 .184.142.333.318.333.175 0 .318-.15.318-.333V4.53a.326.326 0 0 0-.318-.333zM.318 5.07A.326.326 0 0 0 0 5.402v2.285c0 .185.142.334.318.334.175 0 .318-.15.318-.334V5.403a.326.326 0 0 0-.318-.334z' /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
