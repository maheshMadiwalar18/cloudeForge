import { motion } from "framer-motion"
import { Server, Settings, Cloud } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const cards = [
  {
    title: "Containerization",
    description: "Optimized multi-stage Dockerfiles tailored to your specific framework.",
    icon: Server,
    color: "text-primary",
    bg: "bg-primary/10",
    borderHover: "hover:border-primary/50",
  },
  {
    title: "CI/CD Pipelines",
    description: "Automated GitHub Actions workflows for testing and seamless deployment.",
    icon: Settings,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    borderHover: "hover:border-blue-500/50",
  },
  {
    title: "Infrastructure as Code",
    description: "Terraform configurations to provision AWS, GCP, or Azure resources safely.",
    icon: Cloud,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    borderHover: "hover:border-purple-500/50",
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
}

export function StackCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24"
    >
      {cards.map((card, idx) => (
        <motion.div key={idx} variants={cardVariants}>
          <Card className={`glassmorphism-card h-full ${card.borderHover} group overflow-hidden relative`}>
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative z-10">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <CardTitle className="text-zinc-100 text-xl font-semibold">{card.title}</CardTitle>
              <CardDescription className="text-zinc-400 mt-2 leading-relaxed">
                {card.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
