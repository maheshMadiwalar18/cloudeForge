import { create } from 'zustand'

export interface AnalysisData {
  dockerfile: string
  githubActions: string
  terraform: string
}

interface AppState {
  repoUrl: string
  setRepoUrl: (url: string) => void
  analysisData: AnalysisData | null
  setAnalysisData: (data: AnalysisData | null) => void
}

export const useStore = create<AppState>((set) => ({
  repoUrl: '',
  setRepoUrl: (url) => set({ repoUrl: url }),
  analysisData: null,
  setAnalysisData: (data) => set({ analysisData: data })
}))
