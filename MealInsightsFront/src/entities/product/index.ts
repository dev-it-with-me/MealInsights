/**
 * Product entity index file - exports all public APIs
 */

// Types
export type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ProductsListResponse,
    ProductFilters,
    ProductSearchParams,
    IngredientQuantity,
    ApiResponse
} from './model/types';

// Schemas
export {
    productSchema,
    createProductRequestSchema,
    updateProductRequestSchema,
    productFiltersSchema,
    productSearchParamsSchema,
    productsListResponseSchema,
    ingredientQuantitySchema
} from './model/schemas';

// API
export {
    productApi,
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} from './api/productApi';
