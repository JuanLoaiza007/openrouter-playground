import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  onModelChange,
  onParamChange,
  onApiKeyChange,
  onSaveApiKey,
  children,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Ajusta el modelo, parámetros y API key
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
            <p className="text-xs text-muted-foreground">
              Controla la aleatoriedad
            </p>
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
