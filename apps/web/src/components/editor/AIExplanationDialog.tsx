'use client';

import { X, ExternalLink, Play } from 'lucide-react';
import { useState } from 'react';

interface AIExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  explanation?: {
    concept: string;
    interviewQuestions: string[];
    learningResources: {
      title: string;
      url: string;
      platform: string;
    }[];
  };
}

export function AIExplanationDialog({
  isOpen,
  onClose,
  selectedText,
  explanation,
}: AIExplanationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Mock data for demonstration
  const mockExplanation = explanation || {
    concept: `"${selectedText}" 是指在项目管理和产品开发中，通过数据驱动的方法来衡量和优化业务指标的专业能力。这包括设定关键绩效指标(KPI)、建立数据收集机制、进行数据分析并基于分析结果制定改进策略。在简历中提及此类经验，展现了候选人具备量化思维和结果导向的工作方式。`,
    interviewQuestions: [
      "你是如何确定这些量化指标的？选择这些指标的依据是什么？",
      "在数据收集过程中遇到了哪些挑战？你是如何解决的？",
      "如果这个项目重新来做，你会在哪些方面进行改进？",
      "你如何确保数据的准确性和可靠性？",
      "这个项目的ROI是多少？你是如何计算的？"
    ],
    learningResources: [
      {
        title: "数据分析思维与方法论",
        url: "https://www.bilibili.com/video/BV1234567890",
        platform: "B站"
      },
      {
        title: "产品经理必备的数据分析技能",
        url: "https://www.bilibili.com/video/BV0987654321",
        platform: "B站"
      },
      {
        title: "如何建立有效的KPI体系",
        url: "https://www.bilibili.com/video/BV1122334455",
        platform: "B站"
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI 专业解释</h2>
            <p className="text-sm text-gray-500 mt-1">
              选中内容：<span className="font-medium">"{selectedText}"</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">AI 正在分析中...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 专业概念解释 */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  专业概念解释
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {mockExplanation.concept}
                  </p>
                </div>
              </div>

              {/* 面试官可能的刁钻问题 */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  面试官可能的刁钻问题
                </h3>
                <div className="space-y-3">
                  {mockExplanation.interviewQuestions.map((question, index) => (
                    <div key={index} className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* B站学习资源 */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  推荐学习资源
                </h3>
                <div className="space-y-3">
                  {mockExplanation.learningResources.map((resource, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{resource.title}</h4>
                            <p className="text-sm text-gray-500">{resource.platform}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(resource.url, '_blank')}
                          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          观看
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            关闭
          </button>
          <button
            onClick={() => {
              // TODO: 实现复制到对话区功能
              console.log('复制到对话区');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            复制到对话区
          </button>
        </div>
      </div>
    </div>
  );
}