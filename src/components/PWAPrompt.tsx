import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Download, X } from 'lucide-react'

let deferredPrompt: any = null

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  
  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    const hasDeclined = localStorage.getItem('pwa-declined')
    
    // Show prompt immediately if not installed and hasn't declined
    if (!isInstalled && !hasDeclined) {
      setShowPrompt(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      // Always show prompt unless explicitly declined
      if (!hasDeclined) {
        setShowPrompt(true)
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (window.deferredPrompt) {
      setShowPrompt(false)
      try {
        await window.deferredPrompt.prompt()
        const { outcome } = await window.deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          window.deferredPrompt = null
        } else {
          localStorage.setItem('pwa-declined', 'true')
        }
      } catch (error) {
        console.error('Install prompt error:', error)
        showManualInstallInstructions()
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      
      if (isIOS || isSafari || !window.matchMedia('(display-mode: browser)').matches) {
        showManualInstallInstructions()
      }
    }
  }

  const handleDecline = () => {
    // Store decline in localStorage
    localStorage.setItem('pwa-declined', 'true')
    setShowPrompt(false)
  }

  const showManualInstallInstructions = () => {
    // Detect browser and show appropriate instructions
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    let instructions = ''
    if (isIOS && isSafari) {
      instructions = '1. Tap the share button (rectangle with arrow)\n' +
                    '2. Scroll down and select "Add to Home Screen"\n' +
                    '3. Tap "Add" to confirm'
    } else if (navigator.userAgent.includes('Chrome')) {
      instructions = '1. Click the menu (three dots) in Chrome\n' +
                    '2. Select "Install TAC-NBC"\n' +
                    '3. Click "Install" to confirm'
    } else {
      instructions = 'To install:\n' +
                    '1. Open your browser menu\n' +
                    '2. Look for "Add to Home Screen" or "Install"\n' +
                    '3. Follow the prompts to install'
    }

    // Use a more user-friendly alert or modal
    alert('Install Instructions:\n\n' + instructions)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            className="bg-background rounded-lg shadow-lg max-w-md w-full p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">Install TAC-NBC App</h3>
              <button
                onClick={handleDecline}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Install our app for the best experience:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Quick access to church updates</li>
                <li>Offline access to content</li>
                <li>Better performance</li>
                <li>Native app-like experience</li>
              </ul>

              <div className="flex flex-col gap-3 mt-6">
                <Button 
                  onClick={handleInstall}
                  className="w-full bg-church-primary hover:bg-church-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="w-full"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}