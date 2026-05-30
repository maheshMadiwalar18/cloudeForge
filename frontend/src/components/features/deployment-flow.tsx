import { motion } from "framer-motion"
import { Github, FileCode, CheckCircle, Cloud, ArrowRight } from "lucide-react"

const nodes = [
  { id: "github", label: "GitHub Repo", icon: Github, color: "text-zinc-100", bg: "bg-zinc-800" },
  { id: "docker", label: "Container Build", icon: FileCode, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "cicd", label: "CI/CD Pipeline", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  { id: "aws", label: "Cloud Deploy", icon: Cloud, color: "text-purple-500", bg: "bg-purple-500/10" },
]

export function DeploymentFlow() {
  return (
    <div className="w-full py-12 px-4 rounded-xl glassmorphism mt-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-zinc-100 mb-2">Automated Deployment Architecture</h3>
          <p className="text-zinc-400">Generated infrastructure flow from source to production</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
          {nodes.map((node, index) => (
            <div key={node.id} className="flex flex-col md:flex-row items-center relative group">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${node.bg} border border-zinc-700/50 shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
                  <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <node.icon className={`w-8 h-8 ${node.color} relative z-10`} />
                </div>
                <span className="mt-4 font-medium text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  {node.label}
                </span>
              </motion.div>
              
              {index < nodes.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  transition={{ delay: index * 0.2 + 0.1, duration: 0.4 }}
                  className="hidden md:flex items-center justify-center w-16 lg:w-24 px-2"
                >
                  <div className="h-0.5 w-full bg-gradient-to-r from-zinc-700 via-primary to-zinc-700 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full w-1/3 bg-white/80 blur-[1px]"
                      animate={{ left: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 ml-1 flex-shrink-0" />
                </motion.div>
              )}
              {index < nodes.length - 1 && (
                <ArrowRight className="md:hidden w-6 h-6 text-zinc-600 my-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
