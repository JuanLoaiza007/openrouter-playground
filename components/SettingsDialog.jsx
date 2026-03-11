import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { POPULAR_MODELS } from "@/lib/constants";

export function SettingsDialog({
  open,
  onOpenChange,
  model,
  params,
  apiKey,
  structuredOutput,
  systemMessage,
  useHistory,
  onModelChange,
  onParamChange,
  onApiKeyChange,
  onSaveApiKey,
  onStructuredOutputChange,
  onSystemMessageChange,
  onUseHistoryChange,
  children,
}) {
  const [schemaInput, setSchemaInput] = useState(
    structuredOutput?.enabled && structuredOutput?.schema
      ? JSON.stringify(structuredOutput.schema, null, 2)
      : '{\n  "type": "object",\n  "properties": {\n    "field": {\n      "type": "string"\n    }\n  }\n}',
  );

  // Sync schemaInput when structuredOutput prop changes
  useEffect(() => {
    if (structuredOutput?.enabled && structuredOutput?.schema) {
      const newSchemaStr = JSON.stringify(structuredOutput.schema, null, 2);
      if (newSchemaStr !== schemaInput) {
        setSchemaInput(newSchemaStr);
      }
    }
  }, [structuredOutput]);

  const handleSchemaChange = (value) => {
    setSchemaInput(value);
    try {
      const parsed = JSON.parse(value);
      onStructuredOutputChange({
        enabled: true,
        schema: parsed,
      });
    } catch (e) {
      // Invalid JSON, don't update yet
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Ajusta el modelo, parámetros y configuración
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selector */}
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
            />
            <div className="flex flex-wrap gap-1">
              {POPULAR_MODELS.slice(0, 4).map((m) => (
                <Button
                  key={m}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => onModelChange(m)}
                >
                  {m.split("/")[1]}
                </Button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              onBlur={(e) => onSaveApiKey(e.target.value)}
              placeholder="sk-or-v1-... (dejar vacío para usar .env)"
            />
          </div>

          <hr />

          {/* System Message */}
          <div className="space-y-2">
            <Label>Instrucciones del Sistema</Label>
            <Textarea
              value={systemMessage || ""}
              onChange={(e) => onSystemMessageChange(e.target.value)}
              placeholder="Ej: Eres un asistente que responde en formato JSON..."
              className="min-h-[80px]"
            />
          </div>

          {/* Use History Toggle */}
          <div className="flex items-center justify-between">
            <Label>Usar historial del chat</Label>
            <button
              type="button"
              onClick={() => onUseHistoryChange(!useHistory)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useHistory ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useHistory ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <hr />

          {/* Structured Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Structured Output (JSON)</Label>
              <button
                type="button"
                onClick={() =>
                  onStructuredOutputChange({
                    enabled: !structuredOutput?.enabled,
                    schema: structuredOutput?.schema || {
                      type: "object",
                      properties: { field: { type: "string" } },
                    },
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  structuredOutput?.enabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    structuredOutput?.enabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {structuredOutput?.enabled && (
              <div className="space-y-2">
                <Textarea
                  value={schemaInput}
                  onChange={(e) => handleSchemaChange(e.target.value)}
                  placeholder='{"type": "object", "properties": {...}}'
                  className="font-mono text-xs min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Define el esquema JSON que debe seguir la respuesta
                </p>
              </div>
            )}
          </div>

          <hr />

          {/* Parameters */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {params.temperature}
              </span>
            </div>
            <Slider
              value={[params.temperature]}
              onValueChange={([v]) => onParamChange("temperature", v)}
              min={0}
              max={2}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Max Tokens</Label>
              <span className="text-sm text-muted-foreground">
                {params.max_tokens}
              </span>
            </div>
            <Slider
              value={[params.max_tokens]}
              onValueChange={([v]) => onParamChange("max_tokens", v)}
              min={1}
              max={32000}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Top P</Label>
              <span className="text-sm text-muted-foreground">
                {params.top_p}
              </span>
            </div>
            <Slider
              value={[params.top_p]}
              onValueChange={([v]) => onParamChange("top_p", v)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Presence Penalty</Label>
              <span className="text-sm text-muted-foreground">
                {params.presence_penalty}
              </span>
            </div>
            <Slider
              value={[params.presence_penalty]}
              onValueChange={([v]) => onParamChange("presence_penalty", v)}
              min={-2}
              max={2}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Frequency Penalty</Label>
              <span className="text-sm text-muted-foreground">
                {params.frequency_penalty}
              </span>
            </div>
            <Slider
              value={[params.frequency_penalty]}
              onValueChange={([v]) => onParamChange("frequency_penalty", v)}
              min={-2}
              max={2}
              step={0.1}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onParamChange("temperature", 0.7);
              onParamChange("max_tokens", 4096);
              onParamChange("top_p", 1);
              onParamChange("presence_penalty", 0);
              onParamChange("frequency_penalty", 0);
              onStructuredOutputChange({ enabled: false, schema: null });
            }}
            variant="outline"
          >
            Restablecer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
