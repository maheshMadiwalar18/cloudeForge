import Link from "next/link"
import { Github, LayoutDashboard, Settings, Box, CloudLightning } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl hidden md:flex flex-col z-40 fixed left-0 top-16 bottom-0">
      <div className="flex-1 py-6 px-4 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors">
          <Box className="w-5 h-5" />
          Deployments
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors">
          <CloudLightning className="w-5 h-5" />
          Infrastructure
        </Link>
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors">
          <Github className="w-5 h-5" />
          Repositories
        </Link>
      </div>
      <div className="p-4">
        <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
