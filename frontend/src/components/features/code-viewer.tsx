"use client"

import Editor from "@monaco-editor/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { motion } from "framer-motion"

export function CodeViewer() {
  const data = useStore((state) => state.analysisData)
  
  if (!data) return null

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'dockerfile', name: 'Dockerfile', code: data.dockerfile, lang: 'dockerfile', file: 'Dockerfile' },
    { id: 'actions', name: 'GitHub Actions', code: data.githubActions, lang: 'yaml', file: 'deploy.yml' },
    { id: 'terraform', name: 'Terraform', code: data.terraform, lang: 'hcl', file: 'main.tf' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-5xl mt-16 z-10"
    >
      <Tabs defaultValue="dockerfile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-sm">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-zinc-800">{tab.name}</TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4 relative group">
            <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" onClick={() => handleDownload(tab.file, tab.code)} className="shadow-lg">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
            <div className="h-[500px] w-full rounded-lg overflow-hidden border border-zinc-800 shadow-2xl relative bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={tab.lang}
                theme="vs-dark"
                value={tab.code}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  readOnly: true,
                  padding: { top: 20 },
                  scrollBeyondLastLine: false,
                  fontFamily: 'var(--font-geist-mono), monospace'
                }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  )
}
