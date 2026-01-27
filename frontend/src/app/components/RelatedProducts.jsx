'use client';

const RelatedProducts = ({ products = [] }) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Related Products</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="flex gap-4 p-4 bg-[var(--card-bg)] rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="w-24 h-24 flex-shrink-0 bg-[var(--img-bg)] rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">
                {product.name}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{product.brand}</p>
              <div className="mt-auto">
                <p className="text-base font-bold text-[var(--accent)]">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
