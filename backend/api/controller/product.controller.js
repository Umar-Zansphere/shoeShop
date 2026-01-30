const productService = require('../services/product.services');
const { validateAndOptimizeImage } = require('../../utils/imageProcessor');

// ======================== PRODUCT CONTROLLERS ========================

const createProduct = async (req, res, next) => {
  try {
    console.log('Received req.body:', req.body);
    console.log('Received files:', req.files?.length || 0);
    
    const { name, brand, modelNumber, category, gender, description, shortDescription, tags, isActive, isFeatured, variants } = req.body;

    // Validate required fields
    if (!name || !brand || !category || !gender) {
      return res.status(400).json({ message: 'Missing required fields: name, brand, category, gender' });
    }

    // Validate and parse variants
    if (!variants) {
      return res.status(400).json({ message: 'At least one variant is required' });
    }

    let parsedVariants;
    try {
      parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
    } catch (e) {
      console.error('Error parsing variants:', e);
      return res.status(400).json({ message: 'Invalid variants format' });
    }

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      return res.status(400).json({ message: 'At least one variant is required' });
    }

    // Validate each variant has required fields
    for (let i = 0; i < parsedVariants.length; i++) {
      const variant = parsedVariants[i];
      if (!variant.size || !variant.color || !variant.sku || !variant.price) {
        return res.status(400).json({ 
          message: `Variant ${i + 1} missing required fields: size, color, sku, price` 
        });
      }
    }

    // Map uploaded files to variants
    if (req.files && req.files.length > 0) {
      console.log('Processing files...');
      for (const file of req.files) {
        // File field name format: images_0, images_1, etc. to map to variant index
        const match = file.fieldname.match(/images_(\d+)/);
        if (match) {
          const variantIndex = parseInt(match[1]);
          if (variantIndex < parsedVariants.length) {
            if (!parsedVariants[variantIndex].images) {
              parsedVariants[variantIndex].images = [];
            }
            
            // Validate and optimize image
            const optimizedBuffer = await validateAndOptimizeImage(file.buffer);
            
            parsedVariants[variantIndex].images.push({
              buffer: optimizedBuffer,
              altText: `${name} - Variant ${variantIndex + 1}`,
              position: parsedVariants[variantIndex].images.length,
              isPrimary: parsedVariants[variantIndex].images.length === 0
            });
          }
        }
      }
    }

    // Parse boolean values from FormData
    const isActiveValue = isActive === 'true' || isActive === true;
    const isFeaturedValue = isFeatured === 'true' || isFeatured === true;

    // Convert category and gender to uppercase (enum values)
    const categoryValue = category.toUpperCase();
    const genderValue = gender.toUpperCase();

    // Validate enum values
    const validCategories = ['RUNNING', 'CASUAL', 'FORMAL', 'SNEAKERS'];
    const validGenders = ['MEN', 'WOMEN', 'UNISEX', 'KIDS'];

    if (!validCategories.includes(categoryValue)) {
      return res.status(400).json({ 
        message: `Invalid category. Allowed values: ${validCategories.join(', ')}` 
      });
    }

    if (!validGenders.includes(genderValue)) {
      return res.status(400).json({ 
        message: `Invalid gender. Allowed values: ${validGenders.join(', ')}` 
      });
    }

    const result = await productService.createProduct({
      name,
      brand,
      modelNumber,
      category: categoryValue,
      gender: genderValue,
      description,
      shortDescription,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      isActive: isActiveValue,
      isFeatured: isFeaturedValue,
      variants: parsedVariants.map(v => ({
        ...v,
        quantity: v.quantity ? parseInt(v.quantity) : 0
      }))
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in createProduct:', error);
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { category, gender, isActive, isFeatured, search, skip, take } = req.query;

    const result = await productService.getProducts({
      category,
      gender,
      isActive: isActive ? isActive === 'true' : undefined,
      isFeatured: isFeatured ? isFeatured === 'true' : undefined,
      search,
      skip,
      take
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await productService.getProductById(productId);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, brand, modelNumber, category, gender, description, shortDescription, tags, isActive, isFeatured } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await productService.updateProduct(productId, {
      name,
      brand,
      modelNumber,
      category,
      gender,
      description,
      shortDescription,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
      isActive,
      isFeatured
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await productService.deleteProduct(productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== PRODUCT IMAGE CONTROLLERS ========================

const addProductImage = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { altText, position, isPrimary } = req.body;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    if (!req.file) {
      console.error('No file received in request');
      console.error('Request body:', req.body);
      console.error('Request headers:', req.headers);
      return res.status(400).json({ message: 'Image file is required' });
    }

    console.log('File received:', {
      fieldname: req.file.fieldname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate and optimize image
    const optimizedBuffer = await validateAndOptimizeImage(req.file.buffer);

    const result = await productService.addProductImage(
      variantId,
      optimizedBuffer,
      altText,
      position,
      isPrimary
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in addProductImage:', error.message);
    next(error);
  }
};

const getProductImages = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    const images = await productService.getProductImages(variantId);
    res.json(images);
  } catch (error) {
    next(error);
  }
};

const updateProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const { altText, position, isPrimary } = req.body;

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    const result = await productService.updateProductImage(imageId, {
      altText,
      position,
      isPrimary
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteProductImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    const result = await productService.deleteProductImage(imageId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== PRODUCT VARIANT CONTROLLERS ========================

const createProductVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { size, color, sku, price, compareAtPrice, isAvailable, quantity, copyImagesFromVariantId, images } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Convert base64 images to buffers if provided
    let processedImages = null;
    if (images && Array.isArray(images) && images.length > 0) {
      processedImages = images.map((img) => ({
        buffer: Buffer.from(img.buffer, 'base64'),
        altText: img.altText,
        position: img.position,
        isPrimary: img.isPrimary
      }));
    }

    const result = await productService.createProductVariant(productId, {
      size,
      color,
      sku,
      price,
      compareAtPrice,
      isAvailable,
      quantity,
      copyImagesFromVariantId,
      images: processedImages
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getProductVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const variants = await productService.getProductVariants(productId);
    res.json(variants);
  } catch (error) {
    next(error);
  }
};

const updateProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { size, color, sku, price, compareAtPrice, isAvailable } = req.body;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    const result = await productService.updateProductVariant(variantId, {
      size,
      color,
      sku,
      price,
      compareAtPrice,
      isAvailable
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteProductVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    const result = await productService.deleteProductVariant(variantId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== INVENTORY CONTROLLERS ========================

const updateInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { quantity } = req.body;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }

    const result = await productService.updateInventory(variantId, quantity);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    const inventory = await productService.getInventory(variantId);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

const addInventoryLog = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { type, quantity, orderId, note } = req.body;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    if (!type || !quantity) {
      return res.status(400).json({ message: 'Type and quantity are required' });
    }

    const result = await productService.addInventoryLog(variantId, type, quantity, orderId, note);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getInventoryLogs = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { skip, take } = req.query;

    if (!variantId) {
      return res.status(400).json({ message: 'Variant ID is required' });
    }

    const result = await productService.getInventoryLogs(variantId, skip, take);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// ======================== CUSTOMER-FACING PRODUCT CONTROLLERS ========================

const getFilterOptions = async (req, res, next) => {
  try {
    const filters = await productService.getFilterOptions();
    res.json({
      success: true,
      data: filters
    });
  } catch (error) {
    next(error);
  }
};

const getPopularProducts = async (req, res, next) => {
  try {
    const { skip, take } = req.query;
    const result = await productService.getPopularProducts(skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByBrand = async (req, res, next) => {
  try {
    const { brandName } = req.params;
    const { skip, take } = req.query;

    if (!brandName) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const result = await productService.getProductsByBrand(brandName, skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const { skip, take } = req.query;

    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await productService.getProductsByCategory(categoryName, skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByGender = async (req, res, next) => {
  try {
    const { genderName } = req.params;
    const { skip, take } = req.query;

    if (!genderName) {
      return res.status(400).json({ message: 'Gender name is required' });
    }

    const result = await productService.getProductsByGender(genderName, skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByColor = async (req, res, next) => {
  try {
    const { colorName } = req.params;
    const { skip, take } = req.query;

    if (!colorName) {
      return res.status(400).json({ message: 'Color name is required' });
    }

    const result = await productService.getProductsByColor(colorName, skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsBySize = async (req, res, next) => {
  try {
    const { sizeValue } = req.params;
    const { skip, take } = req.query;

    if (!sizeValue) {
      return res.status(400).json({ message: 'Size value is required' });
    }

    const result = await productService.getProductsBySize(sizeValue, skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByModel = async (req, res, next) => {
  try {
    const { modelNumber } = req.params;
    const { skip, take } = req.query;

    if (!modelNumber) {
      return res.status(400).json({ message: 'Model number is required' });
    }

    const result = await productService.getProductsByModel(modelNumber, skip, take);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await productService.searchProducts(filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductsList = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await productService.getProductsList(filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getProductDetail = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await productService.getProductDetail(productId);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ message: 'Product not found' });
    }
    next(error);
  }
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
  // Customer-facing controllers
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
