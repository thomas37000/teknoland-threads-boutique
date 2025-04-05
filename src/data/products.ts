
import { Product } from "@/types";

export const products: Product[] = [
  // Original products
  {
    id: "1",
    name: "Circuit Board Tee",
    description: "100% cotton t-shirt featuring our iconic circuit board design. Perfect for everyday wear with a futuristic look.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=600",
    category: "T-Shirts",
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Blue"]
  },
  {
    id: "3",
    name: "Quantum Wave T-Shirt",
    description: "Soft cotton tee with our exclusive quantum wave design. Makes a bold statement with any outfit.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=600",
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Blue", "Black"]
  },
  {
    id: "4",
    name: "Binary Code Cap",
    description: "Adjustable cotton cap featuring our signature binary code embroidery. One size fits most.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600",
    category: "Accessories",
    isNew: true
  },
  {
    id: "6",
    name: "Pixel Art Tee",
    description: "Classic fit tee featuring retro pixel art design. Made from organic cotton.",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=600",
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Black"]
  },
  {
    id: "7",
    name: "Tech Beanie",
    description: "Warm knitted beanie with subtle tech pattern. Perfect for colder days.",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600",
    category: "Accessories"
  },
  {
    id: "8",
    name: "Digital Nomad Backpack",
    description: "Water-resistant backpack with multiple compartments for all your tech needs.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600",
    category: "Accessories",
    isNew: true
  },
  
  // Men's Shirts - 5 new items
  {
    id: "9",
    name: "Cyber Grid Button-Up",
    description: "Stylish button-up shirt with subtle tech grid pattern. Perfect for both casual and semi-formal occasions.",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?auto=format&fit=crop&w=800&h=600",
    category: "Men's Shirts",
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy", "White", "Dark Gray"]
  },
  {
    id: "10",
    name: "Digital Matrix Oxford",
    description: "Classic oxford shirt with our signature digital matrix pattern. Business-casual with a tech twist.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1573766707566-14de00312558?auto=format&fit=crop&w=800&h=600",
    category: "Men's Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Blue", "White", "Black"]
  },
  {
    id: "11",
    name: "Binary Code Flannel",
    description: "Warm and comfortable flannel shirt featuring a subtle binary code pattern. Perfect for cooler days.",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&h=600",
    category: "Men's Shirts",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Red/Black", "Blue/Black", "Green/Black"]
  },
  {
    id: "12",
    name: "Tech Pioneer Denim Shirt",
    description: "Durable denim shirt with subtle tech-inspired embroidery. Versatile and stylish for any casual occasion.",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&h=600",
    category: "Men's Shirts",
    isNew: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Wash", "Dark Wash"]
  },
  {
    id: "13",
    name: "Circuit Board Cuban",
    description: "Relaxed fit Cuban collar shirt with our signature circuit board pattern. Perfect for summer days.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&h=600",
    category: "Men's Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Teal"]
  },
  
  // Women's T-shirts - 5 new items
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
  
  // New Hoodies - 5 items
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
  }
];
