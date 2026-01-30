'use client';

import { Heart, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProductCard({ 
  product, 
  isLiked, 
  onToggleLike,
  onAddToCart 
}) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(isLiked || false);

  if (!product) return null;

  // Handle variant prices - get the minimum price from all variants
  const variants = product.variants || [];
  const firstVariant = variants[0];
  const price = firstVariant?.price || product.price || 0;
  const discount = product.discount || "10% OFF";
  const category = product.category || "SHOES";
  const imageUrl = firstVariant?.images?.[0]?.url || product.image;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return; // Guard clause
    
    setIsAddingToCart(true);
    
    if (onAddToCart) {
      try {
        onAddToCart({
          variantId: firstVariant.id,
          productId: product.id,
          quantity: 1,
          price: price
        });
        setCartAdded(true);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
    
    setIsAddingToCart(false);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group flex flex-col h-full w-full bg-white rounded-md border border-gray-100 p-1 sm:p-1 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer">
        
        {/* 1. Image Section (Fixed Aspect Ratio) */}
        <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden flex items-center justify-center mb-2 bg-[#F9FAFB]">
          
          {/* Discount Badge - Top Left */}
          {/* <div className="absolute top-0 left-0 bg-[#FF6B6B] text-white text-[11px] font-bold px-3 py-1.5 rounded-r-full shadow-sm z-10">
            {discount}
          </div> */}

          {/* Product Image */}
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-[85%] h-[85%] object-contain drop-shadow-2xl transition-transform duration-500 ease-out group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
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

          {/* Brand */}
          {product.brand && (
            <p className="text-gray-600 text-[12px] font-semibold mb-2 truncate">
              {product.brand}
            </p>
          )}

          {/* Price */}
          <p className="text-[#111827] font-bold text-[18px] mb-2">
            ₹{parseFloat(price).toFixed(2)}
          </p>

          {/* 3. Action Buttons (Pushed to bottom) */}
          <div className="mt-auto flex items-center gap-2">
          {/* Add To Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`flex-1 flex items-center justify-center gap-2 text-white text-[10px] font-bold uppercase tracking-wide rounded-xl py-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                cartAdded 
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/10' 
                  : 'bg-[#172031] hover:bg-[#232e42] active:scale-[0.98] shadow-[#172031]/10'
              }`}
            >
              {cartAdded ? (
                <>
                  <Check size={14} />
                  <span>Added</span>
                </>
              ) : (
                isAddingToCart ? 'Adding...' : 'Add to Cart'
              )}
            </button>
            
            {/* Wishlist Button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!firstVariant) return; // Guard clause
                
                if (onToggleLike) {
                  try {
                    onToggleLike({ productId: product.id, variantId: firstVariant.id });
                    setWishlistAdded(!wishlistAdded);
                  } catch (error) {
                    console.error('Error toggling wishlist:', error);
                  }
                }
              }}
              className="p-1 h-auto flex items-center justify-center rounded-xl border-[1.5px] border-gray-300 bg-white hover:border-[#FF6B6B]/30 transition-colors"
            >
              <Heart 
                size={20} 
                className={`transition-transform duration-200 active:scale-90 ${wishlistAdded ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'text-gray-400'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}