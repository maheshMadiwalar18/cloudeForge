"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  GitBranch, Folder, File, ArrowRight, ShieldAlert, Cpu, 
  Lightbulb, RefreshCw, Plus, CheckCircle, Search, Trash2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/hooks/use-store"

interface RepoData {
  id: string
  name: string
  url: string
  framework: string
  badges: string[]
  lastAnalyzed: string
  status: "ready" | "scanning" | "failed"
  insights: string[]
  recommendations: string[]
  structure: any
  dockerfileContent: string
  actionsContent: string
  tfContent: string
}

const mockRepositories: RepoData[] = [
  {
    id: "cloudforge-ui",
    name: "cloudforge-ui",
    url: "https://github.com/cloudforge/cloudforge-ui",
    framework: "Next.js + Tailwind",
    badges: ["React", "TypeScript", "Next.js", "TailwindCSS"],
    lastAnalyzed: "2 mins ago",
    status: "ready",
    insights: [
      "Missing Dockerfile (development profile only)",
      "CI/CD workflow configured (outdated GitHub Actions v3)",
      "Production domain environment variables are missing"
    ],
    recommendations: [
      "Migrate to multi-stage Docker build to decrease image size from 850MB to 110MB.",
      "Upgrade actions/checkout to v4 in deploy.yml.",
      "Implement gzip/brotli compression on static assets."
    ],
    structure: {
      type: "folder",
      name: "cloudforge-ui",
      children: [
        { type: "folder", name: "src", children: [
          { type: "folder", name: "app", children: [
            { type: "file", name: "layout.tsx" },
            { type: "file", name: "page.tsx" }
          ]},
          { type: "folder", name: "components", children: [
            { type: "file", name: "navbar.tsx" },
            { type: "file", name: "sidebar.tsx" }
          ]}
        ]},
        { type: "file", name: "package.json" },
        { type: "file", name: "next.config.ts" }
      ]
    },
    dockerfileContent: "FROM node:18-alpine AS base\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nEXPOSE 3000\nCMD [\"npm\", \"start\"]",
    actionsContent: "name: CI/CD Pipeline\non:\n  push:\n    branches: [ main ]\njobs:\n  test-and-build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - run: npm ci\n    - run: npm run build",
    tfContent: "resource \"aws_instance\" \"web\" {\n  ami           = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t2.micro\"\n}"
  },
  {
    id: "user-backend-api",
    name: "user-backend-api",
    url: "https://github.com/username/user-backend-api",
    framework: "Python + FastAPI",
    badges: ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
    lastAnalyzed: "1 hour ago",
    status: "ready",
    insights: [
      "No GitHub Actions CI/CD workflows detected",
      "Secrets stored in source code (.env file committed to git)",
      "Database schema matches microservice standard pattern"
    ],
    recommendations: [
      "Create automated GitHub Actions testing suite using pytest.",
      "Move database secrets from source code to AWS Secrets Manager.",
      "Add Redis caching to optimize database connection pooling."
    ],
    structure: {
      type: "folder",
      name: "user-backend-api",
      children: [
        { type: "folder", name: "app", children: [
          { type: "folder", name: "api", children: [
            { type: "file", name: "users.py" },
            { type: "file", name: "auth.py" }
          ]},
          { type: "file", name: "main.py" },
          { type: "file", name: "config.py" }
        ]},
        { type: "file", name: "requirements.txt" },
        { type: "file", name: "Dockerfile" }
      ]
    },
    dockerfileContent: "FROM python:3.9-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\"]",
    actionsContent: "name: Python API CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - name: Run pytest\n      run: pip install -r requirements.txt && pytest",
    tfContent: "resource \"aws_db_instance\" \"db\" {\n  allocated_storage = 20\n  engine            = \"postgres\"\n  instance_class    = \"db.t3.micro\"\n}"
  }
]

