const productService = require('../services/product.services');
const { validateAndOptimizeImage } = require('../../utils/imageProcessor');

// ======================== PRODUCT CONTROLLERS ========================

const createProduct = async (req, res, next) => {
  try {
    const { name, brand, modelNumber, category, gender, description, shortDescription, tags, isActive, isFeatured } = req.body;

    const result = await productService.createProduct({
      name,
      brand,
      modelNumber,
      category,
      gender,
      description,
      shortDescription,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      isActive,
      isFeatured
    });

    res.status(201).json(result);
  } catch (error) {
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
      return res.status(400).json({ message: 'Image file is required' });
    }

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
    const { size, color, sku, price, compareAtPrice, isAvailable, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await productService.createProductVariant(productId, {
      size,
      color,
      sku,
      price,
      compareAtPrice,
      isAvailable,
      quantity
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
