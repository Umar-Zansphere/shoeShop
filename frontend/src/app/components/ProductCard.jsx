'use client';

import { Heart, Check, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  // Handle variant prices - get the minimum price from all variants
  const variants = product.variants || [];
  const firstVariant = variants[0];
  const price = firstVariant?.price || product.price || 0;
  const discount = product.discount || "10% OFF";
  const category = product.category || "SHOES";
  const imageUrl = firstVariant?.images?.[0]?.url || product.image;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firstVariant || isAddingToCart) return;

    setIsAddingToCart(true);

    if (onAddToCart) {
      try {
        await onAddToCart({
          variantId: firstVariant.id,
          productId: product.id,
          quantity: 1,
          price: price
        });
        setCartAdded(true);
        // Reset after 2 seconds
        setTimeout(() => setCartAdded(false), 2000);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }

    setIsAddingToCart(false);
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firstVariant) return;

    if (onToggleLike) {
      try {
        onToggleLike({ productId: product.id, variantId: firstVariant.id });
        setWishlistAdded(!wishlistAdded);
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      }
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="block h-full">
      <div className="group flex flex-col h-full w-full bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer">

        {/* 1. Image Section */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center mb-3 bg-gray-50">

          {/* Wishlist Button - Top Right */}
          <button
            onClick={handleToggleLike}
            className="absolute top-3 right-3 z-10 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white hover:scale-110 transition-all shadow-md active:scale-95 touch-manipulation"
            aria-label={wishlistAdded ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={20}
              className={`transition-all duration-200 ${wishlistAdded ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`}
            />
          </button>

          {/* Product Image */}
          {imageUrl ? (
            <div className="relative w-[90%] h-[90%]">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
              )}
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-contain drop-shadow-2xl transition-all duration-500 ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-xl">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* 2. Content Section */}
        <div className="flex flex-col flex-1 px-1">

          {/* Category Label */}
          <p className="text-gray-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1.5">
            {category}
          </p>

          {/* Title */}
          <h3 className="text-slate-900 font-bold text-sm sm:text-base leading-tight mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors" title={product.name}>
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2 truncate">
              {product.brand}
            </p>
          )}

          {/* Price */}
          <p className="text-slate-900 font-black text-lg sm:text-xl mb-3">
            ₹{parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          {/* 3. Action Button */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-full flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-bold uppercase tracking-wide rounded-xl py-3.5 min-h-[44px] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${cartAdded
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-slate-900/20'
                }`}
            >
              {cartAdded ? (
                <>
                  <Check size={18} className="animate-in zoom-in-50 duration-200" />
                  <span>Added!</span>
                </>
              ) : isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}