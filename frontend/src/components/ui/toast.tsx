"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, X } from "lucide-react"
import { useStore } from "@/hooks/use-store"

export function Toast() {
  const { toastMessage, hideToast } = useStore()

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        hideToast()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, hideToast])

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border border-electric-blue/30 bg-zinc-950/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(111,0,255,0.15)] text-zinc-100 min-w-[280px] max-w-sm"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-blue/15 text-electric-blue">
            <Info className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 text-sm font-medium pr-2">
            {toastMessage}
          </div>
          <button
            onClick={hideToast}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
