'use client';

import { Heart } from 'lucide-react';

export default function ProductCard({ product, isLiked, onToggleLike }) {
  // Default values to match the design aesthetic if data is missing
  const category = product.category || "WOMEN SHOES";
  const discount = product.discount || "10% OFF";

  return (
    <div className="group flex flex-col h-full w-full bg-white rounded-md border border-gray-100 p-1 sm:p-1 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
      
      {/* 1. Image Section (Fixed Aspect Ratio) */}
      {/* The background is set to the specific dark navy from the reference */}
      <div className="relative w-full aspect-4/3 rounded-3xl  overflow-hidden flex items-center justify-center mb-2">
        
        {/* Discount Badge - Top Left */}
        <div className="absolute top-0 left-0 bg-[#FF6B6B] text-white text-[11px] font-bold px-3 py-1.5 rounded-r-full shadow-sm z-10">
          {discount}
        </div>

        {/* Product Image */}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-[85%] h-[85%] object-fill drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110" 
        />
      </div>

      {/* 2. Content Section */}
      <div className="flex flex-col flex-1 px-1">
        
        {/* Category Label */}
        <p className="text-gray-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1.5">
          {category}
        </p>
        
        {/* Title - Truncated to 1 line to maintain row height uniformity */}
        <h3 className="text-[#111827] font-bold text-[16px] leading-tight mb-3 truncate" title={product.name}>
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-[#111827] font-bold text-[18px] mb-2">
          ${product.price.toFixed(2)}
        </p>

        {/* 3. Action Buttons (Pushed to bottom) */}
        <div className="mt-auto flex items-center gap-2">
          {/* Add To Cart Button */}
          <button className="flex-1 bg-[#172031] text-white text-[10px] font-bold uppercase tracking-wide rounded-xl py-2 hover:bg-[#232e42] active:scale-[0.98] transition-all shadow-md shadow-[#172031]/10">
            Add to Cart
          </button>
          
          {/* Wishlist Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
            className="p-1 h-auto flex items-center justify-center rounded-xl border-[1.5px] border-gray-300 bg-white hover:border-[#FF6B6B]/30 transition-colors"
          >
            <Heart 
              size={20} 
              // Solid orange fill to match reference
              className={`transition-transform duration-200 active:scale-90 ${isLiked ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'fill-[#FF6B6B] text-[#FF6B6B]'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}