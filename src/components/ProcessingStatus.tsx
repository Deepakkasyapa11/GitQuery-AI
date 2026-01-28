import { CheckCircle2, Loader2, XCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type ProcessingState = "idle" | "processing" | "success" | "error";

interface ProcessingStatusProps {
  state: ProcessingState;
  message?: string;
  chunks?: number;
}

export function ProcessingStatus({ state, message, chunks }: ProcessingStatusProps) {
  if (state === "idle") {
    return (
      <Card className="w-full max-w-2xl bg-muted/50">
        <CardContent className="flex items-center gap-4 p-6">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Ready to Process</p>
            <p className="text-sm text-muted-foreground">
              Enter a GitHub repository URL above to analyze its README
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "processing") {
    return (
      <Card className="w-full max-w-2xl border-primary/50 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-6">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <div>
            <p className="font-medium">Processing Repository</p>
            <p className="text-sm text-muted-foreground">
              {message || "Fetching README and generating embeddings..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "success") {
    return (
      <Card className="w-full max-w-2xl border-green-500/50 bg-green-500/5">
        <CardContent className="flex items-center gap-4 p-6">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">
              Successfully Processed
            </p>
            <p className="text-sm text-muted-foreground">
              {chunks
                ? `Created ${chunks} searchable chunks. You can now ask questions!`
                : message || "Repository is ready for questions!"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-center gap-4 p-6">
        <XCircle className="h-8 w-8 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Processing Failed</p>
          <p className="text-sm text-muted-foreground">
            {message || "An error occurred while processing the repository"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
