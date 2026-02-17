import React from 'react';
import { SimCard } from '../types.ts';
import { ShoppingCart, Star } from 'lucide-react';

interface SimItemProps {
  sim: SimCard;
  onBuy: (sim: SimCard) => void;
  onAnalyze: (sim: SimCard) => void;
}

const SimItem: React.FC<SimItemProps> = ({ sim, onBuy, onAnalyze }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 bg-vnpt-light border-b border-gray-200 text-center">
        <h3 className="text-2xl font-bold text-vnpt-primary tracking-wide">{sim.phoneNumber}</h3>
        <div className="mt-1 flex justify-center space-x-2">
           {sim.category.map((cat, idx) => (
             <span key={idx} className="text-xs bg-white text-vnpt-secondary px-2 py-0.5 rounded-full border border-blue-200">
               {cat}
             </span>
           ))}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="mb-4 text-center">
          <p className="text-xl font-bold text-red-600">{formatPrice(sim.price)}</p>
          {sim.score && (
            <div className="flex items-center justify-center mt-2 text-yellow-500 font-medium">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span>{sim.score}/10 Phong Thủy</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button 
            onClick={() => onAnalyze(sim)}
            className="px-3 py-2 text-sm text-vnpt-secondary bg-white border border-vnpt-secondary rounded hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            <Star className="w-4 h-4 mr-1" />
            Xem P.Thủy
          </button>
          <button 
            onClick={() => onBuy(sim)}
            className="px-3 py-2 text-sm text-white bg-vnpt-primary rounded hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-200"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Đặt Mua
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimItem;