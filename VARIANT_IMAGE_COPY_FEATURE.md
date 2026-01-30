# Product Variant Image Copy Feature

## Overview
When creating a new product variant with just a different size (same color), users can now reuse existing images from another variant instead of uploading new images each time.

## Feature Description

### Problem Solved
Previously, when creating variants of the same shoe in different sizes but with the same color, you had to upload the same images multiple times. This was inefficient and repetitive.

### Solution
Now when creating a new variant, you can:
1. **Option 1**: Copy images from an existing variant of the same color
2. **Option 2**: Upload new images (original flow)

## Backend Implementation

### Updated Endpoint
**POST** `/api/admin/products/:productId/variants`

### Request Body
```json
{
  "size": "10",
  "color": "Black",
  "sku": "AM90-BLK-10",
  "price": "15000",
  "compareAtPrice": "18000",
  "quantity": "50",
  "copyImagesFromVariantId": "variant-uuid-here"
}
```

OR (for new images):
```json
{
  "size": "10",
  "color": "Black",
  "sku": "AM90-BLK-10",
  "price": "15000",
  "compareAtPrice": "18000",
  "quantity": "50",
  "images": [
    {
      "buffer": "<image-buffer>",
      "altText": "Shoe front view",
      "position": 0,
      "isPrimary": true
    }
  ]
}
```

### Key Implementation Details

**File**: [backend/api/services/product.services.js](backend/api/services/product.services.js)

```javascript
const createProductVariant = async (productId, variantData) => {
  const { 
    size, color, sku, price, compareAtPrice, isAvailable, 
    quantity, images, copyImagesFromVariantId 
  } = variantData;

  // If copyImagesFromVariantId is provided:
  // 1. Fetch the source variant and its images
  // 2. Validate it exists and belongs to the same product
  // 3. Copy all images to the new variant in a transaction
  
  // If images array is provided:
  // 1. Upload images to S3
  // 2. Create image records in database
  
  // Both flows are mutually exclusive
};
```

**Validation**:
- Source variant must exist
- Source variant must belong to the same product
- Either `copyImagesFromVariantId` OR `images` array must be provided

**Transaction Safety**:
- Variant creation + image copying happens in a single transaction
- Ensures data consistency - either both succeed or both fail

### Database Flow
1. Create new ProductVariant record
2. Create Inventory record (if quantity provided)
3. Copy ProductImage records from source variant to new variant
4. Return complete variant with all images

## Frontend Implementation

### File Updates
**File**: [frontend/src/app/admin/products/[id]/page.jsx](frontend/src/app/admin/products/[id]/page.jsx)

### New State
```javascript
const [newVariant, setNewVariant] = useState({
  size: '',
  color: '',
  sku: '',
  price: '',
  compareAtPrice: '',
  quantity: '',
  images: [],
  copyImagesFromVariantId: null  // NEW
});
```

### UI Components
1. **Copy from existing variant selector** - Dropdown showing all variants with image counts
2. **Upload new images section** - Only visible when NOT copying from existing variant
3. **Visual feedback** - Green banner confirming images will be copied

### Form Logic
```javascript
const handleSubmitNewVariant = async () => {
  // Validate required fields
  // Check: Either copyImagesFromVariantId OR images array must be provided
  
  if (newVariant.copyImagesFromVariantId) {
    // Send variant data with copyImagesFromVariantId
    // Backend handles image copying
  } else {
    // Create variant first
    // Then upload images as separate API calls
  }
};
```

## User Guide

### Creating a Variant with Copied Images

1. Navigate to **Admin > Products > [Product Name]**
2. In the **Variants** section, click **Add Variant**
3. Fill in variant details:
   - Size
   - Color (if same as existing variant)
   - SKU
   - Price
   - Compare at Price (optional)
   - Quantity

4. In the **Images** section:
   - Instead of uploading files, select **"Copy from existing variant"**
   - Choose a variant from the dropdown (e.g., "Black • Size 9 (3 images)")
   - The system will copy all images from that variant

