"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Server, Settings, Cloud, ArrowRight, GitBranch, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/hooks/use-store"
import { analyzeRepo } from "@/lib/api"
import { CodeViewer } from "@/components/features/code-viewer"

export default function Home() {
  const { repoUrl, setRepoUrl, setAnalysisData, analysisData } = useStore()
  const [errorMsg, setErrorMsg] = useState("")

  const mutation = useMutation({
    mutationFn: analyzeRepo,
    onSuccess: (data) => {
      setAnalysisData(data)
      setErrorMsg("")
    },
    onError: (error: Error) => {
      setErrorMsg(error.message)
      setAnalysisData(null)
    }
  })

  const handleAnalyze = () => {
    if (!repoUrl) {
      setErrorMsg("Please enter a valid GitHub URL")
      return
    }
    mutation.mutate(repoUrl)
  }

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background min-h-screen">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-primary/20 blur-[128px] rounded-full pointer-events-none" />
      <div className="absolute top-48 -right-48 w-96 h-96 bg-blue-500/10 blur-[128px] rounded-full pointer-events-none" />

      <div className="container relative z-10 max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-start min-h-[85vh]">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-3xl pt-10"
        >
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 bg-primary/5 text-primary backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            CloudForge Engine v2.0
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
            Ship code at the <br /> speed of thought.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            AI-powered infrastructure generation. Paste your GitHub repository and we'll instantly generate your Dockerfiles, CI/CD pipelines, and Terraform configurations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl mt-12 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex flex-col space-y-2">
            <div className="flex items-center space-x-2 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-xl shadow-2xl">
              <GitBranch className="w-5 h-5 text-zinc-400 ml-3 hidden sm:block" />
              <Input 
                type="text" 
                placeholder="https://github.com/username/project" 
                className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-2 sm:px-4 text-zinc-100 placeholder:text-zinc-600"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                disabled={mutation.isPending}
              />
              <Button 
                size="lg" 
                className="rounded-lg px-8 font-medium"
                onClick={handleAnalyze}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Analyzing</>
                ) : (
                  <>Analyze <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </div>
            {errorMsg && (
              <p className="text-red-500 text-sm pl-2">{errorMsg}</p>
            )}
          </div>
        </motion.div>

        {!analysisData && !mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24"
          >
            <Card className="bg-zinc-950/50 border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-zinc-100">Containerization</CardTitle>
                <CardDescription className="text-zinc-400">Optimized multi-stage Dockerfiles tailored to your specific framework.</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-zinc-950/50 border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Settings className="w-5 h-5 text-blue-500" />
                </div>
                <CardTitle className="text-zinc-100">CI/CD Pipelines</CardTitle>
                <CardDescription className="text-zinc-400">Automated GitHub Actions workflows for testing and seamless deployment.</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-zinc-950/50 border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Cloud className="w-5 h-5 text-purple-500" />
                </div>
                <CardTitle className="text-zinc-100">Infrastructure as Code</CardTitle>
                <CardDescription className="text-zinc-400">Terraform configurations to provision AWS, GCP, or Azure resources safely.</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Generated Code Viewer component will mount here on success */}
        {analysisData && <CodeViewer />}

      </div>
    </main>
  )
}
