import { useState } from "react";
import { RepoInput } from "@/components/RepoInput";
import { ProcessingStatus, ProcessingState } from "@/components/ProcessingStatus";
import { ChatInterface } from "@/components/ChatInterface";
import { supabase } from "@/integrations/supabase/client";
import { Github } from "lucide-react";
import { toast } from "sonner";
const Index = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>();
  const [processedChunks, setProcessedChunks] = useState<number>();
  const [currentRepoUrl, setCurrentRepoUrl] = useState<string>();
  const handleProcess = async (repoUrl: string) => {
    setProcessingState("processing");
    setStatusMessage("Fetching README and generating embeddings...");
    setCurrentRepoUrl(repoUrl);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("process-repo", {
        body: {
          repoUrl
        }
      });
      if (error) throw error;
      if (data.success) {
        setProcessingState("success");
        setProcessedChunks(data.chunks);
        toast.success(`Processed ${data.chunks} chunks successfully!`);
      } else {
        throw new Error(data.error || "Processing failed");
      }
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingState("error");
      setStatusMessage(error instanceof Error ? error.message : "An error occurred");
      toast.error("Failed to process repository");
    }
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Github className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">GitHub Repo Insight</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered repository documentation analysis
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center gap-8 text-secondary-foreground bg-secondary">
        {/* Input Section */}
        <section className="w-full flex flex-col items-center gap-2">
          <h2 className="text-lg font-medium text-center">
            Enter a GitHub Repository URL
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-2">
            We'll analyze the README and let you ask questions about it
          </p>
          <RepoInput onProcess={handleProcess} isProcessing={processingState === "processing"} />
        </section>

        {/* Status Section */}
        <section className="w-full flex justify-center">
          <ProcessingStatus state={processingState} message={statusMessage} chunks={processedChunks} />
        </section>

        {/* Chat Section */}
        <section className="w-full flex justify-center">
          <ChatInterface repoUrl={currentRepoUrl} isReady={processingState === "success"} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <p className="text-center text-sm text-muted-foreground">
          Powered by Gemini 1.5 Flash • RAG-based document analysis
        </p>
      </footer>
    </div>;
};
export default Index;