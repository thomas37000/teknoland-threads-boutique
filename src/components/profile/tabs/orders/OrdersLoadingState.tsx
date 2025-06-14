
import React from 'react';

const OrdersLoadingState = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tekno-blue mx-auto"></div>
      <p className="mt-2 text-gray-500">Chargement des commandes...</p>
    </div>
  );
};

export default OrdersLoadingState;
