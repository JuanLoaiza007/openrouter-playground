"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code, AlertTriangle } from "lucide-react";

export function JsonViewer({ content, isStructuredOutput = false }) {
  const [copied, setCopied] = useState(false);

  // Try to parse as JSON
  let jsonData = null;
  let isValidJson = false;

  if (content) {
    try {
      jsonData = JSON.parse(content);
      isValidJson = true;
    } catch (e) {
      // Not valid JSON
      isValidJson = false;
    }
  }

  // If structured output is enabled and we have valid JSON, show formatted
  if (isStructuredOutput) {
    if (isValidJson && jsonData) {
      return (
        <div className="relative rounded-lg border bg-muted/50 p-3 font-mono text-sm overflow-x-auto w-full">
          <div className="flex items-center justify-between mb-2 border-b border-border pb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Code className="w-3 h-3" />
              JSON Estructurado
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                navigator.clipboard.writeText(content);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      );
    } else if (content) {
      // Structured output enabled but response is not valid JSON
      return (
        <div className="relative rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm w-full">
          <div className="flex items-center gap-2 text-xs text-destructive mb-1">
            <AlertTriangle className="w-3 h-3" />
            La respuesta no es JSON válido
          </div>
          <p className="text-xs text-muted-foreground">{content}</p>
        </div>
      );
    }
  }

  // Fallback: show nothing (let ChatMessages handle regular content)
  return null;
}
