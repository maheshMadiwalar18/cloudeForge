"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Sparkles, User, Bot, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/hooks/use-store"

interface Message {
  role: "user" | "assistant"
  content: string
}

const presetPrompts = [
  { label: "Optimize Dockerfile", query: "Optimize my Dockerfile for a FastAPI + Next.js microservices app." },
  { label: "Reduce AWS Costs", query: "What are some ways to reduce AWS hosting costs for my cloudforge-ui setup?" },
  { label: "Fix Deployment Error", query: "How do I fix a container crash due to a missing Redis environment variable?" }
]

const aiAnswers: Record<string, string> = {
  "optimize my dockerfile for a fastapi + next.js microservices app.": `Here is an optimized multi-stage **Dockerfile** for your Next.js frontend that reduces final image size by **~85%** (from 850MB to ~110MB):

\`\`\`dockerfile
# 1. Build dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Rebuild the source code
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production runner image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

**Key optimizations:**
- **Multi-stage builds**: Excludes build-time compilers and devDependencies from final layer.
- **Rootless user execution**: Runs as non-root user \`nextjs\` for high DevSecOps compliance.`,

  "what are some ways to reduce aws hosting costs for my cloudforge-ui setup?": `Based on your provisioned cloud infrastructure, here is a cost-savings breakdown to reduce your monthly bill by **30-40%**:

1. **ECS Fargate Spot Instances**:
   Change ECS launch configuration to use **Fargate Spot** for stateless containers.
   *Savings: ~70% off standard Fargate compute pricing ($15/mo → $4.50/mo).*

2. **Database Idle Sleeping**:
   Convert RDS database to **Aurora Serverless v2** and set minimum Capacity Units (ACUs) to 0.5. Configure database to automatically pause when no network connections exist.
   *Savings: ~50% off standard database instance pricing ($20/mo → $10/mo).*

3. **S3 Lifecycle Policies**:
   Apply rules to automatically move asset logs older than 30 days to **S3 Glacier Deep Archive**.
   *Savings: ~90% off storage tier costs.*`,

  "how do i fix a container crash due to a missing redis environment variable?": `If your container fails with a \`ConnectionError\` or similar error on startup:

1. **Check Environment Definition**:
   Make sure you specify the \`REDIS_URL\` environment variable. In docker-compose, link it like this:
   \`\`\`yaml
   environment:
     - REDIS_URL=redis://redis:6379/0
   \`\`\`

2. **Add a Startup Retry Loop in Backend**:
   Add a quick retry wrapper in your python backend main startup file:
   \`\`\`python
   import time
   import redis

   def wait_for_redis():
       r = redis.Redis(host='redis', port=6379)
       for i in range(10):
           try:
               r.ping()
               return r
           except redis.ConnectionError:
               time.sleep(1)
       raise Exception("Could not connect to Redis server.")
   \`\`\`

This stops backend container crashes if Redis boots up slightly slower than Python.`
}

const defaultResponse = "I can help you optimize your Dockerfiles, minimize cloud provider billing costs, write custom Terraform variables, or fix environment configurations. Pick a quick preset prompt below or ask me any question!"

export function AiAssistant() {
  const showToast = useStore((state) => state.showToast)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: defaultResponse }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const triggerAiResponse = (userQuery: string) => {
    setIsTyping(true)
    const normalizedQuery = userQuery.trim().toLowerCase()
    
    // Look up answer or use fallback
    const answer = aiAnswers[normalizedQuery] || 
      `I've analyzed your query regarding *"${userQuery}"*. For a demo environment, this configuration is fully supported. I recommend inspecting your generated [Terraform outputs](file:///c:/Users/mahes/Desktop/cloudeForge/frontend/src/app/infrastructure/page.tsx) or running a dry run using **Terraform Plan** in the Infrastructure tab.`

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: "assistant", content: answer }])
    }, 1500)
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: "user", content: text }])
    setInput("")
    triggerAiResponse(text)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) showToast("CloudForge AI Assistant activated!")
        }}
        className="fixed bottom-6 left-6 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-electric-blue to-neon-purple text-white shadow-[0_4px_20px_rgba(111,0,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {/* Slide-out Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -350 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -350 }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed inset-y-0 left-0 z-[998] w-96 bg-zinc-950/95 backdrop-blur-2xl border-r border-zinc-800/80 shadow-[10px_0_50px_rgba(0,0,0,0.8)] flex flex-col pt-16"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-electric-blue animate-pulse" />
                <span className="font-bold text-zinc-100 text-base">CloudForge Copilot</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-zinc-800 text-zinc-300" : "bg-electric-blue/15 text-electric-blue border border-electric-blue/20"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
                  </div>
                  <div className={`p-3.5 rounded-xl text-sm leading-relaxed max-w-[80%] ${
                    msg.role === "user" 
                      ? "bg-gradient-to-r from-electric-blue/15 to-neon-purple/15 text-zinc-200 border border-electric-blue/10" 
                      : "bg-zinc-900/60 text-zinc-300 border border-zinc-850 select-text"
                  }`}>
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-electric-blue/15 text-electric-blue border border-electric-blue/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts Panel */}
            <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-850">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Ask Copilot Quick-Prompts
              </span>
              <div className="flex flex-col gap-2">
                {presetPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSend(p.query)}
                    className="text-left text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-zinc-950 border-t border-zinc-850 flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask anything..."
                className="flex-1 bg-zinc-900 border-zinc-800 text-sm h-10"
              />
              <Button 
                onClick={() => handleSend(input)}
                className="bg-primary hover:opacity-90 transition-opacity border-0 text-white w-10 h-10 flex items-center justify-center p-0 shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </Button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
