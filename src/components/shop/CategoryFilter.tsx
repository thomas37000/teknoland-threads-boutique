
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories = [
    { key: "all", label: "Tous les produits" },
    { key: "t-shirts", label: "T-Shirts" },
    { key: "man", label: "T-shirts Homme" },
    { key: "women", label: "T-shirts Femme" },
    { key: "sweats", label: "Sweats" },
    { key: "accessories", label: "Accessoires" },
    { key: "vinyls", label: "Vinyles" },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Filtrer par catégorie</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.key}
            className={`px-4 py-2 text-sm rounded-full border ${
              selectedCategory === category.key
                ? "bg-tekno-black text-white border-tekno-black"
                : "border-gray-300 hover:border-tekno-black"
            }`}
            onClick={() => onCategoryChange(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
