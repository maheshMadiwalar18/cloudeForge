"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { Download, Maximize2, Minimize2, Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function CodeViewer() {
  const data = useStore((state) => state.analysisData)
  const [activeTab, setActiveTab] = useState('dockerfile')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  if (!data) return null

  const tabs = [
    { id: 'dockerfile', name: 'Dockerfile', code: data.dockerfile, lang: 'dockerfile', file: 'Dockerfile' },
    { id: 'actions', name: 'deploy.yml', code: data.githubActions, lang: 'yaml', file: 'deploy.yml' },
    { id: 'terraform', name: 'main.tf', code: data.terraform, lang: 'hcl', file: 'main.tf' }
  ]

  const activeData = tabs.find(t => t.id === activeTab) || tabs[0]

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeData.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "w-full max-w-5xl mt-16 z-20 transition-all duration-500",
        isFullscreen ? "fixed inset-4 max-w-none mt-0 z-50" : "relative"
      )}
    >
      <div className={cn(
        "flex flex-col overflow-hidden glassmorphism border border-zinc-800 shadow-2xl rounded-xl transition-all duration-500",
        isFullscreen ? "h-full" : "h-[600px]"
      )}>
        {/* Editor Header (Mac-like) */}
        <div className="flex items-center justify-between px-4 h-12 bg-zinc-950/90 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 w-20">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          
          <div className="flex items-center space-x-1 flex-1 overflow-x-auto no-scrollbar mx-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all relative",
                  activeTab === tab.id ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-zinc-800/80 rounded-md -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={handleCopy} className="text-zinc-400 hover:text-zinc-100 h-8 w-8">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDownload(activeData.file, activeData.code)} className="text-zinc-400 hover:text-zinc-100 h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)} className="text-zinc-400 hover:text-zinc-100 h-8 w-8">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 relative bg-[#1e1e1e]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Editor
                height="100%"
                language={activeData.lang}
                theme="vs-dark"
                value={activeData.code}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  readOnly: true,
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
