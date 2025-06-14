
interface ShopHeaderProps {
  title: string;
  description: string;
}

const ShopHeader = ({ title, description }: ShopHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-tekno-gray">{description}</p>
    </div>
  );
};

export default ShopHeader;
