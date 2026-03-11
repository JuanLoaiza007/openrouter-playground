"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChats } from "@/lib/hooks";
import { useTheme } from "@/lib/useTheme";
import {
  sendMessage,
  sendMessageStream,
  exportChat,
  exportConfig,
} from "@/lib/api";
import { DEFAULT_MODEL, DEFAULT_PARAMS } from "@/lib/constants";
import { Loader2, Send, Download, Settings, Trash2 } from "lucide-react";

import { ChatList } from "@/components/ChatList";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    deleteChat,
    updateChat,
    getActiveChat,
  } = useChats();

  const { theme, setTheme } = useTheme();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  // Detect mobile on client side
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeChat = getActiveChat();
  const messages = activeChat?.messages || [];
  const model = activeChat?.model || DEFAULT_MODEL;
  const params = activeChat?.params || DEFAULT_PARAMS;
  const structuredOutput = params?.structured_output || null;
  const systemMessage = params?.system_message || "";

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load API key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("openrouter-api-key");
    if (stored) setCustomApiKey(stored);
  }, []);

  const saveApiKey = (key) => {
    setCustomApiKey(key);
    localStorage.setItem("openrouter-api-key", key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !activeChat) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];

    updateChat(activeChat.id, { messages: newMessages });
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Check if structured output is enabled
      const hasStructuredOutput =
        params.structured_output &&
        params.structured_output.enabled &&
        params.structured_output.schema;

      // Build messages with system message if present
      const systemMessage = params.system_message;
      const messagesWithSystem = systemMessage
        ? [{ role: "system", content: systemMessage }, ...newMessages]
        : newMessages;

      console.log(
        "[handleSubmit] params.structured_output:",
        params.structured_output,
      );
      console.log("[handleSubmit] hasStructuredOutput:", hasStructuredOutput);

      if (hasStructuredOutput) {
        // Structured output requires non-streaming
        const response = await sendMessage(messagesWithSystem, model, {
          temperature: params.temperature,
          max_tokens: params.max_tokens,
          top_p: params.top_p,
          presence_penalty: params.presence_penalty,
          frequency_penalty: params.frequency_penalty,
          structured_output: params.structured_output,
        });

        const content = response.content;
        updateChat(activeChat.id, {
          messages: [...newMessages, { role: "assistant", content }],
        });
      } else {
        // Add placeholder for streaming response
        const placeholderMessage = { role: "assistant", content: "" };
        updateChat(activeChat.id, {
          messages: [...newMessages, placeholderMessage],
        });

        let finalContent = "";

        // Streaming for normal messages
        await sendMessageStream(
          messagesWithSystem,
          model,
          {
            temperature: params.temperature,
            max_tokens: params.max_tokens,
            top_p: params.top_p,
            presence_penalty: params.presence_penalty,
            frequency_penalty: params.frequency_penalty,
          },
          (content) => {
            finalContent = content;
            updateChat(activeChat.id, {
              messages: [...newMessages, { role: "assistant", content }],
            });
          },
        );
      }

      if (messages.length === 0) {
        const title =
          userMessage.content.slice(0, 30) +
          (userMessage.content.length > 30 ? "..." : "");
        updateChat(activeChat.id, { title });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    if (!activeChat) return;
    updateChat(activeChat.id, { messages: [] });
    setError(null);
  };

  const handleExportChat = () => {
    const data = exportChat(messages);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${activeChat?.title || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportConfig = () => {
    const data = exportConfig(model, params);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleModelChange = (newModel) => {
    if (!activeChat) return;
    updateChat(activeChat.id, { model: newModel });
  };

  const handleParamChange = (key, value) => {
    if (!activeChat) return;
    updateChat(activeChat.id, { params: { ...params, [key]: value } });
  };

  const handleStructuredOutputChange = (newStructuredOutput) => {
    console.log(
      "[handleStructuredOutputChange] new value:",
      newStructuredOutput,
    );
    if (!activeChat) return;
    updateChat(activeChat.id, {
      params: { ...params, structured_output: newStructuredOutput },
    });
  };

  const handleSystemMessageChange = (newSystemMessage) => {
    if (!activeChat) return;
    updateChat(activeChat.id, {
      params: { ...params, system_message: newSystemMessage },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b p-2 md:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <h1 className="text-lg md:text-xl font-bold">OpenRouter</h1>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
            <SettingsDialog
              model={model}
              params={params}
              apiKey={customApiKey}
              structuredOutput={structuredOutput}
              systemMessage={systemMessage}
              onModelChange={handleModelChange}
              onParamChange={handleParamChange}
              onApiKeyChange={setCustomApiKey}
              onSaveApiKey={saveApiKey}
              onStructuredOutputChange={handleStructuredOutputChange}
              onSystemMessageChange={handleSystemMessageChange}
            >
              <Button
                id="settings-btn"
                variant="outline"
                size="sm"
                className="gap-1 md:gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Parámetros</span>
              </Button>
            </SettingsDialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 md:gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportChat}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportConfig}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Config
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="gap-1 md:gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>

            <ThemeToggle theme={theme} onThemeChange={setTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-73px)] relative">
        {/* Chat List Sidebar */}
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onDeleteChat={(id, e) => deleteChat(id)}
          onNewChat={createNewChat}
          editingChatId={editingChatId}
          editingTitle={editingTitle}
          onStartEditing={(id, title) => {
            setEditingChatId(id);
            setEditingTitle(title);
          }}
          onSaveTitle={(id) => {
            if (editingTitle.trim()) {
              updateChat(id, { title: editingTitle.trim() });
            }
            setEditingChatId(null);
            setEditingTitle("");
          }}
          onTitleKeyDown={(e, id) => {
            if (e.key === "Enter") {
              if (editingTitle.trim()) {
                updateChat(id, { title: editingTitle.trim() });
              }
              setEditingChatId(null);
              setEditingTitle("");
            } else if (e.key === "Escape") {
              setEditingChatId(null);
              setEditingTitle("");
            }
          }}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Model Indicator */}
          <div className="p-2 md:p-3 border-b bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Modelo:</span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {model}
              </span>
            </div>
          </div>

          {/* Messages */}
          <ChatMessages
            messages={messages}
            loading={loading}
            error={error}
            isStreaming={loading && messages.length > 0}
            onCopy={(text) => navigator.clipboard.writeText(text)}
          />

          {/* Input */}
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            loading={loading}
          />

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
