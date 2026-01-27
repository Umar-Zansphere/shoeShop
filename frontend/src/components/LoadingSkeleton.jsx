"use client";

export const LoadingSkeleton = () => (
  <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
    {/* Header Skeleton */}
    <div className="space-y-2">
      <div className="h-7 sm:h-8 md:h-9 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-3/4 sm:w-2/3 animate-pulse"></div>
      <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-full sm:w-4/5 animate-pulse"></div>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-6 sm:mt-8">
      {/* Card Skeleton 1 */}
      <div className="space-y-3 sm:space-y-4 bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100">
        <div className="aspect-square sm:aspect-auto sm:h-40 md:h-48 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded flex-1 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded flex-1 animate-pulse"></div>
          </div>
        </div>
        <div className="h-9 sm:h-10 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded-lg animate-pulse"></div>
      </div>

      {/* Card Skeleton 2 */}
      <div className="space-y-3 sm:space-y-4 bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100">
        <div className="aspect-square sm:aspect-auto sm:h-40 md:h-48 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded flex-1 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded flex-1 animate-pulse"></div>
          </div>
        </div>
        <div className="h-9 sm:h-10 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded-lg animate-pulse"></div>
      </div>

      {/* Card Skeleton 3 */}
      <div className="space-y-3 sm:space-y-4 bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100 sm:col-span-2 lg:col-span-1">
        <div className="aspect-square sm:aspect-auto sm:h-40 md:h-48 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded flex-1 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded flex-1 animate-pulse"></div>
          </div>
        </div>
        <div className="h-9 sm:h-10 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

export const CartLoadingSkeleton = () => (
  <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
    {/* Header */}
    <div className="h-8 sm:h-9 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-1/3 animate-pulse"></div>

    {/* Cart Items List */}
    <div className="space-y-3 sm:space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100 space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
            {/* Image */}
            <div className="col-span-1 aspect-square bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
            {/* Product Info */}
            <div className="col-span-3 sm:col-span-4 space-y-2">
              <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-20 animate-pulse"></div>
                <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-2">
            <div className="h-8 sm:h-9 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded animate-pulse"></div>
            <div className="h-8 sm:h-9 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"></div>
            <div className="h-8 sm:h-9 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Summary Section */}
    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border border-slate-100 space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/5 animate-pulse"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/5 animate-pulse"></div>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-3 flex justify-between">
        <div className="h-6 sm:h-7 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-6 sm:h-7 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/5 animate-pulse"></div>
      </div>
      <div className="h-10 sm:h-11 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded-lg animate-pulse mt-4"></div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
      {/* Image Section */}
      <div className="space-y-3">
        <div className="aspect-square bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg sm:rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="space-y-2">
          <div className="h-7 sm:h-8 md:h-9 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
        </div>

        <div className="flex gap-2">
          <div className="h-6 sm:h-7 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full w-16 animate-pulse"></div>
          <div className="h-6 sm:h-7 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full w-16 animate-pulse"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded animate-pulse"></div>
          <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-5/6 animate-pulse"></div>
          <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-4/5 animate-pulse"></div>
        </div>

        <div className="space-y-3">
          <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 sm:h-11 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-9 sm:h-10 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded-lg animate-pulse"></div>
          <div className="h-9 sm:h-10 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Related Products Section */}
    <div className="space-y-4 sm:space-y-5 md:space-y-6 mt-8 sm:mt-10 md:mt-12">
      <div className="h-7 sm:h-8 md:h-9 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg sm:rounded-xl animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const WishlistLoadingSkeleton = () => (
  <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <div className="h-8 sm:h-9 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg w-1/3 animate-pulse"></div>
      <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
    </div>

    {/* Items Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-100 space-y-3">
          <div className="aspect-square bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 sm:h-6 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 sm:h-5 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 sm:h-10 bg-linear-to-r from-red-100 via-red-50 to-red-100 rounded-lg flex-1 animate-pulse"></div>
            <div className="h-9 sm:h-10 bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 rounded-lg w-10 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
