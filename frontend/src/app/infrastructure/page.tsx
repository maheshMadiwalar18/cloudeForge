"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Editor from "@monaco-editor/react"
import { 
  Server, Database, HardDrive, Cpu, ShieldAlert, DollarSign, 
  Settings, CheckCircle, RefreshCw, AlertTriangle, ArrowDown 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/hooks/use-store"

const tfFiles = {
  "main.tf": `# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "cloudforge-vpc"
  }
}

resource "aws_security_group" "web_sg" {
  name        = "web-secgroup"
  vpc_id      = aws_vpc.main.id
  description = "Allow inbound HTTP/HTTPS traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "CloudForge-Application-Server"
  }
}

resource "aws_db_instance" "database" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.t3.micro"
  db_name              = "cloudforge"
  username             = "postgres"
  password             = "super_secret_password_change_me"
  skip_final_snapshot  = true
}`,
  "variables.tf": `# variables.tf
variable "aws_region" {
  type        = string
  description = "The target AWS region for deployment"
  default     = "us-west-2"
}

variable "instance_type" {
  type        = string
  description = "EC2 Instance hardware profile"
  default     = "t2.micro"
}`,
  "outputs.tf": `# outputs.tf
output "web_public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "Public IP address of the deployed EC2 server"
}

output "database_endpoint" {
  value       = aws_db_instance.database.endpoint
  description = "Connection endpoint of the PostgreSQL instance"
}`
}

export default function InfrastructurePage() {
  const showToast = useStore((state) => state.showToast)
  const [activeFile, setActiveFile] = useState<"main.tf" | "variables.tf" | "outputs.tf">("main.tf")
  const [isPlanning, setIsPlanning] = useState(false)
  const [planLogs, setPlanLogs] = useState<string[]>([])
  
  // Cost breakdown
  const costs = [
    { name: "EC2 App Server (t2.micro)", cost: 15 },
    { name: "PostgreSQL Database (RDS)", cost: 20 },
    { name: "S3 Storage Assets", cost: 5 }
  ]
  const totalCost = costs.reduce((sum, item) => sum + item.cost, 0)

  // Security suggestions
  const securityIssues = [
    { title: "Open security group detected", severity: "high", desc: "Port 22/80 allows global traffic. Consider narrowing CIDR blocks." },
    { title: "Public subnet database", severity: "medium", desc: "Database lies inside public subnet. Restrict to private subnet." },
    { title: "Missing HTTPS redirection", severity: "low", desc: "VPC load balancer should enforce TLS connections." }
  ]

  const handleTerraformPlan = () => {
    if (isPlanning) return
    setIsPlanning(true)
    setPlanLogs([])
    showToast("Running 'terraform plan' validation...")

    const logs = [
      "[TERRAFORM] Initializing modules...",
      "[TERRAFORM] Refreshing state... [id: aws_vpc.main]",
      "[TERRAFORM] Comparing configuration changes...",
      "[TERRAFORM] Plan: 3 to add, 0 to change, 0 to destroy.",
      "[SUCCESS] Terraform Dry Run validated! Configuration is valid."
    ]

    let step = 0
    const interval = setInterval(() => {
      if (step >= logs.length) {
        clearInterval(interval)
        setIsPlanning(false)
        showToast("Terraform validation passed! Configuration is valid.")
        return
      }
      setPlanLogs(prev => [...prev, logs[step]])
      step++
    }, 700)
  }

  return (
    <div className="flex flex-col min-h-screen px-4 md:px-8 pb-32 pt-24 max-w-6xl mx-auto w-full relative z-10">
      
      {/* Page Header */}
      <div className="pb-8 border-b border-zinc-800/60">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 mb-2">Infrastructure</h1>
        <p className="text-zinc-400">View generated Terraform declarations, resource layouts, and cloud cost predictions.</p>
      </div>

      {/* Grid: Resource Summary & Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {[
          { label: "Servers", val: "1 EC2 Node", icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Databases", val: "1 RDS Postgres", icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Storage", val: "1 S3 Bucket", icon: HardDrive, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { label: "Health", val: "98% Healthy", icon: Cpu, color: "text-green-500", bg: "bg-green-500/10" }
        ].map((card, idx) => (
          <div key={idx} className="p-5 rounded-xl glassmorphism flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{card.label}</span>
              <h4 className="text-lg font-bold text-zinc-200 mt-0.5">{card.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        
        {/* Left: Topology, Cost, Security (Column span: 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Topology Visualizer */}
          <div className="p-6 rounded-xl glassmorphism relative overflow-hidden">
            <h3 className="text-lg font-bold text-zinc-200 mb-6">Generated Architecture</h3>
            
            {/* Visual Graph Diagram */}
            <div className="flex flex-col items-center gap-2 max-w-xs mx-auto py-2">
              
              <div className="w-40 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-semibold text-xs text-zinc-300 relative shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 absolute top-2 right-2 animate-ping" />
                VPC Load Balancer
              </div>
              
              <ArrowDown className="w-5 h-5 text-zinc-700 my-1 animate-bounce" />
              
              <div className="w-40 py-2.5 rounded-lg bg-zinc-900 border border-zinc-850 text-center font-semibold text-xs text-zinc-300 relative shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 absolute top-2 right-2" />
                EC2 App Server
              </div>
              
              <ArrowDown className="w-5 h-5 text-zinc-700 my-1" />
              
              <div className="w-40 py-2.5 rounded-lg bg-zinc-900 border border-zinc-850 text-center font-semibold text-xs text-zinc-300 relative shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-purple-500 absolute top-2 right-2" />
                RDS PostgreSQL
              </div>

            </div>
          </div>

          {/* Cost Predictor */}
          <div className="p-6 rounded-xl glassmorphism">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">Cloud Cost Estimation</h3>
            <div className="space-y-3">
              {costs.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">{item.name}</span>
                  <span className="text-zinc-200 font-bold">${item.cost}/mo</span>
                </div>
              ))}
              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm font-semibold">
                <span className="text-zinc-300">Estimated Total</span>
                <span className="text-gradient-primary text-lg font-bold">${totalCost}/month</span>
              </div>
            </div>
          </div>

          {/* Security Panel */}
          <div className="p-6 rounded-xl glassmorphism">
            <h3 className="text-lg font-bold text-zinc-200 mb-4">Security Insights</h3>
            <div className="space-y-4">
              {securityIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/40">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${
                    issue.severity === "high" ? "text-red-500" : issue.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                  }`} />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200 leading-tight">{issue.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{issue.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Monaco Editor + Action Logs (Column span: 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* File Editor Box */}
          <div className="flex flex-col h-[520px] rounded-xl glassmorphism overflow-hidden">
            
            {/* Editor Tabs Header */}
            <div className="flex items-center justify-between px-4 h-12 bg-zinc-950 border-b border-zinc-850 shrink-0">
              <div className="flex gap-2">
                {(["main.tf", "variables.tf", "outputs.tf"] as const).map((file) => (
                  <button
                    key={file}
                    onClick={() => setActiveFile(file)}
                    className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                      activeFile === file ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handleTerraformPlan}
                  disabled={isPlanning}
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold h-7 px-3.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isPlanning ? "animate-spin" : ""}`} />
                  Terraform Plan
                </Button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 bg-[#1e1e1e]">
              <Editor
                height="100%"
                language="hcl"
                theme="vs-dark"
                value={tfFiles[activeFile]}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  fontFamily: 'var(--font-geist-mono), monospace'
                }}
              />
            </div>

          </div>

          {/* Action Log Box (only shows if logs exist) */}
          {planLogs.length > 0 && (
            <div className="p-5 rounded-xl glassmorphism bg-zinc-950/80 border-zinc-850">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4.5 h-4.5 text-zinc-400" />
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan Action Output</h4>
              </div>
              <div className="font-mono text-xs text-zinc-400 space-y-1.5">
                {planLogs.map((log, idx) => (
                  <div key={idx} className={log.includes("[SUCCESS]") ? "text-green-400" : "text-zinc-300"}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
