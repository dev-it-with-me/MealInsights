/**
 * Product API functions
 */
import { apiClient } from '@/shared/api/client';
import type {
    Product,
    CreateProductRequest,
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
};
