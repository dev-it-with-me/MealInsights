/**
 * Image utility functions for handling base64 image data
 */

/**
 * Creates a proper image data URL from base64 photo data
 * @param photoData - Base64 encoded image data
 * @returns Data URL string for use in img src
 */
export const createImageDataUrl = (photoData: string): string => {
    if (!photoData || typeof photoData !== 'string') {
        // It might be better to return a placeholder image URL or an empty string
        // depending on how the consuming component handles errors.
        // For now, let's throw an error as it was.
        throw new Error('Invalid photo data');
    }

    const cleanData = photoData.trim();

    if (!cleanData) {
        // Similar to above, consider returning a placeholder or empty string.
        throw new Error('Empty photo data');
    }

    // Check if the string already starts with a data URI scheme
    if (cleanData.startsWith('data:image/')) {
        return cleanData; // Already a data URL, return as is
    }

    // Assuming the backend sends raw base64 data for JPEG images,
    // or the form provides raw base64.
    // If images can be other types and this isn't flexible enough,
    // the backend should ideally provide the mime type alongside the data.
    return `data:image/jpeg;base64,${cleanData}`;
};

/**
 * Checks if photo data is valid and non-empty
 * @param photoData - Photo data to validate
 * @returns true if photo data is valid
 */
export const isValidPhotoData = (photoData: string | null | undefined): photoData is string => {
    return !!photoData && typeof photoData === 'string' && photoData.trim().length > 0;
};
