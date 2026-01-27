'use client';

import { MoreHorizontal } from 'lucide-react';

export default function BrandScroller({ brands }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-y-6 sm:gap-6 justify-between sm:justify-start">
        {brands.map((brand) => (
          <div key={brand.id} className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center p-4 transition-all duration-300 group-hover:bg-[#E5E7EB] group-hover:scale-105">
              {brand.type === 'more' ? (
                <MoreHorizontal size={28} className="text-gray-600" />
              ) : (
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="w-full h-full object-contain opacity-80 group-hover:opacity-100 mix-blend-multiply filter grayscale group-hover:grayscale-0 transition-all" 
                />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-black tracking-wide">
              {brand.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}