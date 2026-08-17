/**
 * Backend Cloudinary Storage & Media Utility
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://backend-church.vercel.app');

/**
 * Formats or converts media URL to Cloudinary CDN URL if applicable
 */
export function getCloudinaryUrl(url: string, options: { resourceType?: 'audio' | 'video' | 'image' } = {}): string {
  if (!url) return '';
  if (url.includes('cloudinary.com')) return url;
  
  if (!url.startsWith('http')) {
    const resourceType = options.resourceType || 'video';
    return `https://res.cloudinary.com/demo/${resourceType}/upload/${url}`;
  }

  return url;
}

/**
 * Converts a File object to a Base64 string for transmission to Express backend
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Uploads a file (audio / video / thumbnail) STRICTLY via the Express Backend API
 */
export async function uploadToCloudinary(file: File, resourceType: 'video' | 'image' | 'auto' = 'video'): Promise<string> {
  try {
    // 1. First attempt: Direct backend upload endpoint
    const base64Data = await fileToBase64(file);

    const response = await fetch(`${API_BASE_URL}/api/cloudinary/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Data,
        resourceType,
        folder: 'sermons',
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend Cloudinary endpoint returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.url) {
      return data.url;
    }

    throw new Error('Backend Cloudinary response missing URL field');
  } catch (error) {
    console.warn('Backend upload proxy error, attempting backend signed direct upload fallback:', error);

    // 2. Fallback attempt: Fetch backend SHA-1 upload signature
    try {
      const sigRes = await fetch(`${API_BASE_URL}/api/cloudinary/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_preset: 'unsigned_sermons' }),
      });

      if (!sigRes.ok) {
        throw new Error('Failed to fetch signature from backend');
      }

      const { signature, timestamp, apiKey, cloudName, uploadPreset } = await sigRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      if (uploadPreset) formData.append('upload_preset', uploadPreset);
      if (apiKey) formData.append('api_key', apiKey);
      if (signature) formData.append('signature', signature);

      const targetCloud = cloudName || 'demo';
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error(`Direct Cloudinary signed upload failed: ${uploadRes.statusText}`);
      }

      const data = await uploadRes.json();
      return data.secure_url || data.url;
    } catch (fallbackErr) {
      console.error('All backend Cloudinary upload paths failed:', fallbackErr);
      throw fallbackErr;
    }
  }
}
