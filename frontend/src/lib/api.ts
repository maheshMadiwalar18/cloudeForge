import { AnalysisData } from "@/hooks/use-store"

export const analyzeRepo = async (url: string): Promise<AnalysisData> => {
  // Simulate network delay for analysis
  await new Promise(resolve => setTimeout(resolve, 2500))
  
  if (url.toLowerCase().includes("error")) {
    throw new Error("Failed to clone or analyze the repository.")
  }
  
  return {
    dockerfile: "FROM node:18-alpine\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci\n\nCOPY . .\n\nEXPOSE 3000\nCMD [\"npm\", \"start\"]",
    githubActions: "name: CI/CD Pipeline\n\non:\n  push:\n    branches: [ main ]\n\njobs:\n  test-and-build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - name: Use Node.js\n      uses: actions/setup-node@v3\n      with:\n        node-version: '18.x'\n        cache: 'npm'\n    - run: npm ci\n    - run: npm test\n    - run: npm run build",
    terraform: 'terraform {\n  required_providers {\n    aws = {\n      source  = "hashicorp/aws"\n      version = "~> 4.16"\n    }\n  }\n  required_version = ">= 1.2.0"\n}\n\nprovider "aws" {\n  region = "us-west-2"\n}\n\nresource "aws_instance" "app_server" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "t2.micro"\n\n  tags = {\n    Name        = "CloudForge-WebApp"\n    Environment = "Production"\n    ManagedBy   = "Terraform"\n  }\n}'
  }
}
