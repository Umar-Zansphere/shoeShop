const prisma = require('../../config/prisma');
const { uploadBufferToS3 } = require('./s3.services');

// ======================== PRODUCT CRUD ========================

const createProduct = async (productData) => {
  const { name, brand, modelNumber, category, gender, description, shortDescription, tags, isActive, isFeatured } = productData;

  // Validate required fields
  if (!name || !brand || !category || !gender) {
    throw new Error('Missing required fields: name, brand, category, gender');
  }

  const product = await prisma.product.create({
    data: {
      name,
      brand,
      modelNumber,
      category,
      gender,
      description,
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
    },
    include: {
      variants: { include: { images: true, inventory: true } }
    }
  });

  return {
    message: 'Product created successfully',
    product
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
  const { size, color, sku, price, compareAtPrice, isAvailable, quantity } = variantData;

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

  const variant = await prisma.productVariant.create({
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
    await prisma.inventory.create({
      data: {
        variantId: variant.id,
        quantity: parseInt(quantity)
      }
    });
  }

  const variantWithInventory = await prisma.productVariant.findUnique({
    where: { id: variant.id },
    include: { inventory: true }
  });

  return {
    message: 'Product variant created successfully',
    variant: variantWithInventory
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
  getInventoryLogs
};
