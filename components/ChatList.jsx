import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MessageCircle, Trash2 } from "lucide-react";

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  editingChatId,
  editingTitle,
  onStartEditing,
  onSaveTitle,
  onTitleKeyDown,
  sidebarOpen,
  onCloseSidebar,
  isMobile,
}) {
  return (
    <div
      className={`fixed md:relative z-30 md:z-0 inset-0 md:inset-auto w-64 border-r bg-background md:bg-muted/20 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Mobile overlay backdrop */}
      {isMobile && (
        <div
          className="absolute inset-0 bg-black/50 -z-10"
          onClick={onCloseSidebar}
        />
      )}

      <div className="p-3 border-b relative z-10 bg-background">
        {isMobile && (
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Chats</span>
            <Button variant="ghost" size="icon" onClick={onCloseSidebar}>
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
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </Button>
          </div>
        )}
        <Button onClick={onNewChat} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Nuevo Chat</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              onSelectChat(chat.id);
              if (isMobile) onCloseSidebar();
            }}
            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
              activeChatId === chat.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              {editingChatId === chat.id ? (
                <Input
                  value={editingTitle}
                  onChange={(e) => onStartEditing(chat.id, e.target.value)}
                  onKeyDown={(e) => onTitleKeyDown(e, chat.id)}
                  onBlur={() => onSaveTitle(chat.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 text-sm flex-1"
                  autoFocus
                />
              ) : (
                <span
                  className="truncate text-sm flex-1"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onStartEditing(chat.id, chat.title);
                  }}
                >
                  {chat.title}
                </span>
              )}
            </div>
            {editingChatId !== chat.id && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${
                    activeChatId === chat.id ? "opacity-100" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditing(chat.id, chat.title);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${
                    activeChatId === chat.id ? "opacity-100" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id, e);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
