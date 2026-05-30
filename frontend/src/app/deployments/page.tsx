"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  GitBranch, Server, Settings, Cloud, ArrowRight, Play, CheckCircle, 
  XCircle, Clock, Globe, Shield, RefreshCw, Terminal as TermIcon, AlertTriangle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/hooks/use-store"

interface LogLine {
  text: string
  type: "info" | "success" | "error" | "warn"
  time: string
}

export default function DeploymentsPage() {
  const showToast = useStore((state) => state.showToast)
  const [env, setEnv] = useState<"production" | "staging" | "development">("production")
  const [deployingPlatform, setDeployingPlatform] = useState<string | null>(null)
  const [deployProgress, setDeployProgress] = useState(0)
  const [logs, setLogs] = useState<LogLine[]>([])
  const terminalEndRef = useRef<HTMLDivElement>(null)

  // Initial mock logs based on env
  const initialLogs: Record<string, LogLine[]> = {
    production: [
      { text: "[SYSTEM] Initializing deployment listener...", type: "info", time: "12:04:10" },
      { text: "[GIT] Pulled latest commit 7f8a9b2 from branch 'main'", type: "info", time: "12:04:11" },
      { text: "[DOCKER] Scanning project structure...", type: "info", time: "12:04:12" },
      { text: "[DOCKER] Detected FastAPI backend & Next.js frontend.", type: "success", time: "12:04:12" },
      { text: "[DOCKER] Building multi-stage production images...", type: "info", time: "12:04:14" },
      { text: "[DOCKER] Docker layer cache utilized. Image size: 142MB", type: "success", time: "12:04:22" },
      { text: "[CI/CD] Security scanners passed (0 vulnerabilities).", type: "success", time: "12:04:25" },
      { text: "[AWS] Connecting to Amazon ECS cluster 'cloudforge-prod'...", type: "info", time: "12:04:26" },
      { text: "[AWS] Provisioning task definition revisions...", type: "info", time: "12:04:28" },
      { text: "[AWS] Service update initiated: Rolling update (2 tasks)", type: "info", time: "12:04:30" },
      { text: "[SYSTEM] Health checks passed. Routing traffic to new containers.", type: "success", time: "12:04:45" },
      { text: "[SUCCESS] Deployment completed successfully! Live URL: https://cloudforge.dev", type: "success", time: "12:04:46" },
    ],
    staging: [
      { text: "[SYSTEM] Triggered by auto-merge hook on 'staging' branch.", type: "info", time: "09:45:00" },
      { text: "[GIT] Cloning repository...", type: "info", time: "09:45:01" },
      { text: "[DOCKER] Creating development builds...", type: "info", time: "09:45:03" },
      { text: "[CI/CD] Running test suites (PyTest + Vitest)...", type: "info", time: "09:45:05" },
      { text: "[CI/CD] 142 tests passed, 0 failed.", type: "success", time: "09:45:18" },
      { text: "[RAILWAY] Deploying staging containers to Railway...", type: "info", time: "09:45:19" },
      { text: "[RAILWAY] Exposing dynamic staging port 3000...", type: "info", time: "09:45:24" },
      { text: "[SUCCESS] Staging build deployed. Live at https://staging.cloudforge.railway.app", type: "success", time: "09:45:30" },
    ],
    development: [
      { text: "[SYSTEM] Last local scan completed.", type: "info", time: "08:12:00" },
      { text: "[GIT] Branch 'dev-feature-auth' updated.", type: "info", time: "08:12:02" },
      { text: "[DOCKER] Local docker-compose container initialized.", type: "info", time: "08:12:04" },
      { text: "[ERROR] ModuleNotFound: No module named 'redis' in backend/main.py", type: "error", time: "08:12:08" },
      { text: "[ERROR] Container exited with exit code 1. Deployment failed.", type: "error", time: "08:12:09" },
    ]
  }

  useEffect(() => {
    setLogs(initialLogs[env])
  }, [env])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Trigger custom deploy animation
  const handleDeploy = (platform: string) => {
    if (deployingPlatform) return
    setDeployingPlatform(platform)
    setDeployProgress(0)
    showToast(`Initiating deployment to ${platform}...`)

    const currentLogs = [...initialLogs[env]]
    setLogs([
      ...currentLogs,
      { text: `[DEPLOYER] Starting active deployment pipeline to ${platform}...`, type: "info", time: new Date().toLocaleTimeString() }
    ])

    const interval = setInterval(() => {
      setDeployProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setDeployingPlatform(null)
            showToast(`Deployment to ${platform} Succeeded! 🎉`)
            setLogs((prevLogs) => [
              ...prevLogs,
              { text: `[DEPLOYER] Dynamic handshake with ${platform} API completed.`, type: "success", time: new Date().toLocaleTimeString() },
              { text: `[SUCCESS] Host cluster confirmed health. App is LIVE at https://demo-${platform.toLowerCase()}.cloudforge.dev`, type: "success", time: new Date().toLocaleTimeString() }
            ])
          }, 500)
          return 100
        }
        
        // Add realistic logs as it loads
        const nextVal = prev + 20
        if (nextVal === 20) {
          setLogs((prevLogs) => [...prevLogs, { text: `[${platform.toUpperCase()}] Creating cloud build containers...`, type: "info", time: new Date().toLocaleTimeString() }])
        } else if (nextVal === 60) {
          setLogs((prevLogs) => [...prevLogs, { text: `[${platform.toUpperCase()}] Running health validation probes...`, type: "info", time: new Date().toLocaleTimeString() }])
        } else if (nextVal === 80) {
          setLogs((prevLogs) => [...prevLogs, { text: `[${platform.toUpperCase()}] Configuring ingress reverse-proxies and TLS certificates...`, type: "info", time: new Date().toLocaleTimeString() }])
        }
        
        return nextVal
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 pb-32 pt-24 max-w-6xl mx-auto w-full relative z-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-800/60">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100 mb-2">Deployments</h1>
          <p className="text-zinc-400">Manage deployment statuses, view active container networks, and spin up environments.</p>
        </div>

        {/* Env Selector Tabs */}
        <div className="flex bg-zinc-900/60 p-[3px] rounded-xl border border-zinc-800/80 w-fit">
          {(["production", "staging", "development"] as const).map((item) => (
            <button
              key={item}
              onClick={() => !deployingPlatform && setEnv(item)}
              disabled={!!deployingPlatform}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                env === item 
                  ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(111,0,255,0.15)] border border-primary/20" 
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Metrics, Status & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Left Column: Status & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Indicator Card */}
          <div className="p-6 rounded-xl glassmorphism relative overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">Deployment Status</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  <span className="text-sm font-medium text-zinc-300">Production (Live)</span>
                </div>
                <span className="text-xs font-semibold text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">Running</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  <span className="text-sm font-medium text-zinc-300">Staging</span>
                </div>
                <span className="text-xs font-semibold text-yellow-400 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">Idle</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <span className="text-sm font-medium text-zinc-300">Development</span>
                </div>
                <span className="text-xs font-semibold text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">Failed</span>
              </div>

            </div>
          </div>

          {/* Metrics Card */}
          <div className="p-6 rounded-xl glassmorphism">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">Deployment Metrics ({env})</h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="bg-zinc-950/60 p-4 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Build Time</span>
                </div>
                <h4 className="text-xl font-bold text-zinc-200">
                  {env === "production" ? "45s" : env === "staging" ? "29s" : "Fail"}
                </h4>
              </div>

              <div className="bg-zinc-950/60 p-4 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Region</span>
                </div>
                <h4 className="text-xl font-bold text-zinc-200">us-west-2</h4>
              </div>

              <div className="bg-zinc-950/60 p-4 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Security</span>
                </div>
                <h4 className="text-xl font-bold text-zinc-200">100% Secure</h4>
              </div>

              <div className="bg-zinc-950/60 p-4 border border-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Server className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Uptime</span>
                </div>
                <h4 className="text-xl font-bold text-zinc-200">
                  {env === "production" ? "99.98%" : env === "staging" ? "99.8%" : "Offline"}
                </h4>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Pipeline & Interactive Deployments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pipeline Flow Visualizer */}
          <div className="p-6 rounded-xl glassmorphism relative overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-200 mb-6">Deployment Pipeline Flow</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-2xl mx-auto py-4">
              
              {/* Nodes */}
              {[
                { label: "Git Repo", icon: GitBranch, color: "text-zinc-400" },
                { label: "Build Engine", icon: Settings, color: "text-yellow-400" },
                { label: "Docker Image", icon: Server, color: "text-blue-400" },
                { label: "CI/CD Test", icon: CheckCircle, color: "text-green-400" },
                { label: "AWS Cluster", icon: Cloud, color: "text-purple-400" }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-center w-full md:w-auto">
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center relative shadow-lg group-hover:border-primary/50 group-hover:scale-105 transition-all">
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                      {deployingPlatform && deployProgress >= (idx * 20) + 10 && (
                        <div className="absolute inset-0 rounded-xl border border-electric-blue/70 animate-pulse shadow-[0_0_10px_rgba(111,0,255,0.4)]" />
                      )}
                    </div>
                    <span className="text-xs font-semibold mt-2.5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {step.label}
                    </span>
                  </div>

                  {idx < 4 && (
                    <div className="flex items-center justify-center my-2 md:my-0 md:mx-3 h-6 md:h-12 w-full md:w-10">
                      <ArrowRight className="w-5 h-5 text-zinc-600 rotate-90 md:rotate-0" />
                    </div>
                  )}
                </div>
              ))}

            </div>
          </div>

          {/* Quick Deploy Buttons */}
          <div className="p-6 rounded-xl glassmorphism">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">One-Click Deploy Trigger</h3>
            
            {deployingPlatform ? (
              <div className="bg-zinc-950/60 p-5 border border-zinc-800/60 rounded-xl space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-electric-blue" />
                    Deploying to {deployingPlatform}...
                  </span>
                  <span className="text-electric-blue">{deployProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-electric-blue to-neon-purple"
                    animate={{ width: `${deployProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleDeploy("AWS")}
                  className="h-14 font-bold border-0 bg-gradient-to-r from-electric-blue to-neon-purple hover:opacity-90 transition-opacity text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(111,0,255,0.2)]"
                >
                  <Cloud className="w-5 h-5" />
                  Deploy to AWS
                </Button>
                <Button 
                  onClick={() => handleDeploy("Railway")}
                  className="h-14 font-bold border border-zinc-700 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 text-yellow-400" />
                  Deploy to Railway
                </Button>
                <Button 
                  onClick={() => handleDeploy("Render")}
                  className="h-14 font-bold border border-zinc-700 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 text-green-400" />
                  Deploy to Render
                </Button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Terminal logs viewer */}
      <div className="mt-8 p-6 rounded-xl glassmorphism">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TermIcon className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-200">Terminal Output Logs</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tty Connected</span>
          </div>
        </div>

        {/* Code Terminal Box */}
        <div className="h-64 bg-zinc-950/90 rounded-lg p-4 font-mono text-xs overflow-y-auto border border-zinc-850 flex flex-col space-y-2 select-text selection:bg-zinc-800">
          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-3 leading-relaxed ${
                  log.type === "error" 
                    ? "text-red-400" 
                    : log.type === "success" 
                    ? "text-green-400" 
                    : log.type === "warn" 
                    ? "text-yellow-400" 
                    : "text-zinc-300"
                }`}
              >
                <span className="text-zinc-600 select-none">{log.time}</span>
                <span className="flex-1">{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={terminalEndRef} />
        </div>
      </div>

    </div>
  )
}
