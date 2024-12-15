const API_URL = import.meta.env.VITE_API_URL;

export const performSensitiveOperation = async () => {
  const response = await fetch(`${API_URL}/api/sensitive-operation`, {
    credentials: 'include',
    // ... other config
  });
  return response.json();
}; 