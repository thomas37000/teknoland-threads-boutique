import { Product } from "@/types";

export const products: Product[] = [
  // Men's T-Shirtss - removing requested items (9, 11, 13) and keeping the others
  {
    id: "10",
    name: "Digital Matrix Oxford",
    description: "Classic oxford shirt with our signature digital matrix pattern. Business-casual with a tech twist.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1573766707566-14de00312558?auto=format&fit=crop&w=800&h=600",
    category: "Man's T-Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Blue", "White", "Black"]
  },
  {
    id: "12",
    name: "Tech Pioneer Denim Shirt",
    description: "Durable denim shirt with subtle tech-inspired embroidery. Versatile and stylish for any casual occasion.",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&h=600",
    category: "Man's T-Shirts",
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Wash", "Dark Wash"]
  },
  
  // Women's T-shirts - 5 items
  {
    id: "14",
    name: "Digital Bloom Tee",
    description: "Soft, fitted t-shirt with our unique digital bloom design. Perfect blend of tech and nature-inspired aesthetics.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&h=600",
    category: "Women's T-Shirts",
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Purple", "Teal", "White"]
  },
  {
    id: "15",
    name: "Virtual Reality V-neck",
    description: "Stylish V-neck featuring abstract VR-inspired graphics. Made from premium soft cotton blend.",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=800&h=600",
    category: "Women's T-Shirts",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "White", "Pink"]
  },
  {
    id: "16",
    name: "Pixel Heart Relaxed Tee",
    description: "Relaxed fit tee with our pixel heart design. Comfortable and perfect for everyday wear.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&h=600",
    category: "Women's T-Shirts",
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Black", "Gray"]
  },
  {
    id: "17",
    name: "Cyberpunk Crop Top",
    description: "Modern crop top tee with futuristic cyberpunk-inspired graphics. Made from stretchy, comfortable fabric.",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&h=600",
    category: "Women's T-Shirts",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Neon Blue", "Neon Pink", "Black"]
  },
  {
    id: "18",
    name: "Algorithm Long Sleeve Tee",
    description: "Comfortable long sleeve tee with subtle algorithm pattern design. Perfect for cooler days or layering.",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&h=600",
    category: "Women's T-Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Gray", "Navy"]
  },
  
  // Hoodies - 5 items
  {
    id: "19",
    name: "Matrix Code Hoodie",
    description: "Premium oversized hoodie with flowing matrix code pattern. Made from soft cotton blend for ultimate comfort.",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&h=600",
    category: "Hoodies",
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Dark Green", "Navy"]
  },
  {
    id: "20",
    name: "Digital Wave Pullover",
    description: "Lightweight pullover hoodie with abstract digital wave pattern. Perfect for layering in any season.",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1579572331145-5e53b299c64e?auto=format&fit=crop&w=800&h=600",
    category: "Hoodies",
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Blue", "Purple"]
  },
  {
    id: "21",
    name: "Cyber Circuit Zip-Up",
    description: "Full-zip hoodie with embroidered circuit pattern. Features convenient side pockets and adjustable hood.",
    price: 74.99,
    image: "https://images.unsplash.com/photo-1578681041175-9717c638d482?auto=format&fit=crop&w=800&h=600",
    category: "Hoodies",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Red"]
  },
  {
    id: "22",
    name: "Tech Minimalist Hoodie",
    description: "Clean, minimalist design with subtle tech-inspired details. Made from organic cotton for eco-conscious comfort.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&h=600",
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Gray", "Sand"]
  },
  {
    id: "23",
    name: "Binary Oversized Hoodie",
    description: "Trendy oversized fit with binary code pattern. Features dropped shoulders and extra-long sleeves.",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=800&h=600",
    category: "Hoodies",
    isNew: true,
    sizes: ["S/M", "L/XL", "XXL"],
    colors: ["Black", "Charcoal", "Dark Blue"]
  },
  // Vinyls
  {
    id: "24",
    name: "Teknoland 09",
    description: "Premium oversized hoodie with flowing matrix code pattern. Made from soft cotton blend for ultimate comfort.",
    price: 20.99,
    image: "https://f4.bcbits.com/img/0030996771_10.jpg",
    category: "Vinyls",
    isNew: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Dark Green", "Navy"]
  },
  {
    id: "25",
    name: "Doomland 02",
    description: "Lightweight pullover hoodie with abstract digital wave pattern. Perfect for layering in any season.",
    price: 25.99,
    image: "https://f4.bcbits.com/img/0030776803_10.jpg",
    category: "Vinyls",
    isNew: false,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Blue", "Purple"]
  },
  {
    id: "26",
    name: "Tribeland",
    description: "Full-zip hoodie with embroidered circuit pattern. Features convenient side pockets and adjustable hood.",
    price: 30.99,
    image: "https://f4.bcbits.com/img/a1258539820_10.jpg",
    category: "Vinyls",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Red"],
  },
  {
    id: "27",
    name: "Spiral Electric",
    description: "Premium oversized hoodie with flowing matrix code pattern. Made from soft cotton blend for ultimate comfort.",
    price: 23.99,
    image: "https://f4.bcbits.com/img/0036839488_10.jpg",
    category: "Vinyls",
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Dark Green", "Navy"]
  },
  {
    id: "28",
    name: "The Dark Side",
    description: "Lightweight pullover hoodie with abstract digital wave pattern. Perfect for layering in any season.",
    price: 19.99,
    image: "https://f4.bcbits.com/img/0034417410_10.jpg",
    category: "Vinyls",
    isNew: false,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "Blue", "Purple"]
  }
];
