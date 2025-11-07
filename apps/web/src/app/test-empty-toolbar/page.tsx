'use client';

import { useState } from 'react';

import { ResumeEditor } from '@/components/layout/ResumeEditor';

const TEST_CONTENT = `
<h2 style="margin-bottom:24px;">空白行工具栏测试</h2>
<p>将鼠标移动到下面的空白段落即可看到高亮与 “+” 工具栏。</p>
<p></p>
<p></p>
<p>你可以继续在这里输入任意内容。</p>
<p></p>
<p>再次找到空白行，尝试插入分隔线或图片。</p>
`;

export default function EmptyLineToolbarTestPage() {
  const [content, setContent] = useState(TEST_CONTENT);

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
        <header className="rounded-2xl bg-white/90 p-6 shadow">
          <p className="text-xs uppercase tracking-widest text-sky-500">Playground</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">空白行工具栏测试页</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            这是一个独立的测试页面，可快速验证鼠标悬停在空段落时出现的 “+” 工具栏，以及分隔线、图片插入等交互。
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>将鼠标移动到空白段落，查看高亮效果与浮动的 “+” 按钮。</li>
            <li>点击 “+” 展开菜单，尝试插入自定义颜色的分隔线或图片（支持本地/网络）。</li>
            <li>这一页面不会触发上层 SelectionToolbar，可以专注验证空白行体验。</li>
          </ul>
        </header>

        <div className="rounded-3xl border border-white/60 bg-white/90 shadow-xl">
          <ResumeEditor content={content} onChange={setContent} readOnly={false} />
        </div>
      </div>
    </div>
  );
}

