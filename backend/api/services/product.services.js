const prisma = require('../../config/prisma');
const { uploadBufferToS3 } = require('./s3.services');

// ======================== PRODUCT CRUD ========================

const createProduct = async (productData) => {
  const { name, brand, modelNumber, category, gender, description, shortDescription, tags, isActive, isFeatured, variants } = productData;

  // Validate required fields
  if (!name || !brand || !category || !gender) {
    throw new Error('Missing required fields: name, brand, category, gender');
  }

  // Validate that at least one variant is provided
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    throw new Error('At least one variant is required when creating a product');
  }

  // Validate each variant has required fields
  for (const variant of variants) {
    if (!variant.size || !variant.color || !variant.sku || !variant.price) {
      throw new Error('Each variant must have: size, color, sku, and price');
    }
  }

  // Check for duplicate SKUs
  const skus = variants.map(v => v.sku);
  const uniqueSkus = new Set(skus);
  if (skus.length !== uniqueSkus.size) {
    throw new Error('Duplicate SKUs found in variants');
  }

  // Check if any SKU already exists in database
  const existingSKUs = await prisma.productVariant.findMany({
    where: { sku: { in: skus } }
  });
  if (existingSKUs.length > 0) {
    throw new Error(`SKU(s) already exist: ${existingSKUs.map(v => v.sku).join(', ')}`);
  }

  // Use a transaction to ensure all operations succeed or fail together
  const result = await prisma.$transaction(async (tx) => {
    // Create product with variants and inventory
    const product = await tx.product.create({
      data: {
        name,
        brand,
        modelNumber,
        category,
        gender,
        description,
        shortDescription,
        tags: tags || [],
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        variants: {
          create: variants.map(variant => ({
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            price: parseFloat(variant.price),
            compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
            isAvailable: variant.isAvailable !== undefined ? variant.isAvailable : true,
            inventory: {
              create: {
                quantity: variant.quantity || 0
              }
            }
          }))
        }
      },
      include: {
        variants: { 
          include: { 
            images: true, 
            inventory: true 
          } 
        }
      }
    });

    // Add images for each variant if provided
    for (let i = 0; i < variants.length; i++) {
      const variantData = variants[i];
      if (variantData.images && Array.isArray(variantData.images) && variantData.images.length > 0) {
        const createdVariant = product.variants[i];
        
        for (let imgIndex = 0; imgIndex < variantData.images.length; imgIndex++) {
          const image = variantData.images[imgIndex];
          
          // Validate image has buffer
          if (!image.buffer) {
            throw new Error(`Image ${imgIndex + 1} for variant ${i + 1} (${variantData.color}) is missing image data`);
          }

          // Upload image to S3
          const imageUrl = await uploadBufferToS3(image.buffer, 'product-images', 'image/jpeg');

          // Create image record within the transaction
          await tx.productImage.create({
            data: {
              variantId: createdVariant.id,
              url: imageUrl,
              altText: image.altText || `${name} - ${variantData.color}`,
              position: image.position !== undefined ? image.position : imgIndex,
              isPrimary: image.isPrimary || (imgIndex === 0) // First image is primary by default
            }
          });
        }
      }
    }

    // Fetch product again with all images
    const finalProduct = await tx.product.findUnique({
      where: { id: product.id },
      include: {
        variants: { 
          include: { 
            images: { orderBy: { position: 'asc' } },
            inventory: true 
          } 
        }
      }
    });

    return finalProduct;
  });

  return {
    message: 'Product created successfully with variants and images',
    product: result
  };
};

const getProducts = async (filters = {}) => {
  const { category, gender, isActive, isFeatured, search, skip = 0, take = 10 } = filters;

  const where = {};
  
  if (category) where.category = category;
  if (gender) where.gender = gender;
  if (isActive !== undefined) where.isActive = isActive;
  if (isFeatured !== undefined) where.isFeatured = isFeatured;
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: { 
          include: { 
            images: { orderBy: { position: 'asc' } },
            inventory: true 
          } 
        },
      },
      skip: parseInt(skip),
      take: parseInt(take),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      total,
      skip: parseInt(skip),
      take: parseInt(take),
      pages: Math.ceil(total / take)
    }
  };
};

const getProductById = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: { 
        include: { 
          images: { orderBy: { position: 'asc' } },
          inventory: true 
        } 
      },
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

