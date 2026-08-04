
import { API_BASE_URL } from '../config';

export interface UploadResult {
    url: string;
    filename: string;
    mimetype: string;
    size: number;
}

/**
 * Upload a file to the local backend
 */
export const uploadFile = async (file: File, folder: string = 'uploads'): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/media/upload`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        if (data.success && data.data && data.data.media) {
            return {
                url: data.data.media.url,
                filename: data.data.media.filename,
                mimetype: data.data.media.mimetype,
                size: data.data.media.size
            };
        } else {
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};
