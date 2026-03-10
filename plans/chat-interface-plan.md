# Plan: Interfaz de Chat OpenRouter

## Requisitos del Usuario
- Interfaz moderna, minimalista y sencilla
- Campo de texto libre para cambiar modelos de OpenRouter manualmente
- Experimentar con parámetros de OpenRouter
- Cambiar rápidamente entre modelos
- Exportar chat o configuración

## Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatInterface                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Header / Toolbar                        │  │
│  │  [Modelo Input] [Parámetros] [Exportar] [Limpiar]          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ChatMessages                            │  │
│  │  - Mensaje de usuario (alineado derecha)                   │  │
│  │  - Mensaje del modelo (alineado izquierda)                 │  │
│  │  - Indicador de carga durante respuestas                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ChatInput                               │  │
│  │  [Campo de texto multilínea] [Enviar]                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes a Crear

### 1. Componente: `ChatInterface` (page.jsx)
- Componente principal que gestiona el estado global del chat
- Estado: mensajes, modelo actual, parámetros, cargando

### 2. Componente: `ModelSelector`
- Input de texto libre para especificar el modelo
- Ejemplos: `anthropic/claude-3.5-sonnet`, `openai/gpt-4o`, etc.
- Validación de formato

### 3. Componente: `ParameterPanel` (collapsible)
- Temperature (0-2)
- Max tokens (1-32000)
- Top P (0-1)
- Presence penalty (-2 - 2)
- Frequency penalty (-2 - 2)

### 4. Componente: `ChatMessages`
- Lista de mensajes con estilos diferenciados
- Soporte para código con syntax highlighting básico
- timestamps opcionales

### 5. Componente: `ChatInput`
- Textarea con auto-resize
- Keyboard shortcut: Enter para enviar, Shift+Enter para nueva línea

### 6. Funciones de Exportación
- Exportar chat como JSON
- Exportar configuración como JSON
- Copiar al portapapeles

## API de OpenRouter

```javascript
// Endpoint
POST https://openrouter.ai/api/v1/chat/completions

// Headers
Authorization: Bearer sk-or-v1-...
Content-Type: application/json

// Body
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {"role": "user", "content": "..."}
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}
```

## Plan de Implementación

1. Crear `lib/api.js` - Funciones para llamar a OpenRouter
2. Crear componentes UI necesarios (input, textarea, slider, etc.)
3. Crear `app/page.jsx` con la interfaz completa
4. Implementar exportación de chat/configuración
5. Estilizar con Tailwind para diseño minimalista