const updateProduct = async (productId, updateData) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  const { name, brand, modelNumber, category, gender, description, shortDescription, tags, isActive, isFeatured } = updateData;

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(name && { name }),
      ...(brand && { brand }),
      ...(modelNumber && { modelNumber }),
      ...(category && { category }),
      ...(gender && { gender }),
      ...(description && { description }),
      ...(shortDescription && { shortDescription }),
      ...(tags && { tags }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    },
    include: {
      variants: { include: { images: true, inventory: true } }
    }
  });

  return {
    message: 'Product updated successfully',
    product: updatedProduct
  };
};

const deleteProduct = async (productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  await prisma.product.delete({ where: { id: productId } });

  return { message: 'Product deleted successfully' };
};

// ======================== PRODUCT IMAGE MANAGEMENT ========================

const addProductImage = async (variantId, imageBuffer, altText = '', position = 0, isPrimary = false) => {
  const variant = await prisma.productVariant.findUnique({ 
    where: { id: variantId },
    include: { product: true }
  });
  if (!variant) {
    throw new Error('Variant not found');
  }

  // Upload to S3
  const imageUrl = await uploadBufferToS3(imageBuffer, 'product-images', 'image/jpeg');

  // If this is primary, unset other primary images for this variant
  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { variantId, isPrimary: true },
      data: { isPrimary: false }
    });
  }

  const image = await prisma.productImage.create({
    data: {
      variantId,
      url: imageUrl,
      altText: altText || `${variant.product.name} - ${variant.color} image`,
      position: position || 0,
      isPrimary: isPrimary || false
    }
  });

  return {
    message: 'Product image added successfully',
    image
  };
};

const getProductImages = async (variantId) => {
  const images = await prisma.productImage.findMany({
    where: { variantId },
    orderBy: { position: 'asc' }
  });

  return images;
};

const updateProductImage = async (imageId, updateData) => {
  const { altText, position, isPrimary } = updateData;

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) {
    throw new Error('Image not found');
  }

  // If setting as primary, unset others for this variant
  if (isPrimary) {
    await prisma.productImage.updateMany({
      where: { variantId: image.variantId, isPrimary: true },
      data: { isPrimary: false }
    });
  }

  const updatedImage = await prisma.productImage.update({
    where: { id: imageId },
    data: {
      ...(altText && { altText }),
      ...(position !== undefined && { position }),
      ...(isPrimary !== undefined && { isPrimary })
    }
  });

  return {
    message: 'Product image updated successfully',
    image: updatedImage
  };
};

const deleteProductImage = async (imageId) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) {
    throw new Error('Image not found');
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  return { message: 'Product image deleted successfully' };
};

// ======================== PRODUCT VARIANT MANAGEMENT ========================

const createProductVariant = async (productId, variantData) => {
  const { size, color, sku, price, compareAtPrice, isAvailable, quantity, images, copyImagesFromVariantId } = variantData;

  // Validate required fields
  if (!size || !color || !sku || !price) {
    throw new Error('Missing required fields: size, color, sku, price');
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error('Product not found');
  }

  // Check if variant already exists
  const existingVariant = await prisma.productVariant.findFirst({
    where: { productId, size, color }
  });

  if (existingVariant) {
    throw new Error('Variant with this size and color already exists');
  }

  // Check if SKU is unique
  const skuExists = await prisma.productVariant.findUnique({ where: { sku } });
  if (skuExists) {
    throw new Error('SKU already exists');
  }

  // If copyImagesFromVariantId is provided, validate it exists and belongs to same product
  let sourceImages = [];
  if (copyImagesFromVariantId) {
    const sourceVariant = await prisma.productVariant.findUnique({
      where: { id: copyImagesFromVariantId },
      include: { images: { orderBy: { position: 'asc' } } }
    });

    if (!sourceVariant) {
      throw new Error('Source variant not found');
    }

    if (sourceVariant.productId !== productId) {
      throw new Error('Source variant must belong to the same product');
    }

    sourceImages = sourceVariant.images || [];
  }

  // Use transaction to ensure variant and images are created together
  const variantWithImages = await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.create({
      data: {
        productId,
        size,
        color,
        sku,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      }
    });

    // Create inventory record if quantity provided
    if (quantity !== undefined) {
      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantity: parseInt(quantity)
        }
      });
    }

    // Copy images from source variant if provided
    if (copyImagesFromVariantId && sourceImages.length > 0) {
      for (let imgIndex = 0; imgIndex < sourceImages.length; imgIndex++) {
        const sourceImage = sourceImages[imgIndex];

        // Create image record using the same URL from source
        await tx.productImage.create({
          data: {
            variantId: variant.id,
            url: sourceImage.url,
            altText: sourceImage.altText,
            position: sourceImage.position,
            isPrimary: sourceImage.isPrimary
          }
        });
      }
    }
    // Add new images if provided
    else if (images && Array.isArray(images) && images.length > 0) {
      for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
        const image = images[imgIndex];

        // Validate image has buffer
        if (!image.buffer) {
          throw new Error(`Image ${imgIndex + 1} does not have a valid buffer`);
        }

        // Upload image to S3
        const imageUrl = await uploadBufferToS3(image.buffer, 'product-images', 'image/jpeg');

        // Create image record within the transaction
        await tx.productImage.create({
          data: {
            variantId: variant.id,
            url: imageUrl,
            altText: image.altText || `${product.name} - ${color}`,
            position: image.position !== undefined ? image.position : imgIndex,
            isPrimary: image.isPrimary || (imgIndex === 0)
          }
        });
      }
    }

    // Fetch variant with all relations
    const completeVariant = await tx.productVariant.findUnique({
      where: { id: variant.id },
      include: { 
        inventory: true,
        images: { orderBy: { position: 'asc' } }
      }
    });

    return completeVariant;
  });

  return {
    message: 'Product variant created successfully',
    variant: variantWithImages
  };
};

