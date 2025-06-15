/**
 * Product API functions
 */
import { apiClient } from '@/shared/api/client';
import type {
    Product,
    CreateProductRequest,
    CreateProductWithPhotoRequest,
    UpdateProductRequest,
    ProductsListResponse,
    ProductSearchParams,
    ApiResponse
} from '../model/types';

const PRODUCTS_API_BASE = '/ingredients-products/products';

// Simplified API functions for use in components
export const getAllProducts = async (): Promise<ApiResponse<Product[]>> => {
    const response = await productApi.getProducts();
    return { data: response.products };
};

export const getProduct = async (id: string): Promise<ApiResponse<Product>> => {
    const product = await productApi.getProduct(id);
    return { data: product };
};

export const createProduct = async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    const product = await productApi.createProduct(data);
    return { data: product };
};

export const updateProduct = async (id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> => {
    const product = await productApi.updateProduct(id, data);
    return { data: product };
};

export const deleteProduct = async (id: string): Promise<void> => {
    return productApi.deleteProduct(id);
};

export const searchProducts = async (namePattern: string, limit: number = 10): Promise<ApiResponse<Product[]>> => {
    const products = await productApi.searchProducts(namePattern, limit);
    return { data: products };
};

export const productApi = {
    /**
     * Get all products with optional filtering and pagination
     */
    async getProducts(params?: ProductSearchParams): Promise<ProductsListResponse> {
        const queryParams: Record<string, string | number> = {};

        if (params?.skip !== undefined) queryParams.skip = params.skip;
        if (params?.limit !== undefined) queryParams.limit = params.limit;
        if (params?.name_filter) queryParams.name_filter = params.name_filter;
        if (params?.brand_filter) queryParams.brand_filter = params.brand_filter;
        if (params?.shop_filter) queryParams.shop_filter = params.shop_filter;
        if (params?.tag_filter?.length) {
            queryParams.tag_filter = params.tag_filter.join(',');
        }

        return apiClient.get<ProductsListResponse>(PRODUCTS_API_BASE, queryParams);
    },

    /**
     * Get product by ID
     */
    async getProduct(id: string): Promise<Product> {
        return apiClient.get<Product>(`${PRODUCTS_API_BASE}/${id}`);
    },

    /**
     * Create new product
     */
    async createProduct(data: CreateProductRequest): Promise<Product> {
        return apiClient.post<Product>(PRODUCTS_API_BASE, data);
    },

    /**
     * Update existing product
     */
    async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
        return apiClient.put<Product>(`${PRODUCTS_API_BASE}/${id}`, data);
    },

    /**
     * Delete product
     */
    async deleteProduct(id: string): Promise<void> {
        return apiClient.delete<void>(`${PRODUCTS_API_BASE}/${id}`);
    },

    /**
     * Search products by name pattern
     */
    async searchProducts(namePattern: string, limit: number = 10): Promise<Product[]> {
        return apiClient.get<Product[]>(`${PRODUCTS_API_BASE}/search`, {
            name_pattern: namePattern,
            limit,
        });
    },

    /**
     * Upload product photo
     */
    async uploadProductPhoto(id: string, file: File): Promise<Product> {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post<Product>(`${PRODUCTS_API_BASE}/${id}/photo`, formData);
    },

    /**
     * Delete product photo
     */
    async deleteProductPhoto(id: string): Promise<Product> {
        return apiClient.delete<Product>(`${PRODUCTS_API_BASE}/${id}/photo`);
    },

    /**
     * Create new product with photo upload
     */
    async createProductWithPhoto(data: CreateProductWithPhotoRequest): Promise<Product> {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('brand', data.brand || '');
        formData.append('shop', data.shop || '');
        formData.append('calories_per_100g_or_ml', (data.calories_per_100g_or_ml || 0).toString());

        if (data.macros_per_100g_or_ml) {
            formData.append('macros_protein', data.macros_per_100g_or_ml.protein.toString());
            formData.append('macros_carbohydrates', data.macros_per_100g_or_ml.carbohydrates.toString());
            formData.append('macros_fat', data.macros_per_100g_or_ml.fat.toString());
            formData.append('macros_sugar', data.macros_per_100g_or_ml.sugar.toString());
            formData.append('macros_fiber', data.macros_per_100g_or_ml.fiber.toString());
            formData.append('macros_saturated_fat', data.macros_per_100g_or_ml.saturated_fat.toString());
        } else {
            formData.append('macros_protein', '0');
            formData.append('macros_carbohydrates', '0');
            formData.append('macros_fat', '0');
            formData.append('macros_sugar', '0');
            formData.append('macros_fiber', '0');
            formData.append('macros_saturated_fat', '0');
        }

        formData.append('package_size_g_or_ml', (data.package_size_g_or_ml || 0).toString());
        formData.append('ingredients', JSON.stringify(data.ingredients || []));
        formData.append('tags', JSON.stringify(data.tags || []));

        if (data.photo_data) {
            formData.append('photo', data.photo_data);
        }

        return apiClient.postFormData<Product>(`${PRODUCTS_API_BASE}/with-photo`, formData);
    },

    /**
     * Update existing product with photo upload
     */
    async updateProductWithPhoto(id: string, data: CreateProductWithPhotoRequest): Promise<Product> {
        const formData = new FormData();

        // Append all fields from CreateProductWithPhotoRequest, similar to createProductWithPhoto
        // Backend should handle partial updates if fields are optional in the DTO
        formData.append('name', data.name);
        if (data.brand !== undefined) formData.append('brand', data.brand || '');
        if (data.shop !== undefined) formData.append('shop', data.shop || '');
        if (data.calories_per_100g_or_ml !== undefined) {
            formData.append('calories_per_100g_or_ml', (data.calories_per_100g_or_ml || 0).toString());
        }

        if (data.macros_per_100g_or_ml) {
            formData.append('macros_protein', data.macros_per_100g_or_ml.protein.toString());
            formData.append('macros_carbohydrates', data.macros_per_100g_or_ml.carbohydrates.toString());
            formData.append('macros_fat', data.macros_per_100g_or_ml.fat.toString());
            formData.append('macros_sugar', data.macros_per_100g_or_ml.sugar.toString());
            formData.append('macros_fiber', data.macros_per_100g_or_ml.fiber.toString());
            formData.append('macros_saturated_fat', data.macros_per_100g_or_ml.saturated_fat.toString());
        } else if (data.macros_per_100g_or_ml === null) { // Explicitly nullify if needed by backend
            formData.append('macros_protein', '0'); // Or however backend expects nullification
            formData.append('macros_carbohydrates', '0');
            formData.append('macros_fat', '0');
            formData.append('macros_sugar', '0');
            formData.append('macros_fiber', '0');
            formData.append('macros_saturated_fat', '0');
        }

        if (data.package_size_g_or_ml !== undefined) {
            formData.append('package_size_g_or_ml', (data.package_size_g_or_ml || 0).toString());
        }
        if (data.ingredients !== undefined) formData.append('ingredients', JSON.stringify(data.ingredients || []));
        if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags || []));

        if (data.photo_data) {
            formData.append('photo', data.photo_data);
        }

        // Assuming the endpoint is PUT /products/{id}/with-photo
        return apiClient.putFormData<Product>(`${PRODUCTS_API_BASE}/${id}/with-photo`, formData);
    }
};
