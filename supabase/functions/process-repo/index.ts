import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChunkMetadata {
  repo_url: string;
  chunk_index: number;
  total_chunks: number;
}

function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }
  
  return chunks;
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini embedding error: ${error}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { repoUrl } = await req.json();
    
    if (!repoUrl) {
      throw new Error("Repository URL is required");
    }

    // Parse GitHub URL to get owner and repo
    const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = repoUrl.match(urlPattern);
    
    if (!match) {
      throw new Error("Invalid GitHub repository URL");
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    // Fetch README from GitHub API
    const readmeUrl = `https://api.github.com/repos/${owner}/${cleanRepo}/readme`;
    const readmeResponse = await fetch(readmeUrl, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    });

    if (!readmeResponse.ok) {
      throw new Error(`Failed to fetch README: ${readmeResponse.status}`);
    }

    const readmeContent = await readmeResponse.text();
    
    // Get API keys
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Clear existing documents for this repo
    await supabase
      .from("documents")
      .delete()
      .eq("metadata->>repo_url", repoUrl);

    // Chunk the README content
    const chunks = chunkText(readmeContent);
    console.log(`Processing ${chunks.length} chunks for ${owner}/${cleanRepo}`);

    // Generate embeddings and store each chunk
    const insertPromises = chunks.map(async (chunk, index) => {
      const embedding = await generateEmbedding(chunk, geminiApiKey);
      
      const metadata: ChunkMetadata = {
        repo_url: repoUrl,
        chunk_index: index,
        total_chunks: chunks.length,
      };

      return supabase.from("documents").insert({
        content: chunk,
        metadata,
        embedding: JSON.stringify(embedding),
      });
    });

    await Promise.all(insertPromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${chunks.length} chunks from ${owner}/${cleanRepo}`,
        chunks: chunks.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process repo error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
