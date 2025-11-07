'use client'

import { useState } from 'react'
import { SimpleEditorDemo } from '@/components/demo/SimpleEditorDemo'
import { EditorDebugPanel } from '@/components/debug/EditorDebugPanel'

export default function TestEditorPage() {
  const [activeTab, setActiveTab] = useState<'demo' | 'debug'>('demo')

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            TipTap 编辑器测试页面
          </h1>
          
          {/* 标签页切换 */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'demo'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              功能演示
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'debug'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              调试面板
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        {activeTab === 'demo' && <SimpleEditorDemo />}
        {activeTab === 'debug' && <EditorDebugPanel />}
      </div>
    </div>
  )
}