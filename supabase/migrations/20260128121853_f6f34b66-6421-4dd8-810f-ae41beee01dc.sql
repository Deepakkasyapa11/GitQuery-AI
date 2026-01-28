-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table for storing README chunks with embeddings
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for vector similarity search
CREATE INDEX ON public.documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security (public read for this app)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the RAG queries
CREATE POLICY "Allow public read access" 
ON public.documents 
FOR SELECT 
USING (true);

-- Allow public insert for processing (in production, you'd want auth)
CREATE POLICY "Allow public insert" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

-- Allow public delete for clearing old data
CREATE POLICY "Allow public delete" 
ON public.documents 
FOR DELETE 
USING (true);

-- Create a function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;