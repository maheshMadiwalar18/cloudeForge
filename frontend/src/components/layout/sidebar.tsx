"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Github, LayoutDashboard, Settings, Box, CloudLightning } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl hidden md:flex flex-col z-40 fixed left-0 top-16 bottom-0">
      <div className="flex-1 py-6 px-4 space-y-1">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
            isActive("/") 
              ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(111,0,255,0.05)] border border-primary/20" 
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link 
          href="/deployments" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
            isActive("/deployments") 
              ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(111,0,255,0.05)] border border-primary/20" 
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          }`}
        >
          <Box className="w-5 h-5" />
          Deployments
        </Link>
        <Link 
          href="/infrastructure" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
            isActive("/infrastructure") 
              ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(111,0,255,0.05)] border border-primary/20" 
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          }`}
        >
          <CloudLightning className="w-5 h-5" />
          Infrastructure
        </Link>
        <Link 
          href="/repositories" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
            isActive("/repositories") 
              ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(111,0,255,0.05)] border border-primary/20" 
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          }`}
        >
          <Github className="w-5 h-5" />
          Repositories
        </Link>
      </div>
      <div className="p-4">
        <Link 
          href="#" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
