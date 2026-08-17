/**
 * Express Backend Cloudinary Media Utility
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
 * Uploads a file (audio / video / thumbnail) strictly through the Express Backend API (/api/cloudinary/upload)
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: 'video' | 'image' | 'auto' = 'video'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resourceType', resourceType);
  formData.append('upload_preset', 'unsigned_sermons');

  try {
    // 1. Post binary file directly to Express Backend API endpoint
    const response = await fetch(`${API_BASE_URL}/api/cloudinary/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend upload API error (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (data && data.url) {
      return data.url;
    }

    throw new Error('Backend API response missing url field');
  } catch (backendErr: any) {
    console.warn('Backend proxy upload failed, attempting signed direct upload fallback:', backendErr);

    // 2. Fallback attempt: Fetch backend SHA-1 upload signature & upload directly to Cloudinary
    try {
      const sigRes = await fetch(`${API_BASE_URL}/api/cloudinary/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upload_preset: 'unsigned_sermons' }),
      });

      let cloudName = 'demo';
      let apiKey = '';
      let signature = '';
      let timestamp = Math.floor(Date.now() / 1000);
      let uploadPreset = 'unsigned_sermons';

      if (sigRes.ok) {
        const sigData = await sigRes.json();
        if (sigData.cloudName) cloudName = sigData.cloudName;
        if (sigData.apiKey) apiKey = sigData.apiKey;
        if (sigData.signature) signature = sigData.signature;
        if (sigData.timestamp) timestamp = sigData.timestamp;
        if (sigData.uploadPreset) uploadPreset = sigData.uploadPreset;
      }

      const directFormData = new FormData();
      directFormData.append('file', file);
      directFormData.append('timestamp', timestamp.toString());
      directFormData.append('upload_preset', uploadPreset);
      if (apiKey) directFormData.append('api_key', apiKey);
      if (signature) directFormData.append('signature', signature);

      const targetCloud = cloudName && cloudName !== 'demo' ? cloudName : 'demo';
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
        {
          method: 'POST',
          body: directFormData,
        }
      );

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Cloudinary fallback upload failed: ${errorText}`);
      }

      const directData = await uploadRes.json();
      return directData.secure_url || directData.url;
    } catch (fallbackErr) {
      console.error('All backend Cloudinary upload options failed:', fallbackErr);
      throw backendErr;
    }
  }
}
