const mockDiff = [
  {
    title: "项目经历 · 数据看板升级",
    summary:
      "强化与 JD 共性的量化指标，突出跨部门协作和 ToB 实施经验。",
    suggestions: [
      "补充使用的技术栈：React、AntV、NestJS、ClickHouse。",
      "明确 KPI：上线后 6 周将关键指标延迟率从 42% 降至 15%。",
      "添加公司定制化提示：结合目标公司的增长模型描述 \"增长飞轮\"。",
    ],
  },
  {
    title: "公司定制区（保留 1/4 篇幅）",
    summary:
      "准备聚焦目标公司价值观、首要业务场景以及 30 / 60 / 90 天行动计划。",
    suggestions: [
      "引用目标公司的公开演讲摘要，强调以用户价值为中心。",
      "结合 JD KPI，输出对 DAU、留存、收入的预期贡献。",
      "列出潜在风险与应对策略，体现边界意识。",
    ],
  },
];

export function ResumeEditor() {
  return (
    <section className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">简历编辑器</h2>
          <p className="text-sm text-slate-400">
            Monaco diff 编辑器占位：突出 AI 建议与用户手动编辑的融合。
          </p>
        </div>
        <button className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-100">
          查看历史版本
        </button>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-md border border-slate-800 bg-slate-950/60 p-4">
        <div className="h-40 rounded border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-400">
          {/* Placeholder for diff viewer */}
          <p className="font-mono text-xs uppercase text-slate-500">
            DIFF VIEW · 待接入 Monaco 编辑器
          </p>
          <p className="mt-2">
            在这里展示原文与 AI 改写的对比，支持选区触发 LLM 再加工。
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mockDiff.map((item) => (
            <article
              key={item.title}
              className="rounded-md border border-slate-800 bg-slate-900/80 p-3"
            >
              <h3 className="text-sm font-semibold text-slate-200">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{item.summary}</p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-400">
                {item.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

