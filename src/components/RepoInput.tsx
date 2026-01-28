import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Loader2 } from "lucide-react";

interface RepoInputProps {
  onProcess: (url: string) => void;
  isProcessing: boolean;
}

export function RepoInput({ onProcess, isProcessing }: RepoInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onProcess(url.trim());
    }
  };

  const isValidGitHubUrl = (url: string) => {
    return /github\.com\/[^\/]+\/[^\/]+/.test(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <div className="relative flex-1">
        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="url"
          placeholder="https://github.com/owner/repository"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pl-10"
          disabled={isProcessing}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isProcessing || !isValidGitHubUrl(url)}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          "Process Repo"
        )}
      </Button>
    </form>
  );
}
