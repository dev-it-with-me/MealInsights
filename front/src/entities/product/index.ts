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
