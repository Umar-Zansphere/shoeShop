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
  const product = await prisma.product.findUnique({ 
    where: { id: productId },
    include: { 
      variants: {
        include: { images: true }
      }
    }
  });
  if (!product) {
    throw new Error('Product not found');
  }

  // Delete all images for all variants
  for (const variant of product.variants) {
    if (variant.images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { variantId: variant.id }
      });
    }
  }

  // Delete the product (variants will cascade delete due to onDelete: Cascade)
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
  const variant = await prisma.productVariant.findUnique({ 
    where: { id: variantId },
    include: { images: true }
  });
  if (!variant) {
    throw new Error('Variant not found');
  }

  // Delete all images for this variant first
  if (variant.images.length > 0) {
    await prisma.productImage.deleteMany({
      where: { variantId: variantId }
    });
  }

  // Delete the variant
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
  getInventoryLogs,
};