5. Click **Create Variant**

### Creating a Variant with New Images

1. Follow steps 1-3 above
2. In the **Images** section:
   - Leave "Copy from existing variant" as "--"
   - Upload new images using the drag-and-drop area
   - OR click to browse and select files

3. Click **Create Variant**

## API Examples

### Example 1: Copy Images from Existing Variant
```bash
curl -X POST http://localhost:5000/api/admin/products/prod-123/variants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "size": "10",
    "color": "Black",
    "sku": "AM90-BLK-10",
    "price": "15000",
    "quantity": "50",
    "copyImagesFromVariantId": "var-456"
  }'
```

**Response**:
```json
{
  "message": "Product variant created successfully",
  "variant": {
    "id": "var-789",
    "productId": "prod-123",
    "size": "10",
    "color": "Black",
    "sku": "AM90-BLK-10",
    "price": "15000",
    "images": [
      {
        "id": "img-1",
        "url": "https://s3.../image-1.jpg",
        "altText": "Shoe front view",
        "position": 0,
        "isPrimary": true
      },
      {
        "id": "img-2",
        "url": "https://s3.../image-2.jpg",
        "altText": "Shoe side view",
        "position": 1,
        "isPrimary": false
      }
    ],
    "inventory": {
      "id": "inv-123",
      "quantity": 50,
      "reserved": 0
    }
  }
}
```

### Example 2: Upload New Images
```bash
curl -X POST http://localhost:5000/api/admin/products/prod-123/variants \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer token" \
  -F "size=10" \
  -F "color=White" \
  -F "sku=AM90-WHT-10" \
  -F "price=15000" \
  -F "quantity=50" \
  -F "images=@shoe-front.jpg" \
  -F "images=@shoe-side.jpg"
```

## Benefits

✅ **Saves Time**: No need to re-upload the same images for size variants
✅ **Reduces Errors**: Consistent images across all size variants of the same color
✅ **Storage Efficient**: Images are reused, not duplicated
✅ **Better UX**: Two clear paths - copy OR upload, preventing confusion
✅ **Data Integrity**: Transaction-based operations ensure data consistency

## Technical Details

### Image Copying Mechanism
- Source images are NOT moved or deleted
- New variant gets **copies** of the image records pointing to the same S3 URLs
- Multiple variants can reference the same image URL (efficient)
- Each image record maintains its own metadata (position, isPrimary, etc.)

### Error Handling
| Error | Cause | Solution |
|-------|-------|----------|
| "Source variant not found" | Invalid `copyImagesFromVariantId` | Verify variant ID |
| "Source variant must belong to the same product" | Cross-product copying attempted | Select variant from current product |
| "Either upload images or select an existing variant" | No images OR source variant specified | Choose one option |
| "SKU already exists" | Duplicate SKU | Use unique SKU for new variant |

### Performance
- **Copy Images**: Single database transaction (~100-300ms)
- **Upload New Images**: Depends on file size and network
  - 1 image: ~500-1000ms
  - 3 images: ~1500-3000ms
  - 5 images: ~2500-5000ms

## Migration Path for Existing Products

No migration needed! Existing variants continue to work with their uploaded images. New variants can use the copy feature going forward.

## Future Enhancements

- [ ] Batch variant creation from template
- [ ] Image position customization during copy
- [ ] Copy with image modifications (crop, filter)
- [ ] Variant copy from different products
- [ ] Bulk size variant creation wizard

## Support & Troubleshooting

**Q: Can I copy images from a different color?**
A: Yes! The feature doesn't enforce color matching. You can copy from any variant of the same product.

**Q: What if I modify images of a variant?**
A: Only that variant's images change. Other variants that copied those images are unaffected (they reference the same S3 URL but have separate database records).

**Q: Can I copy images and still upload additional images?**
A: Currently, you choose one: copy OR upload. To add images to a copied variant, use the "Add Image" feature on the expanded variant view.

**Q: How many variants can share the same image?**
A: Unlimited! Thousands of variants can reference the same S3 image URL.
