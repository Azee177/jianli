'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Plus, Paperclip } from 'lucide-react';
import { sendChatMessage } from '@/lib/fastapi-hooks';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SmartChatInterfaceProps {
  selectedText?: string | null;
  onOptimize?: (text: string) => void;
  onFileUpload?: (file: File) => void;
}

export function SmartChatInterface({ selectedText, onOptimize, onFileUpload }: SmartChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // 调用真实的LLM API
      const response = await sendChatMessage({
        message: currentInput,
        session_id: sessionId || undefined,
        system_message: !sessionId ? "你是一个专业的简历优化助手。你善于帮助用户优化简历内容，提供针对性的建议，并用清晰、友好的语言与用户交流。" : undefined,
        temperature: 0.7,
        provider: 'qwen'  // 默认使用通义千问，可以改为 'deepseek' 或 'openai'
      });

      // 保存session ID
      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // 显示错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `抱歉，对话出现错误: ${error instanceof Error ? error.message : '未知错误'}。\n\n可能的原因:\n1. API key未配置或无效\n2. 网络连接问题\n3. 后端服务未启动\n\n请检查后端配置的 .env 文件中是否正确设置了 QWEN_API_KEY。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('仅支持 PDF 和 Word (.doc, .docx) 格式的文件');
      return;
    }

    // 检查文件大小（限制为 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB');
      return;
    }

    // 添加上传消息
    const uploadMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `📎 已上传文件: ${file.name}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, uploadMessage]);

    // 模拟文件处理
    setIsLoading(true);
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `我已经收到您的简历文件《${file.name}》。正在分析中...

我会从以下几个方面对您的简历进行优化：
• 格式规范性检查
• 内容结构优化
• 关键词匹配度分析
• 量化成果建议

稍后会为您生成详细的优化建议报告。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
      setIsLoading(false);
      
      // 调用回调
      if (onFileUpload) {
        onFileUpload(file);
      }
    }, 1500);

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      <div className="p-4 border-t border-blue-100 bg-white/95 backdrop-blur-sm">
        <div className="flex gap-2 items-center">
          {/* 文件上传按钮 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="上传简历文件 (PDF, Word)"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            disabled={isLoading}
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="发送消息"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* 文件格式提示 */}
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Paperclip className="w-3 h-3" />
          支持上传 PDF、Word 格式的简历文件（最大 10MB）
        </p>
      </div>
    </div>
  );
}