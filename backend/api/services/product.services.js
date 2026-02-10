const prisma = require('../../config/prisma');

// ======================== CUSTOMER-FACING PRODUCT SERVICES ========================

// Get filter options (brands, categories, genders, colors, sizes)
const getFilterOptions = async () => {
  const [brands, categories, genders, colors, sizes] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { gender: true },
      distinct: ['gender']
    }),
    prisma.productVariant.findMany({
      where: { product: { isActive: true }, isAvailable: true },
      select: { color: true },
      distinct: ['color'],
      orderBy: { color: 'asc' }
    }),
    prisma.productVariant.findMany({
      where: { product: { isActive: true }, isAvailable: true },
      select: { size: true },
      distinct: ['size'],
      orderBy: { size: 'asc' }
    })
  ]);

  return {
    brands: brands.map(b => b.brand).filter(Boolean),
    categories: categories.map(c => c.category),
    genders: genders.map(g => g.gender),
    colors: colors.map(c => c.color).filter(Boolean),
    sizes: sizes.map(s => s.size).filter(Boolean)
  };
};

// Get popular/featured products
const getPopularProducts = async (skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        variants: {
          where: { isAvailable: true },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' },
          take: 1
        } 
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(take)
    }),
    prisma.product.count({ where: { isActive: true } })
  ]);
  return {
    
    products: products,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products by brand
const getProductsByBrand = async (brandName, skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        brand: { equals: brandName, mode: 'insensitive' }
      },
      include: {
        variants: {
          where: { isAvailable: true },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        brand: { equals: brandName, mode: 'insensitive' }
      }
    })
  ]);

  return {
    products: products,
    brand: brandName,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products by category
const getProductsByCategory = async (categoryName, skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        category: categoryName
      },
      include: {
        variants: {
          where: { isAvailable: true },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        category: categoryName
      }
    })
  ]);

  return {
    products: products,
    category: categoryName,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products by gender
const getProductsByGender = async (genderName, skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        gender: genderName
      },
      include: {
        variants: {
          where: { isAvailable: true },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        gender: genderName
      }
    })
  ]);

  return {
    products: products,
    gender: genderName,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products by color (from variants)
const getProductsByColor = async (colorName, skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        variants: {
          some: {
            color: { equals: colorName, mode: 'insensitive' },
            isAvailable: true
          }
        }
      },
      include: {
        variants: {
          where: { 
            color: { equals: colorName, mode: 'insensitive' },
            isAvailable: true 
          },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' }
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        variants: {
          some: {
            color: { equals: colorName, mode: 'insensitive' },
            isAvailable: true
          }
        }
      }
    })
  ]);

  return {
    products: products,
    color: colorName,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products by size (from variants)
const getProductsBySize = async (sizeValue, skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        variants: {
          some: {
            size: { equals: sizeValue, mode: 'insensitive' },
            isAvailable: true
          }
        }
      },
      include: {
        variants: {
          where: { 
            size: { equals: sizeValue, mode: 'insensitive' },
            isAvailable: true 
          },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' }
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        variants: {
          some: {
            size: { equals: sizeValue, mode: 'insensitive' },
            isAvailable: true
          }
        }
      }
    })
  ]);

  return {
    products: products,
    size: sizeValue,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products by model number
const getProductsByModel = async (modelNumber, skip = 0, take = 10) => {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        modelNumber: { equals: modelNumber, mode: 'insensitive' }
      },
      include: {
        variants: {
          where: { isAvailable: true },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({
      where: {
        isActive: true,
        modelNumber: { equals: modelNumber, mode: 'insensitive' }
      }
    })
  ]);

  return {
    products: products,
    modelNumber: modelNumber,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Advanced search with multiple filters
const searchProducts = async (filters = {}) => {
  let { search, category, gender, brand, color, size, minPrice, maxPrice, skip = 0, take = 10 } = filters;

  // Clean up undefined string values
  search = search && search !== 'undefined' ? search.trim() : null;
  category = category && category !== 'undefined' ? category : null;
  gender = gender && gender !== 'undefined' ? gender : null;
  brand = brand && brand !== 'undefined' ? brand : null;
  color = color && color !== 'undefined' ? color : null;
  size = size && size !== 'undefined' ? size : null;
  minPrice = minPrice && minPrice !== 'undefined' ? parseFloat(minPrice) : null;
  maxPrice = maxPrice && maxPrice !== 'undefined' ? parseFloat(maxPrice) : null;

  // Validate price ranges
  minPrice = minPrice && !isNaN(minPrice) ? minPrice : null;
  maxPrice = maxPrice && !isNaN(maxPrice) ? maxPrice : null;

  let where = { isActive: true };

  // Enhanced text search - split by spaces and search for any term
  if (search) {
    const searchTerms = search.split(/\s+/).filter(term => term.length > 0);
    
    if (searchTerms.length > 0) {
      // Create OR conditions for each search term across multiple fields
      where.OR = searchTerms.flatMap(term => [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { shortDescription: { contains: term, mode: 'insensitive' } },
        { modelNumber: { contains: term, mode: 'insensitive' } },
        { tags: { hasSome: [term] } },
        // Search variant fields
        { variants: { some: { 
          OR: [
            { color: { contains: term, mode: 'insensitive' } },
            { sku: { contains: term, mode: 'insensitive' } }
          ]
        }}}
      ]);
    }
  }

  // Category filter
  if (category) {
    where.category = category;
  }

  // Gender filter
  if (gender) {
    where.gender = gender;
  }

  // Brand filter
  if (brand) {
    where.brand = { equals: brand, mode: 'insensitive' };
  }

  // Variant filters - only add if at least one is present
  if (color || size || minPrice || maxPrice) {
    where.variants = { some: { isAvailable: true } };
    
    if (color) {
      where.variants.some.color = { equals: color, mode: 'insensitive' };
    }
    if (size) {
      where.variants.some.size = { equals: size, mode: 'insensitive' };
    }
    if (minPrice || maxPrice) {
      where.variants.some.price = {};
      if (minPrice) where.variants.some.price.gte = minPrice;
      if (maxPrice) where.variants.some.price.lte = maxPrice;
    }
  }

  // Build variant filter for include
  let variantWhere = { isAvailable: true };
  if (color) variantWhere.color = { equals: color, mode: 'insensitive' };
  if (size) variantWhere.size = { equals: size, mode: 'insensitive' };
  if (minPrice || maxPrice) {
    variantWhere.price = {};
    if (minPrice) variantWhere.price.gte = minPrice;
    if (maxPrice) variantWhere.price.lte = maxPrice;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: {
          where: variantWhere,
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' }
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  // Filter out products with no matching variants
  const filteredProducts = products.filter(p => p.variants.length > 0);

  return {
    products: filteredProducts,
    search: search || null,
    filters: { 
      category: category || null, 
      gender: gender || null, 
      brand: brand || null, 
      color: color || null, 
      size: size || null, 
      minPrice: minPrice || null, 
      maxPrice: maxPrice || null 
    },
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get products with optional filters
const getProductsList = async (filters = {}) => {
  const { category, gender, isFeatured, skip = 0, take = 10, sortBy = 'createdAt' } = filters;

  let where = { isActive: true };

  if (category) where.category = category;
  if (gender) where.gender = gender;
  if (isFeatured === 'true' || isFeatured === true) where.isFeatured = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isAvailable: true },
          include: { images: true, inventory: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { [sortBy]: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products: products,
    pagination: { total, skip: parseInt(skip), take: parseInt(take), pages: Math.ceil(total / take) }
  };
};

// Get single product with all variants
const getProductDetail = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    include: {
      variants: {
        where: { isAvailable: true },
        include: { images: true, inventory: true },
        orderBy: { price: 'asc' }
      }
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return formatProductDetailForResponse(product);
};

// Helper function to format single product detail
const formatProductDetailForResponse = (product) => {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    modelNumber: product.modelNumber,
    category: product.category,
    gender: product.gender,
    description: product.description,
    shortDescription: product.shortDescription,
    tags: product.tags,
    isFeatured: product.isFeatured,
    variants: product.variants.length > 0 ? product.variants.map(variant => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
      images: variant.images
        .sort((a, b) => a.position - b.position)
        .map(img => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary
        })),
      inventory: variant.inventory ? {
        quantity: variant.inventory.quantity,
        reserved: variant.inventory.reserved
      } : null
    })) : []
  };
};

module.exports = {
  // Customer-facing services
  getFilterOptions,
  getPopularProducts,
  getProductsByBrand,
  getProductsByCategory,
  getProductsByGender,
  getProductsByColor,
  getProductsBySize,
  getProductsByModel,
  searchProducts,
  getProductsList,
  getProductDetail
};
