'use client';

import { useState } from 'react';
import { ArrowLeft, Heart, Star, ShoppingCart, ChevronLeft, ChevronRight, Truck, RotateCcw, Shield, Check } from 'lucide-react';
import Link from 'next/link';
import RelatedProducts from '@/app/components/RelatedProducts';

// Mock Data for this specific view
const PRODUCT = {
  id: 1,
  name: 'Air Jordan 1 Retro High OG',
  category: 'Shoes',
  price: 10499,
  rating: 4.5,
  reviewCount: '11,524',
  description: "Familiar but always fresh, the iconic Air Jordan 1 is remastered for today's sneakerhead culture. This Retro High OG version goes all in with full-grain leather, comfortable cushioning and classic design details.",
  colors: [
    { 
      id: 'c1', 
      name: 'Black/White', 
      images: [
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800',
      ]
    },
    { 
      id: 'c2', 
      name: 'Yellow/Black', 
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1468452073230-91cabc968266?auto=format&fit=crop&q=80&w=800',
      ]
    },
    { 
      id: 'c3', 
      name: 'Gold/Black', 
      images: [
        'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=800',
      ]
    },
  ],
  sizes: [
    { val: 40, enabled: true },
    { val: 41, enabled: true },
    { val: 42, enabled: true },
    { val: 43, enabled: true },
    { val: 44, enabled: false },
    { val: 45, enabled: true },
    { val: 46, enabled: true },
  ],
  relatedProducts: [
    {
      id: 101,
      name: 'Air Jordan 2 OG 88 True Blue',
      brand: 'Jordan',
      price: 250,
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 102,
      name: 'Adidas NMD Classic',
      brand: 'Adidas',
      price: 150,
      image: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 103,
      name: 'Puma RS-X Runner',
      brand: 'Puma',
      price: 120,
      image: 'https://images.unsplash.com/photo-1511107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=400',
    },
  ],
};

export default function ProductDetailsPage() {
  const [selectedSize, setSelectedSize] = useState(41);
  const [selectedColor, setSelectedColor] = useState('c1');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [region, setRegion] = useState('EU');
  const [isLiked, setIsLiked] = useState(false);

  const currentColor = PRODUCT.colors.find(c => c.id === selectedColor);
  const currentImages = currentColor?.images || [];
  const currentImage = currentImages[selectedImageIndex];

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? currentImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-sm sm:text-base font-semibold text-[#1E293B] text-center flex-1 px-4">
            {PRODUCT.name}
          </h1>
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart 
              size={20} 
              className={`transition-colors ${isLiked ? 'fill-[#FF6B6B] text-[#FF6B6B]' : 'text-gray-800'}`} 
            />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32 sm:pb-8">
        {/* Layout: Image on left, Details on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          {/* LEFT: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center group">
              <img 
                src={currentImage} 
                alt={`${PRODUCT.name} - ${currentColor?.name}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                  >
                    <ChevronLeft size={22} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                  >
                    <ChevronRight size={22} className="text-gray-800" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold">
                    {selectedImageIndex + 1}/{currentImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {currentImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx 
                        ? 'border-[#FF6B6B] shadow-md scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details Panel */}
          <div className="flex flex-col">
            {/* Header Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">{PRODUCT.category}</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
                    {PRODUCT.name}
                  </h2>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(PRODUCT.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{PRODUCT.rating}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {PRODUCT.reviewCount} reviews
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Price</p>
                <p className="text-3xl font-black text-[#FF6B6B]">
                  ₹{PRODUCT.price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {PRODUCT.description}
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wide mb-4">
                Color Variant
              </h3>
              <div className="flex gap-3 flex-wrap">
                {PRODUCT.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.id)}
                    className={`relative group transition-all`}
                  >
                    <div className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all flex items-center justify-center ${
                      selectedColor === color.id 
                        ? 'border-[#FF6B6B] shadow-lg scale-105' 
                        : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                    }`}>
                      <img src={color.images[0]} alt={color.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {color.name}
                    </div>
                    {/* {color.images.length > 1 && (
                      <div className="absolute -top-2 -right-2 bg-[#FF6B6B] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {color.images.length}
                      </div>
                    )} */}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1E293B] uppercase tracking-wide">
                  Select Size ({region})
                </h3>
                
              </div>
              
              <div className="flex flex-wrap gap-2">
                {PRODUCT.sizes.map((size) => (
                  <button
                    key={size.val}
                    disabled={!size.enabled}
                    onClick={() => setSelectedSize(size.val)}
                    className={`flex-1 min-w-12.5 py-3 rounded-lg font-semibold text-sm transition-all duration-200 relative group ${
                      !size.enabled 
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                        : selectedSize === size.val
                          ? 'bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {size.val}
                    {!size.enabled && (
                      <div className="absolute top-full mt-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Out of Stock
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button className="w-full bg-linear-to-r from-[#FF6B6B] to-[#FF5252] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#FF6B6B]/30 hover:shadow-2xl hover:shadow-[#FF6B6B]/40 hover:-translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2 group mb-4">
              <ShoppingCart size={22} strokeWidth={2.5} className="group-hover:animate-bounce" />
              Add to Cart
            </button>

            {/* Wishlist Button */}
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                isLiked 
                  ? 'bg-[#FF6B6B]/10 border-[#FF6B6B] text-[#FF6B6B]' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {isLiked ? '❤ Added to Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 py-8 border-t border-b border-gray-200">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mb-3">
              <Truck className="text-[#FF6B6B]" size={24} />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Free Shipping</h4>
            <p className="text-xs text-gray-500">On orders over ₹100</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mb-3">
              <RotateCcw className="text-[#3B82F6]" size={24} />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Easy Returns</h4>
            <p className="text-xs text-gray-500">30-day policy</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-3">
              <Shield className="text-[#22C55E]" size={24} />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Secure</h4>
            <p className="text-xs text-gray-500">Safe checkout</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-[#A855F7]/10 rounded-full flex items-center justify-center mb-3">
              <Check className="text-[#A855F7]" size={24} />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 mb-1">Authentic</h4>
            <p className="text-xs text-gray-500">100% genuine</p>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-8">You Might Also Like</h2>
          <RelatedProducts products={PRODUCT.relatedProducts} />
        </div>
      </main>
    </div>
  );
}