/**
 * Backend-authenticated Cloudinary Storage & Media Utility
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
 * Uploads a file (audio / video / thumbnail) securely using Backend signature + direct Cloudinary stream
 * (Bypasses serverless payload size limits while using backend credentials & signatures)
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: 'video' | 'image' | 'auto' = 'video'
): Promise<string> {
  // 1. Request backend signature & credentials from Express API
  let cloudName = 'demo';
  let apiKey = '';
  let signature = '';
  let timestamp = Math.floor(Date.now() / 1000);
  let uploadPreset = 'unsigned_sermons';

  try {
    const sigRes = await fetch(`${API_BASE_URL}/api/cloudinary/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload_preset: 'unsigned_sermons' }),
    });

    if (sigRes.ok) {
      const sigData = await sigRes.json();
      if (sigData.cloudName) cloudName = sigData.cloudName;
      if (sigData.apiKey) apiKey = sigData.apiKey;
      if (sigData.signature) signature = sigData.signature;
      if (sigData.timestamp) timestamp = sigData.timestamp;
      if (sigData.uploadPreset) uploadPreset = sigData.uploadPreset;
    } else {
      // Try GET as fallback
      const getSigRes = await fetch(`${API_BASE_URL}/api/cloudinary/signature`);
      if (getSigRes.ok) {
        const sigData = await getSigRes.json();
        if (sigData.cloudName) cloudName = sigData.cloudName;
        if (sigData.apiKey) apiKey = sigData.apiKey;
        if (sigData.signature) signature = sigData.signature;
        if (sigData.timestamp) timestamp = sigData.timestamp;
        if (sigData.uploadPreset) uploadPreset = sigData.uploadPreset;
      }
    }
  } catch (err) {
    console.warn('Could not fetch Cloudinary signature from backend, attempting default upload:', err);
  }

  // 2. Build FormData with the binary file (no base64 overhead, no size limit!)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp.toString());
  if (uploadPreset) formData.append('upload_preset', uploadPreset);
  if (apiKey) formData.append('api_key', apiKey);
  if (signature) formData.append('signature', signature);

  // 3. Upload directly from browser to Cloudinary CDN endpoint
  const targetCloud = cloudName && cloudName !== 'demo' ? cloudName : 'demo';
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error('Cloudinary upload error response:', errorText);

    // Fallback: If signed upload fails, attempt unsigned fallback if preset provided
    if (signature) {
      console.warn('Signed upload failed, retrying unsigned...');
      const fallbackFormData = new FormData();
      fallbackFormData.append('file', file);
      fallbackFormData.append('upload_preset', uploadPreset || 'unsigned_sermons');

      const retryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
        {
          method: 'POST',
          body: fallbackFormData,
        }
      );

      if (retryRes.ok) {
        const retryData = await retryRes.json();
        return retryData.secure_url || retryData.url;
      }
    }

    throw new Error(`Cloudinary upload failed (HTTP ${uploadRes.status}): ${errorText}`);
  }

  const data = await uploadRes.json();
  return data.secure_url || data.url;
}
