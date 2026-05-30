import Link from "next/link"
import { Cloud, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TopNav() {
  return (
    <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl fixed top-0 w-full z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(111,0,255,0.5)]">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-100 hidden sm:block">
          CloudForge
        </Link>
        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary border border-primary/30 rounded-full">
          BETA
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-zinc-900/50 border-zinc-800 pl-9 h-9 text-sm focus-visible:ring-primary/50"
          />
        </div>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border border-zinc-700 cursor-pointer" />
      </div>
    </header>
  )
}
