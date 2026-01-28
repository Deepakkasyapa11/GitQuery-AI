import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

async function generateChatResponse(
  question: string,
  context: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful assistant that answers questions about GitHub repositories based on their README documentation.

Context from the repository README:
${context}

Question: ${question}

Please provide a clear and helpful answer based on the context provided. If the context doesn't contain enough information to answer the question, say so.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini chat error: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, repoUrl } = await req.json();

    if (!question) {
      throw new Error("Question is required");
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question, geminiApiKey);

    // Search for similar documents using the match_documents function
    const { data: matches, error: matchError } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: JSON.stringify(questionEmbedding),
        match_threshold: 0.3,
        match_count: 5,
      }
    );

    if (matchError) {
      console.error("Match error:", matchError);
      throw new Error(`Failed to search documents: ${matchError.message}`);
    }

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I don't have any information about this repository yet. Please process a repository first.",
          sources: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Combine context from matched documents
    const context = matches
      .map((m: { content: string; similarity: number }) => m.content)
      .join("\n\n---\n\n");

    // Generate response using Gemini
    const answer = await generateChatResponse(question, context, geminiApiKey);

    return new Response(
      JSON.stringify({
        answer,
        sources: matches.map((m: { content: string; similarity: number }) => ({
          content: m.content.substring(0, 200) + "...",
          similarity: m.similarity,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
