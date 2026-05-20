# 🎨 CloudForge DevOps - UI/UX Design System

This document outlines the professional UI/UX design guidelines for the CloudForge DevOps frontend. The goal is to create an interface that feels like a premium, state-of-the-art developer tool.

---

## 1. Aesthetic & Color Palette

**Theme**: "Cyber-Terminal" (Modern Dark Mode with Glassmorphism)
The design borrows heavily from modern IDEs and premium developer tools like Vercel and Linear.

### 🎨 Color Palette
*   **App Background (`#0B0F19`)**: A very deep, almost-black navy blue. Avoid pure `#000000` as it causes high-contrast eye strain.
*   **Glass Cards (`rgba(30, 41, 59, 0.7)`)**: Transparent slate grey with `backdrop-filter: blur(12px)`. Creates a 3D depth effect.
*   **Primary Accent (`#10B981`)**: Emerald/Terminal Green. Used for primary calls-to-action (e.g., the "Analyze Repository" button).
*   **Secondary Accent (`#3B82F6`)**: Electric Blue. Used for active tabs, links, and secondary interactive elements.
*   **Typography**:
    *   *Headers & UI*: **Inter** or **Outfit** for clean, modern readability.
    *   *Code Blocks & Metrics*: **JetBrains Mono** or **Fira Code** for that authentic DevOps terminal feel.

---

## 2. Global Layout & Component Arrangement

### Sidebar Navigation (The Control Center)
Instead of a top navbar, developer tools perform best with a persistent left-hand sidebar.
*   **Top**: App Logo (🚀 CloudForge) and Environment Switcher (Development vs Production).
*   **Middle**: Multi-page navigation (Dashboard, Analyzer, Files, Deployment).
*   **Bottom**: Cloud Credentials (AWS/GCP), User Profile, and Theme Toggle.

### Main Content Area
*   **Max Width**: Constrain content to a readable `1200px` rather than stretching infinitely on ultrawide monitors.
*   **Card-based UI**: Every distinct section (a chart, a code block, an input form) sits inside a Glassmorphism card with a subtle 1px border (`rgba(255, 255, 255, 0.1)`).

---

## 3. Page Flow & UI Layout

### Page 1: 📊 Dashboard (Overview)
*   **Hero Metrics**: 4 glass cards displaying vital stats: *Repos Analyzed (34)*, *Hours Saved (120h)*, *Active Deployments (3)*, *Avg Generation Time (12s)*.
*   **Recent Activity Table**: A sleek table showing recent repo scans with status badges (🟢 Success, 🔴 Failed, 🟡 In Progress).

### Page 2: 🔍 Repo Analyzer (The Core Action)
*   **Hero Input**: A massive, centrally aligned search bar style input for the GitHub URL.
*   **Micro-interactions**: When the input is focused, a subtle glowing box-shadow (`0 0 15px rgba(16, 185, 129, 0.3)`) appears.
*   **Animated Loading Section**: Replaces the standard Streamlit spinner with a custom `streamlit-lottie` animation (e.g., a radar scanning a server or a terminal typing rapidly) accompanied by a stepped progress bar:
    1. *Cloning Repo*
    2. *Building AST*
    3. *Prompting LLM*
    4. *Finalizing Files*

### Page 3: 💻 Generated Files (The IDE View)
*   **Layout**: A large tabbed interface mimicking VS Code.
*   **Code Preview**: Instead of static text, embed `streamlit-ace` or Monaco Editor. Apply the "One Dark Pro" syntax highlighting theme.
*   **Action Bar**: Below the code, a sticky floating bar with modern, pill-shaped buttons: `[ 📋 Copy ]`, `[ ⬇️ Download ]`, `[ 🐙 Push to PR ]`.

### Page 4: 🚀 Deployment Suggestions
*   **Cost Estimates**: A visual breakdown (pie chart or stacked bar) showing estimated AWS costs (Compute vs Storage) based on the generated Terraform.
*   **Architecture Diagram**: Use Streamlit's `st.graphviz_chart` or Mermaid.js to visually map out the generated infrastructure (e.g., EC2 -> S3 -> RDS).
*   **One-Click Deploy**: A massive CTA button labeled **"Deploy to AWS"** with an accompanying warning icon about potential cloud charges.

---

## 4. UX Improvements (Streamlit Specific)

To elevate Streamlit beyond its standard "data science script" look:
1.  **Hide the Hamburger Menu**: Inject CSS to hide `#MainMenu` and the default Streamlit footer to make it feel like a real web app.
2.  **Toast Notifications**: Use `st.toast()` for non-intrusive success messages (e.g., "Copied to clipboard!") instead of massive green `st.success()` banners that shift the page layout.
3.  **Skeleton Loaders**: While waiting for the LLM to return code, render gray "skeleton" blocks that pulse, giving the illusion of speed rather than a static blank screen.
4.  **Button Hover States**: Add CSS transitions to buttons so they lift up by `2px` and cast a shadow when hovered over, making the UI feel tactile and alive.
