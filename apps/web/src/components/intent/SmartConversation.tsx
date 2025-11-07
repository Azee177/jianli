'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  suggestions?: string[];
  timestamp?: string;
}

interface SmartConversationProps {
  sessionId?: string;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<void>;
  onSelectSuggestion?: (suggestion: string) => Promise<void>;
  isLoading?: boolean;
}

export function SmartConversation({
  sessionId,
  initialMessages = [],
  onSendMessage,
  onSelectSuggestion,
  isLoading = false
}: SmartConversationProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (onSendMessage) {
        await onSendMessage(inputValue);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // 选择建议选项
  const handleSelectSuggestion = async (suggestion: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: suggestion,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      if (onSelectSuggestion) {
        await onSelectSuggestion(suggestion);
      }
    } catch (error) {
      console.error('Failed to select suggestion:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // 按Enter发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="smart-conversation">
      <div className="conversation-header">
        <div className="header-icon">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="header-content">
          <h3 className="header-title">智能岗位推荐</h3>
          <p className="header-subtitle">我会帮您找到最适合的目标岗位</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            {message.role === 'assistant' && (
              <div className="message-avatar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}

            <div className="message-content">
              <div className="message-text">{message.content}</div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="suggestions-container">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="suggestion-chip"
                      disabled={isLoading || isTyping}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="message-avatar message-avatar-user">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="message message-assistant">
            <div className="message-avatar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的回答..."
          className="message-input"
          disabled={isLoading || isTyping}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading || isTyping}
          className="send-button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .smart-conversation {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 700px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .conversation-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .header-icon {
          flex-shrink: 0;
        }

        .header-content {
          flex: 1;
        }

        .header-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .header-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f9fafb;
        }

        .message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .message-user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .message-avatar-user {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .message-content {
          flex: 1;
          max-width: 70%;
        }

        .message-text {
          padding: 12px 16px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          line-height: 1.5;
        }

        .message-user .message-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .suggestions-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .suggestion-chip {
          padding: 8px 16px;
          border-radius: 20px;
          background: white;
          border: 1.5px solid #667eea;
          color: #667eea;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .suggestion-chip:hover:not(:disabled) {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
        }

        .suggestion-chip:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .input-container {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: #667eea;
        }

        .message-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 自定义滚动条 */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

