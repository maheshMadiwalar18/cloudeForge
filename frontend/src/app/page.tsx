"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, GitBranch, Terminal, Cpu, Blocks, Rocket } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/hooks/use-store"
import { analyzeRepo } from "@/lib/api"

import { CodeViewer } from "@/components/features/code-viewer"
import { StackCards } from "@/components/features/stack-cards"
import { DeploymentFlow } from "@/components/features/deployment-flow"

const loadingSteps = [
  { text: "Cloning repository...", icon: GitBranch, color: "text-zinc-400" },
  { text: "Detecting tech stack...", icon: Terminal, color: "text-blue-400" },
  { text: "Generating Dockerfile...", icon: Blocks, color: "text-cyan-400" },
  { text: "Creating CI/CD pipelines...", icon: Cpu, color: "text-purple-400" },
  { text: "Optimizing infrastructure...", icon: Rocket, color: "text-green-400" },
]

export default function Home() {
  const { repoUrl, setRepoUrl, setAnalysisData, analysisData } = useStore()
  const [errorMsg, setErrorMsg] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  const mutation = useMutation({
    mutationFn: analyzeRepo,
    onSuccess: (data) => {
      setAnalysisData(data)
      setErrorMsg("")
      setCurrentStep(0)
    },
    onError: (error: Error) => {
      setErrorMsg(error.message)
      setAnalysisData(null)
      setCurrentStep(0)
    }
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (mutation.isPending) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
      }, 1500)
    } else {
      setCurrentStep(0)
    }
    return () => clearInterval(interval)
  }, [mutation.isPending])

  const handleAnalyze = () => {
    if (!repoUrl) {
      setErrorMsg("Please enter a valid GitHub URL")
      return
    }
    mutation.mutate(repoUrl)
  }

  return (
    <div className="flex flex-col relative overflow-hidden min-h-screen px-4 md:px-8 pb-32">
      {/* Background Animated Gradient & Grid */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-electric-blue/20 blur-[120px] rounded-full mix-blend-screen animate-blob" />
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-neon-purple/20 blur-[120px] rounded-full mix-blend-screen animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-cyan-glow/20 blur-[120px] rounded-full mix-blend-screen animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full pt-20 lg:pt-32 flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center space-y-8 max-w-4xl"
        >
          <Badge variant="outline" className="px-5 py-2 rounded-full border-electric-blue/30 bg-electric-blue/10 text-electric-blue backdrop-blur-md shadow-[0_0_15px_rgba(111,0,255,0.2)]">
            <span className="flex h-2.5 w-2.5 rounded-full bg-electric-blue mr-2.5 animate-pulse shadow-[0_0_10px_rgba(111,0,255,0.8)]" />
            CloudForge Engine v2.0 is live
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-100">
            Ship code at the <br className="hidden md:block" /> 
            <span className="text-gradient-primary">speed of thought.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            AI-powered infrastructure generation. Paste your GitHub repository and instantly generate Dockerfiles, CI/CD pipelines, and Terraform configurations.
          </p>
        </motion.div>

        {/* Repository Analyzer Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-3xl mt-16 group"
        >
          <div className="glow-border rounded-2xl p-[1px]">
            <div className="flex flex-col md:flex-row items-center bg-zinc-950/80 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl overflow-hidden relative z-10">
              <div className="flex-1 flex items-center w-full px-4 py-2 md:py-0">
                <GitBranch className="w-6 h-6 text-zinc-500 mr-3 flex-shrink-0" />
                <Input 
                  type="text" 
                  placeholder="https://github.com/username/project" 
                  className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-zinc-100 placeholder:text-zinc-600 h-12"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  disabled={mutation.isPending}
                />
              </div>
              <Button 
                size="lg" 
                className="w-full md:w-auto h-12 px-8 rounded-xl font-medium bg-gradient-to-r from-electric-blue to-neon-purple hover:opacity-90 transition-opacity border-0 text-white shadow-[0_0_20px_rgba(111,0,255,0.4)]"
                onClick={handleAnalyze}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Analyzing..." : (
                  <span className="flex items-center">Analyze <ArrowRight className="ml-2 w-5 h-5" /></span>
                )}
              </Button>
            </div>
          </div>
          {errorMsg && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-3 text-center">
              {errorMsg}
            </motion.p>
          )}
        </motion.div>

        {/* AI Loading State */}
        <AnimatePresence>
          {mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-12 w-full max-w-xl mx-auto overflow-hidden"
            >
              <div className="glassmorphism p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-electric-blue to-neon-purple"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-t-2 border-electric-blue"
                    />
                    {(() => {
                      const StepIcon = loadingSteps[currentStep].icon
                      return <StepIcon className={`w-5 h-5 ${loadingSteps[currentStep].color}`} />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-zinc-100 font-medium text-lg">AI Engine Analyzing</h3>
                    <motion.p 
                      key={currentStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-zinc-400 text-sm"
                    >
                      {loadingSteps[currentStep].text}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Default View (Before Analysis) */}
        {!analysisData && !mutation.isPending && (
          <div className="w-full relative z-10">
            <StackCards />
            <div className="mt-16 mb-8 text-center text-zinc-500 text-sm font-medium tracking-wider uppercase">
              How it works
            </div>
            <DeploymentFlow />
          </div>
        )}

        {/* Results View */}
        {analysisData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center pb-20"
          >
            <CodeViewer />
          </motion.div>
        )}

      </div>
    </div>
  )
}
