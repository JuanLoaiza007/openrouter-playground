import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";

export function ChatMessages({
  messages,
  loading,
  error,
  onCopy,
  isStreaming,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !loading && (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p>Inicia una conversación escribiendo abajo</p>
        </div>
      )}

      {messages.map((msg, i) => {
        const isLastMessage = i === messages.length - 1;
        const showCursor = isLastMessage && isStreaming;

        return (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              } ${isLastMessage && isStreaming ? "streaming-message" : ""}`}
            >
              <div className="flex justify-between items-start gap-2">
                <p className="whitespace-pre-wrap text-sm">
                  {msg.content}
                  {showCursor && (
                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />
                  )}
                </p>
                {msg.content && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-50 hover:opacity-100 flex-shrink-0"
                    onClick={() => onCopy(msg.content)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {loading && messages.length === 0 && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Generando respuesta...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex justify-start">
          <div className="bg-destructive/10 text-destructive rounded-lg p-3">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
