export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful');
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}

// Remove these as they're now handled in PWAPrompt.tsx
// let deferredPrompt: any;
// window.addEventListener('beforeinstallprompt'...
// const showInstallPrompt...  