const getProductVariants = async (productId) => {
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    include: { inventory: true },
    orderBy: { createdAt: 'desc' }
  });

  return variants;
};

const updateProductVariant = async (variantId, updateData) => {
  const { size, color, sku, price, compareAtPrice, isAvailable } = updateData;

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) {
    throw new Error('Variant not found');
  }

  // Check SKU uniqueness if changing SKU
  if (sku && sku !== variant.sku) {
    const skuExists = await prisma.productVariant.findUnique({ where: { sku } });
    if (skuExists) {
      throw new Error('SKU already exists');
    }
  }

  const updatedVariant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      ...(size && { size }),
      ...(color && { color }),
      ...(sku && { sku }),
      ...(price && { price: parseFloat(price) }),
      ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null }),
      ...(isAvailable !== undefined && { isAvailable })
    },
    include: { inventory: true }
  });

  return {
    message: 'Product variant updated successfully',
    variant: updatedVariant
  };
};

const deleteProductVariant = async (variantId) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) {
    throw new Error('Variant not found');
  }

  await prisma.productVariant.delete({ where: { id: variantId } });

  return { message: 'Product variant deleted successfully' };
};

// ======================== INVENTORY MANAGEMENT ========================

const updateInventory = async (variantId, quantity) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) {
    throw new Error('Variant not found');
  }

  let inventory = await prisma.inventory.findUnique({
    where: { variantId }
  });

  if (!inventory) {
    // Create if doesn't exist
    inventory = await prisma.inventory.create({
      data: {
        variantId,
        quantity: parseInt(quantity)
      }
    });
  } else {
    // Update if exists
    inventory = await prisma.inventory.update({
      where: { variantId },
      data: { quantity: parseInt(quantity) }
    });
  }

  return {
    message: 'Inventory updated successfully',
    inventory
  };
};

const getInventory = async (variantId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
    include: { variant: true }
  });

  if (!inventory) {
    throw new Error('Inventory not found for this variant');
  }

  return inventory;
};

const addInventoryLog = async (variantId, type, quantity, orderId = null, note = '') => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) {
    throw new Error('Variant not found');
  }

  const log = await prisma.inventoryLog.create({
    data: {
      variantId,
      type,
      quantity,
      orderId: orderId || null,
      note,
      performedBy: 'admin'
    }
  });

  return {
    message: 'Inventory log created successfully',
    log
  };
};

const getInventoryLogs = async (variantId, skip = 0, take = 10) => {
  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      where: { variantId },
      include: { variant: true, order: true },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(take)
    }),
    prisma.inventoryLog.count({ where: { variantId } })
  ]);

  return {
    logs,
    pagination: {
      total,
      skip: parseInt(skip),
      take: parseInt(take),
      pages: Math.ceil(total / take)
    }
  };
};

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
  // Product
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  // Images
  addProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage,
  // Variants
  createProductVariant,
  getProductVariants,
  updateProductVariant,
  deleteProductVariant,
  // Inventory
  updateInventory,
  getInventory,
  addInventoryLog,
  getInventoryLogs,
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