export default function RepositoriesPage() {
  const router = useRouter()
  const showToast = useStore((state) => state.showToast)
  const setAnalysisData = useStore((state) => state.setAnalysisData)
  
  const [repositories, setRepositories] = useState<RepoData[]>(mockRepositories)
  const [selectedRepoId, setSelectedRepoId] = useState<string>("cloudforge-ui")
  const [newRepoUrl, setNewRepoUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const selectedRepo = repositories.find(r => r.id === selectedRepoId) || repositories[0]

  const handleScanRepository = () => {
    if (!newRepoUrl) {
      showToast("Please enter a valid GitHub URL.")
      return
    }
    if (isScanning) return
    setIsScanning(true)
    setScanProgress(0)
    showToast("Analyzing Repository Metadata...")

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsScanning(false)
            
            // Create a mock repository record
            const newRepoName = newRepoUrl.split("/").pop() || "scanned-repo"
            const newRepo: RepoData = {
              id: newRepoName.toLowerCase(),
              name: newRepoName,
              url: newRepoUrl,
              framework: "Node.js Express",
              badges: ["JavaScript", "Express", "Docker"],
              lastAnalyzed: "Just now",
              status: "ready",
              insights: [
                "Docker configuration is present but outdated",
                "No Terraform cloud deployment script detected"
              ],
              recommendations: [
                "Configure cloud-optimized Docker container structure.",
                "Generate production Terraform cluster configuration."
              ],
              structure: {
                type: "folder",
                name: newRepoName,
                children: [
                  { type: "folder", name: "src", children: [
                    { type: "file", name: "index.js" }
                  ]},
                  { type: "file", name: "package.json" },
                  { type: "file", name: "Dockerfile" }
                ]
              },
              dockerfileContent: "FROM node:18-slim\nWORKDIR /usr/src/app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"src/index.js\"]",
              actionsContent: "name: Node CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - run: npm install && npm test",
              tfContent: "resource \"aws_instance\" \"node_server\" {\n  ami = \"ami-0c55b159cbfafe1f0\"\n  instance_type = \"t2.micro\"\n}"
            }

            setRepositories(prev => [newRepo, ...prev])
            setSelectedRepoId(newRepo.id)
            setNewRepoUrl("")
            showToast(`Repository ${newRepoName} scanned successfully!`)
          }, 300)
          return 100
        }
        return prev + 25
      })
    }, 500)
  }

  // Load configs in Monaco editor home page
  const handleLoadConfigs = () => {
    setAnalysisData({
      dockerfile: selectedRepo.dockerfileContent,
      githubActions: selectedRepo.actionsContent,
      terraform: selectedRepo.tfContent
    })
    showToast(`Configurations for ${selectedRepo.name} loaded into Monaco editor.`)
    router.push("/")
  }

  const handleDeleteRepo = (id: string, name: string) => {
    setRepositories(prev => prev.filter(r => r.id !== id))
    showToast(`Deleted ${name} connections.`)
    if (selectedRepoId === id) {
      setSelectedRepoId("cloudforge-ui")
    }
  }

  // Mini recursive tree renderer component
  const renderTree = (node: any, depth = 0) => {
    if (node.type === "file") {
      return (
        <div key={node.name} style={{ paddingLeft: `${depth * 16 + 12}px` }} className="flex items-center gap-2 py-1 text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-semibold select-none cursor-pointer">
          <File className="w-3.5 h-3.5 text-zinc-500" />
          <span>{node.name}</span>
        </div>
      )
    }

    return (
      <div key={node.name}>
        <div style={{ paddingLeft: `${depth * 16 + 12}px` }} className="flex items-center gap-2 py-1 text-zinc-300 hover:text-zinc-100 transition-colors text-xs font-bold select-none cursor-pointer">
          <Folder className="w-3.5 h-3.5 text-yellow-500/80 fill-yellow-500/10" />
          <span>{node.name}</span>
        </div>
        {node.children && node.children.map((child: any) => renderTree(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 pb-32 pt-24 max-w-6xl mx-auto w-full relative z-10">
      
      {/* Page Header */}
      <div className="pb-8 border-b border-zinc-800/60">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 mb-2">Repositories</h1>
        <p className="text-zinc-400">Connect public/private GitHub links to instantly auto-detect and scaffold cloud settings.</p>
      </div>

      {/* Grid: Repo Connector and Repo list (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        
        {/* Left column: Connector & Connected List (col: 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Connector card */}
          <div className="p-6 rounded-xl glassmorphism">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">Connect Repository</h3>
            
            {isScanning ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-zinc-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-electric-blue" />
                    Scanning code context...
                  </span>
                  <span className="text-electric-blue">{scanProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-electric-blue to-neon-purple"
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo" 
                  className="flex-1 bg-zinc-900/50 border-zinc-800 text-sm h-10"
                />
                <Button 
                  onClick={handleScanRepository}
                  className="bg-primary hover:opacity-90 transition-opacity border-0 text-white font-semibold h-10 px-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Scan
                </Button>
              </div>
            )}
          </div>

          {/* Connected Repo List */}
          <div className="p-6 rounded-xl glassmorphism space-y-4">
            <h3 className="text-lg font-bold text-zinc-200">Connected Repositories</h3>
            
            <div className="space-y-3">
              {repositories.map((repo) => (
                <div 
                  key={repo.id}
                  onClick={() => setSelectedRepoId(repo.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start ${
                    selectedRepoId === repo.id 
                      ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(111,0,255,0.05)]" 
                      : "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700/60"
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-zinc-200 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-zinc-400" />
                      {repo.name}
                    </h4>
                    <p className="text-xs text-zinc-500">{repo.framework} • {repo.lastAnalyzed}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-green-400 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                      Analyzed
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRepo(repo.id, repo.name)
                      }}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Selected Inspector Details (col: 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 rounded-xl glassmorphism space-y-6">
            
            {/* Header Inspector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
              <div>
                <h3 className="text-xl font-bold text-zinc-200">{selectedRepo.name}</h3>
                <a href={selectedRepo.url} target="_blank" className="text-xs text-zinc-500 hover:text-primary transition-colors font-medium">
                  {selectedRepo.url}
                </a>
              </div>
              <Button 
                onClick={handleLoadConfigs}
                className="bg-gradient-to-r from-electric-blue to-neon-purple border-0 text-white font-bold h-10 px-5 shadow-[0_0_15px_rgba(111,0,255,0.3)] hover:opacity-90 transition-opacity"
              >
                Load Configurations
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            {/* Badges Stack */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Detected Stack</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRepo.badges.map((tag) => (
                  <span key={tag} className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-zinc-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid Insights & Structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Structure Tree */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Repo File Structure</h4>
                <div className="bg-zinc-950/80 p-4 border border-zinc-850 rounded-xl max-h-56 overflow-y-auto">
                  {renderTree(selectedRepo.structure)}
                </div>
              </div>

              {/* AI Insights list */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vulnerabilities & Gaps</h4>
                <div className="space-y-2">
                  {selectedRepo.insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-zinc-400 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-850">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recommendations */}
            <div className="space-y-3 p-5 bg-zinc-950/40 border border-zinc-850 rounded-xl">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                AI Optimization Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400 list-disc list-inside">
                {selectedRepo.recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
