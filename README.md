# GitQuery AI 🚀
> *Instant Intelligence for any GitHub Repository.*

**GitQuery AI** is a high-performance RAG (Retrieval-Augmented Generation) system that allows you to "talk" to any GitHub repository. By parsing READMEs and documentation into a vector database, it provides instant, context-aware answers to complex architectural and functional questions.

## ✨ Features
* **URL-to-Insight:** Drop any public GitHub URL and start analyzing.
* **Vector-Powered Search:** Uses **Google Gemini 1.5 Flash** embeddings to understand code context.
* **Intelligent Q&A:** Ask questions about setup, APIs, or project structure and get accurate, cited answers.
* **Minimalist UI:** Built with React and Tailwind for a lightning-fast, distraction-free experience.

## 🛠️ Tech Stack
* **Frontend:** React + Vite + Shadcn UI
* **Database/Vector Store:** Supabase (pgvector)
* **AI Model:** Google Gemini 1.5 Flash
* **Deployment:** Vercel / Netlify / Lovable

## 🚀 Setup
1. Clone the repo.
2. Install dependencies: `npm install`.
3. Set up environment variables: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
4. Run locally: `npm run dev`.
