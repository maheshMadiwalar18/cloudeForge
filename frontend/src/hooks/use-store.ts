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
  toastMessage: string | null
  showToast: (message: string) => void
  hideToast: () => void
}

export const useStore = create<AppState>((set) => ({
  repoUrl: '',
  setRepoUrl: (url) => set({ repoUrl: url }),
  analysisData: null,
  setAnalysisData: (data) => set({ analysisData: data }),
  toastMessage: null,
  showToast: (message) => {
    set({ toastMessage: message })
  },
  hideToast: () => set({ toastMessage: null })
}))
