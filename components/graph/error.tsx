import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GraphErrorProps {
  error: string;
  onRetry?: () => void;
}

export function GraphError({ error, onRetry }: GraphErrorProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Graph</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
