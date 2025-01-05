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

    // Show prompt after 3 seconds if no install prompt was triggered
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !hasDeclined) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        deferredPrompt = null
        setShowPrompt(false)
      }
    } else {
      // If no install prompt, provide manual instructions
      setShowPrompt(false)
      // Show manual install instructions modal
      showManualInstallInstructions()
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
      instructions = 'Tap the share button and select "Add to Home Screen"'
    } else if (navigator.userAgent.includes('Chrome')) {
      instructions = 'Open Chrome menu and select "Install TAC-NBC"'
    } else {
      instructions = 'Use the browser menu to install this app to your device'
    }

    alert(`To install our app: ${instructions}`)
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