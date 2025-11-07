'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SmartChatInterfaceProps {
  selectedText?: string | null;
  onOptimize?: (text: string) => void;
}

export function SmartChatInterface({ selectedText, onOptimize }: SmartChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: '你好！我是你的专属简历优化助手。选择简历中的任意内容，我会为你提供针对性的优化建议。',
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedText) {
      setInputValue(`请帮我优化这段内容："${selectedText}"`);
      inputRef.current?.focus();
    }
  }, [selectedText]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateResponse(userMessage.content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateResponse = (userInput: string): string => {
    if (userInput.includes('优化') || userInput.includes('改进')) {
      return `我建议从以下几个方面优化这段内容：

1. **量化成果**：添加具体的数据和指标
2. **突出技能**：强调与目标岗位相关的技术栈
3. **STAR法则**：按照情境-任务-行动-结果的结构重组
4. **关键词匹配**：确保包含JD中的核心关键词

你希望我重点从哪个方面开始优化？`;
    }

    if (userInput.includes('字节') || userInput.includes('腾讯') || userInput.includes('阿里')) {
      return `针对大厂的简历，我建议：

• **技术深度**：突出核心技术能力和架构经验
• **业务理解**：体现对互联网业务的深度思考
• **团队协作**：展示跨部门合作和技术影响力
• **创新能力**：突出技术创新和问题解决能力

需要我帮你针对具体岗位进一步优化吗？`;
    }

    return `我理解你的需求。基于你的问题，我建议：

• 首先明确目标岗位的核心要求
• 然后针对性地调整简历内容
• 确保每个经历都能体现相关能力
• 用数据和结果说话

你可以选择简历中的具体内容，我会给出更详细的优化建议。`;
  };

  const quickActions = [
    { label: '优化工作经历', action: () => setInputValue('请帮我优化工作经历部分') },
    { label: '突出技术技能', action: () => setInputValue('如何更好地展示我的技术技能？') },
    { label: '量化项目成果', action: () => setInputValue('帮我为项目经历添加量化指标') },
    { label: '匹配JD要求', action: () => setInputValue('如何让简历更匹配目标岗位？') }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-sky-400" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-sky-500/20 border border-sky-500/30 text-sky-100'
                  : 'bg-white/5 border border-white/10 text-slate-200'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-slate-400 mb-3">快速开始：</p>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="text-left p-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题..."
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-sky-500/20 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
}