
import { Link } from "react-router-dom";

const categories = [
  {
    id: "tshirts",
    name: "T-Shirts",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&h=600",
    link: "/shop?category=tshirts"
  },
  {
    id: "hoodies",
    name: "Hoodies",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&h=600",
    link: "/shop?category=hoodies"
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&h=600",
    link: "/shop?category=accessories"
  }
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-tekno-lightgray">
      <div className="tekno-container">
        <h2 className="text-3xl font-bold text-center mb-8">Shop By Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={category.link}
              className="group block relative overflow-hidden rounded-lg aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-tekno-black/50 group-hover:bg-tekno-black/30 transition-colors z-10" />
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <span className="inline-block border-b-2 border-tekno-blue pb-1 font-medium text-sm">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
