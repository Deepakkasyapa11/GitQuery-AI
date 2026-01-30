# GitQuery AI 
**A high-performance RAG system for instant repository intelligence.**
GitQuery AI is a high-performance RAG (Retrieval-Augmented Generation) system that allows you to "talk" to any GitHub repository. By parsing READMEs and documentation into a vector database, it provides instant, context-aware answers to complex architectural and functional questions.
GitQuery AI allows developers to "talk" to any GitHub codebase. By leveraging Retrieval-Augmented Generation (RAG), the system parses README documentation, generates vector embeddings, and provides context-aware answers to technical queries.
<img width="928" height="557" alt="Screenshot (125)" src="https://github.com/user-attachments/assets/87d87ee6-0ed6-45d3-bd44-95e7c914c2fe" />



# Core Tech Stack
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
* **UI Components:** Shadcn UI (Radix UI)
* **Vector Database:** Supabase (PostgreSQL + `pgvector`)
* **AI Engine:** Google Gemini 1.5 Flash (for Embeddings & Chat)
* **Deployment:** Vercel

# How It Works
1.  **Ingestion:** Extracts content from public GitHub repositories via REST API.
2.  **Vectorization:** Processes markdown text into 768-dimensional vectors using `text-embedding-004`.
3.  **Storage:** Stores high-dimensional data in a Supabase PGVector table with IVFFlat indexing for speed.
4.  **Retrieval:** When a user asks a question, the system performs a cosine similarity search to find relevant context.
5.  **Generation:** Gemini 1.5 Flash synthesizes the retrieved context into a clear, cited answer.

# Local Setup
1. **Clone the repository:**
   `git clone https://github.com/Deepakkasyapa11/GitQuery-AI.git`
2. **Install dependencies:**
   `npm install`
3. **Environment Variables:**
   Create a `.env` file with your `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`.
4. **Launch:**
   `npm run dev`

---
*Developed by Deepakkasyapa11*
