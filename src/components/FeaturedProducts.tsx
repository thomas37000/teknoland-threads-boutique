
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  
  useEffect(() => {
    // Select a mix of products to feature including new shirts and hoodies
    const featuredItems = [
      products.find(p => p.id === "9"), // Cyber Grid Button-Up
      products.find(p => p.id === "14"), // Digital Bloom Tee
      products.find(p => p.id === "19"), // Matrix Code Hoodie
      products.find(p => p.id === "12"), // Tech Pioneer Denim Shirt
    ].filter(Boolean) as Product[];
    
    setFeatured(featuredItems);
  }, []);
  
  return (
    <section className="py-16">
      <div className="tekno-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-tekno-gray max-w-2xl">
              Discover our most popular designs and new arrivals.
            </p>
          </div>
          <Link to="/shop" className="mt-4 md:mt-0">
            <span className="text-tekno-blue hover:underline font-medium">
              View All Products →
            </span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
