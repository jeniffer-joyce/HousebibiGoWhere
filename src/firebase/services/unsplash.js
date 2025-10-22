// src/firebase/services/unsplash.js
// Unsplash API Service - Handles image search and download tracking

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

/**
 * Search for photos on Unsplash
 * @param {string} query - Search term (e.g., "coffee", "business", "food")
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Results per page (default: 12)
 * @returns {Promise<Object>} Search results with photos array
 */
export async function searchPhotos(query, page = 1, perPage = 12) {
    try {
        const response = await fetch(
            `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&client_id=${UNSPLASH_ACCESS_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the results for easier use
        return {
            total: data.total,
            totalPages: data.total_pages,
            results: data.results.map(photo => ({
                id: photo.id,
                description: photo.description || photo.alt_description || '',
                urls: {
                    raw: photo.urls.raw,
                    full: photo.urls.full,
                    regular: photo.urls.regular, // Use this for display
                    small: photo.urls.small,
                    thumb: photo.urls.thumb
                },
                links: {
                    download: photo.links.download_location, // Use this to track downloads
                    html: photo.links.html // Link to photo on Unsplash
                },
                user: {
                    name: photo.user.name,
                    username: photo.user.username,
                    profileLink: photo.user.links.html
                },
                color: photo.color || '#e0e0e0'
            }))
        };
    } catch (error) {
        console.error('Error searching Unsplash photos:', error);
        throw error;
    }
}

/**
 * Trigger download tracking (REQUIRED by Unsplash guidelines)
 * Call this when a user selects/uses a photo
 * @param {string} downloadLocation - The download_location from the photo object
 * @returns {Promise<void>}
 */
export async function trackPhotoDownload(downloadLocation) {
    try {
        // Remove the base URL if it's already included
        const endpoint = downloadLocation.replace('https://api.unsplash.com', '');
        
        const response = await fetch(
            `${UNSPLASH_API_URL}${endpoint}?client_id=${UNSPLASH_ACCESS_KEY}`
        );

        if (!response.ok) {
            console.warn('Failed to track Unsplash download:', response.status);
        }
        
        console.log('✅ Unsplash download tracked');
    } catch (error) {
        console.error('Error tracking Unsplash download:', error);
        // Don't throw - this shouldn't break the user flow
    }
}

/**
 * Get a single photo by ID
 * @param {string} photoId - Unsplash photo ID
 * @returns {Promise<Object>} Photo object
 */
export async function getPhotoById(photoId) {
    try {
        const response = await fetch(
            `${UNSPLASH_API_URL}/photos/${photoId}?client_id=${UNSPLASH_ACCESS_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
        }

        const photo = await response.json();
        
        return {
            id: photo.id,
            description: photo.description || photo.alt_description || '',
            urls: {
                raw: photo.urls.raw,
                full: photo.urls.full,
                regular: photo.urls.regular,
                small: photo.urls.small,
                thumb: photo.urls.thumb
            },
            links: {
                download: photo.links.download_location,
                html: photo.links.html
            },
            user: {
                name: photo.user.name,
                username: photo.user.username,
                profileLink: photo.user.links.html
            },
            color: photo.color || '#e0e0e0'
        };
    } catch (error) {
        console.error('Error fetching Unsplash photo:', error);
        throw error;
    }
}

/**
 * Format attribution text (required by Unsplash)
 * @param {Object} photo - Photo object from Unsplash
 * @returns {Object} Attribution data
 */
export function getPhotoAttribution(photo) {
    return {
        text: `Photo by ${photo.user.name} on Unsplash`,
        photographerName: photo.user.name,
        photographerLink: photo.user.profileLink,
        unsplashLink: 'https://unsplash.com',
        photoLink: photo.links.html
    };
}