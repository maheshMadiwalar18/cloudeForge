# ⚛️ CloudForge DevOps - React.js Frontend Architecture

This document details the target architecture for transitioning the CloudForge DevOps frontend from the Streamlit MVP to a production-grade **React.js Single Page Application (SPA)** using **TypeScript** and **Tailwind CSS**.

---

## 1. Recommended Tech Stack & Libraries

To build a modern, high-performance SaaS dashboard, the following ecosystem is recommended:

*   **Framework**: **Vite + React** (Fastest local development for SPAs) or **Next.js** (If SEO or Server-Side Rendering becomes necessary).
*   **Styling**: **Tailwind CSS** (Utility-first, rapid UI) paired with **shadcn/ui** (Accessible, unstyled Radix primitives).
*   **Code Editor**: **`@monaco-editor/react`** (Embeds the exact engine powering VS Code directly into the browser).
*   **State Management (Global)**: **Zustand** (Much lighter and less boilerplate than Redux for managing UI themes and Auth state).
*   **State Management (Server/API)**: **TanStack Query (React Query)** (Crucial for polling the FastAPI backend and caching responses automatically).
*   **Animations**: **Framer Motion** (For smooth page transitions and the Lottie-style loading steps).
*   **Icons**: **Lucide React** (Clean, consistent SVG icons).

---

## 2. Folder Structure

A highly modular, feature-based folder structure inside the `src/` directory:

```text
cloudforge-frontend/
├── src/
│   ├── assets/                 # Images, Lottie JSON files, global CSS
│   ├── components/
│   │   ├── ui/                 # Reusable dump components (Buttons, Cards, Inputs - e.g. shadcn)
│   │   ├── layout/             # Sidebar, Header, PageContainer
│   │   └── shared/             # LoadingSpinner, ErrorBoundary
│   │
│   ├── features/               # Domain-specific modules
│   │   ├── analysis/           # Repo analyzer logic
│   │   │   ├── components/     # RepoInputBar, StatusStepper
│   │   │   ├── hooks/          # useAnalyzeRepo.ts (React Query mutations)
│   │   │   └── api/            # Axios calls for this feature
│   │   │
│   │   ├── code-viewer/        # Monaco editor integration
│   │   │   ├── components/     # MonacoTabs, DownloadButtons
│   │   │   └── hooks/          # useDownloadZip.ts
│   │   │
│   │   └── auth/               # Authentication flows
│   │
│   ├── pages/                  # Page-level components routing
│   │   ├── Dashboard.tsx
│   │   ├── Analyzer.tsx
│   │   └── Settings.tsx
│   │
│   ├── store/                  # Zustand global state (e.g. themeStore.ts, userStore.ts)
│   ├── lib/                    # Utility functions (axios instance, tailwind merge)
│   ├── types/                  # Global TypeScript interfaces
│   ├── App.tsx                 # Main router provider (react-router-dom)
│   └── main.tsx                # React DOM render entrypoint
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Component Architecture

### The "Repo Analyzer" Page Flow
1.  **`<RepoInput />`**: A sleek Tailwind-styled text input. On submit, it calls the `useAnalyzeRepo` mutation from React Query.
2.  **`<AnalysisStepper />`**: A Framer Motion animated component that listens to the API polling status (IDLE -> CLONING -> GENERATING -> DONE).
3.  **`<CodeViewerTabs />`**: Renders only when status is DONE. Uses `@monaco-editor/react` to display the Dockerfile, Compose, and Terraform code.

### The "Code Viewer" Component (Monaco Integration)
```tsx
// Example pseudo-code for the Code Viewer component
import Editor from '@monaco-editor/react';

export const CodeEditor = ({ code, language }: { code: string, language: string }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <Editor
        height="60vh"
        theme="vs-dark"
        language={language} // 'dockerfile', 'yaml', 'hcl'
        value={code}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          readOnly: false, // Let users edit before downloading
        }}
      />
    </div>
  );
};
```

---

## 4. API Integration Flow (React Query + Axios)

Because the FastAPI backend uses Celery to generate code asynchronously, the frontend cannot just wait for a single HTTP response. It must **poll** the backend. React Query makes this trivial:

1.  **Trigger**: User clicks "Analyze". Axios sends `POST /api/v1/analyze`. The backend immediately returns a `task_id` (HTTP 202).
2.  **Poll**: React Query uses `useQuery` with the `refetchInterval` option enabled. It hits `GET /api/v1/tasks/{task_id}` every 2000ms.
3.  **Resolve**: Once the API returns `{ status: "COMPLETED", data: {...} }`, React Query automatically halts the polling (`refetchInterval: false`) and updates the UI state to render the Monaco editors.

```typescript
// Example Polling Hook
export const useTaskStatus = (taskId: string | null) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => axios.get(`/api/v1/tasks/${taskId}`).then(res => res.data),
    enabled: !!taskId, // Only run if we have an ID
    refetchInterval: (data) => (data?.status === 'COMPLETED' || data?.status === 'ERROR' ? false : 2000),
  });
};
```

---

## 5. UI/UX "Dark Mode" Tailwind Implementation

For the DevOps aesthetic, we configure `tailwind.config.js` with deep semantic colors:
```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Deep Void Blue
        surface: 'rgba(30, 41, 59, 0.7)', // Glassmorphism base
        primary: {
          DEFAULT: '#10B981', // Terminal Green
          hover: '#059669',
        },
        editor: '#1E1E1E', // VS Code dark background
      },
    },
  },
}
```

By combining Tailwind's `backdrop-blur-md bg-surface` utility classes, you achieve the exact Glassmorphism "Cyber-Terminal" aesthetic proposed in the UI/UX design document.
