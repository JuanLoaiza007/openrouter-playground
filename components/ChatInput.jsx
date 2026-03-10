import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  loading,
  disabled,
}) {
  return (
    <div className="p-4 border-t bg-card">
      <form onSubmit={onSubmit} className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe tu mensaje... (Shift+Enter para nueva línea)"
          className="min-h-[80px] resize-none"
          disabled={disabled}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
          <Button type="submit" disabled={loading || !value.trim()}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
