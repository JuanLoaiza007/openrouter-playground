import { useState, useEffect } from "react";

const STORAGE_KEY = "openrouter-chats";

const DEFAULT_PARAMS = {
  temperature: 0.7,
  max_tokens: 4096,
  top_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  structured_output: null,
  system_message: "",
  use_history: true,
};

const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

export function useChats() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setChats(parsed.chats || []);
        setActiveChatId(parsed.activeChatId || null);
      } catch (e) {
        console.error("Failed to parse chats from localStorage:", e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined" || chats.length === 0) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        chats,
        activeChatId,
      }),
    );
  }, [chats, activeChatId]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "Nuevo Chat",
      messages: [],
      model: DEFAULT_MODEL,
      params: { ...DEFAULT_PARAMS },
      createdAt: new Date().toISOString(),
    };

    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
    return newChat.id;
  };

  const deleteChat = (chatId) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== chatId);
      if (filtered.length === 0) {
        const newChat = {
          id: Date.now().toString(),
          title: "Nuevo Chat",
          messages: [],
          model: DEFAULT_MODEL,
          params: { ...DEFAULT_PARAMS },
          createdAt: new Date().toISOString(),
        };
        setActiveChatId(newChat.id);
        return [newChat];
      }
      if (activeChatId === chatId) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const updateChat = (chatId, updates) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat)),
    );
  };

  const getActiveChat = () => {
    return chats.find((c) => c.id === activeChatId) || null;
  };

  return {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    deleteChat,
    updateChat,
    getActiveChat,
  };
}
