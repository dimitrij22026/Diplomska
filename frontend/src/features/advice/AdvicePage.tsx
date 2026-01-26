import { useState, useRef, useEffect, useCallback } from "react"
import type { FormEvent } from "react"
import { Trash2, Send, Sparkles, MessageCircle, Bot, Plus, MessageSquare, ChevronLeft } from "lucide-react"

import { useConversations, useConversation, useAskAdvice, useDeleteConversation, useClearAdviceHistory } from "./hooks"
import { useLanguage } from "../../i18n"
import type { AdviceEntry } from "../../api/types"

export const AdvicePage = () => {
  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isNewChat, setIsNewChat] = useState(true)
  const { data: currentConversation, isLoading: messagesLoading } = useConversation(activeConversationId)
  
  const handleMutationSuccess = useCallback((data: AdviceEntry) => {
    setActiveConversationId(data.conversation_id)
    setIsNewChat(false)
  }, [])
  
  const askAdviceMutation = useAskAdvice(handleMutationSuccess)
  const deleteConversationMutation = useDeleteConversation()
  const clearHistoryMutation = useClearAdviceHistory()
  
  const [question, setQuestion] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { language, t } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation])

  const handleNewChat = () => {
    setActiveConversationId(null)
    setIsNewChat(true)
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
    setIsNewChat(false)
  }

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(t("confirmDelete"))) {
      deleteConversationMutation.mutate(conversationId)
      if (activeConversationId === conversationId) {
        handleNewChat()
      }
    }
  }

  const handleClearAll = () => {
    if (window.confirm(t("confirmClearHistory"))) {
      clearHistoryMutation.mutate()
      handleNewChat()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim()) return
    
    await askAdviceMutation.mutateAsync({ 
      question,
      conversation_id: isNewChat ? null : activeConversationId
    })
    setQuestion("")
  }

  const messages = currentConversation || []

  return (
    <section className="advice-page">
      {/* Sidebar */}
      <aside className={`advice-sidebar ${sidebarOpen ? "advice-sidebar--open" : ""}`}>
        <div className="advice-sidebar__header">
          <button className="advice-new-chat-btn" onClick={handleNewChat}>
            <Plus size={18} />
            {language === "mk" ? "Нов разговор" : "New Chat"}
          </button>
          <button 
            className="advice-sidebar__toggle" 
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="advice-sidebar__list">
          {conversationsLoading ? (
            <div className="advice-sidebar__loading">
              <div className="loader" />
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.conversation_id}
                className={`advice-sidebar__item ${activeConversationId === conv.conversation_id ? "advice-sidebar__item--active" : ""}`}
                onClick={() => handleSelectConversation(conv.conversation_id)}
              >
                <MessageSquare size={16} />
                <div className="advice-sidebar__item-content">
                  <span className="advice-sidebar__item-title">{conv.title}</span>
                  <span className="advice-sidebar__item-meta">
                    {conv.message_count} {language === "mk" ? "пораки" : "messages"}
                  </span>
                </div>
                <button
                  className="advice-sidebar__item-delete"
                  onClick={(e) => handleDeleteConversation(conv.conversation_id, e)}
                  title={t("delete")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="advice-sidebar__empty">
              {language === "mk" ? "Нема разговори" : "No conversations"}
            </p>
          )}
        </div>

        {conversations && conversations.length > 0 && (
          <div className="advice-sidebar__footer">
            <button
              className="advice-clear-all-btn"
              onClick={handleClearAll}
              disabled={clearHistoryMutation.isPending}
            >
              <Trash2 size={16} />
              {clearHistoryMutation.isPending ? t("deleting") : t("clearAllHistory")}
            </button>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="advice-main">
        {/* Header */}
        <div className="advice-header">
          {!sidebarOpen && (
            <button 
              className="advice-sidebar__open-btn" 
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              <MessageSquare size={20} />
            </button>
          )}
          <div className="advice-header__left">
            <div className="advice-header__icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="advice-header__title">
                {isNewChat 
                  ? (language === "mk" ? "Нов разговор" : "New Chat")
                  : t("aiAdvisor")
                }
              </h1>
              <p className="advice-header__subtitle">{t("aiPersonalizedActions")}</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="advice-chat-container">
          {/* Messages Area */}
          <div className="advice-messages">
            {messagesLoading ? (
              <div className="advice-loading">
                <div className="loader" />
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((entry) => (
                  <div key={entry.id} className="advice-conversation">
                    {/* User Message */}
                    <div className="advice-message advice-message--user">
                      <div className="advice-message__avatar advice-message__avatar--user">
                        <MessageCircle size={16} />
                      </div>
                      <div className="advice-message__content">
                        <p className="advice-message__text">{entry.prompt}</p>
                        <span className="advice-message__time">
                          {new Date(entry.created_at).toLocaleString(language === "mk" ? "mk-MK" : "en-US")}
                        </span>
                      </div>
                    </div>
                    {/* AI Response */}
                    <div className="advice-message advice-message--ai">
                      <div className="advice-message__avatar advice-message__avatar--ai">
                        <Bot size={16} />
                      </div>
                      <div className="advice-message__content advice-message__content--ai">
                        <p className="advice-message__text">{entry.response}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="advice-empty">
                <div className="advice-empty__icon">
                  <Sparkles size={40} />
                </div>
                <h3>{t("aiAdvisor")}</h3>
                <p>{t("noConversations")}</p>
                <div className="advice-suggestions">
                  <button onClick={() => setQuestion(language === "mk" ? "Како можам да заштедам повеќе?" : "How can I save more money?")}>
                    {language === "mk" ? "💰 Како да заштедам?" : "💰 How to save?"}
                  </button>
                  <button onClick={() => setQuestion(language === "mk" ? "Анализирај ги моите трошоци" : "Analyze my spending")}>
                    {language === "mk" ? "📊 Анализа на трошоци" : "📊 Spending analysis"}
                  </button>
                  <button onClick={() => setQuestion(language === "mk" ? "Дај ми совет за буџетирање" : "Give me budgeting advice")}>
                    {language === "mk" ? "📝 Совети за буџет" : "📝 Budget tips"}
                  </button>
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {askAdviceMutation.isPending && (
              <div className="advice-message advice-message--ai">
                <div className="advice-message__avatar advice-message__avatar--ai">
                  <Bot size={16} />
                </div>
                <div className="advice-message__content advice-message__content--ai advice-thinking">
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                  <span className="thinking-dot"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <form className="advice-input-form" onSubmit={handleSubmit}>
            <div className="advice-input-wrapper">
              <textarea
                className="advice-input"
                rows={1}
                placeholder={t("questionPlaceholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (question.trim()) {
                      handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                    }
                  }
                }}
              />
              <button 
                type="submit" 
                className="advice-send-button" 
                disabled={askAdviceMutation.isPending || !question.trim()}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="advice-input-hint">
              {language === "mk" ? "Притисни Enter за испраќање" : "Press Enter to send"}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
