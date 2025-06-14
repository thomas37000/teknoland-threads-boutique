
const CartHeader = () => {
  return (
    <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
      <div className="col-span-6">
        <h3 className="font-medium">Nom de l'article</h3>
      </div>
      <div className="col-span-2 text-center">
        <h3 className="font-medium">Prix TTC</h3>
      </div>
      <div className="col-span-2 text-center">
        <h3 className="font-medium">Quantité</h3>
      </div>
      <div className="col-span-2 text-right">
        <h3 className="font-medium">Total</h3>
      </div>
    </div>
  );
};

export default CartHeader;
