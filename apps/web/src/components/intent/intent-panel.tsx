const journeySteps = [
  { key: "UPLOAD", label: "上传简历", description: "解析 PDF 并生成结构化 AST" },
  { key: "TARGET_CONFIRMED", label: "确认目标岗位", description: "锁定唯一岗位并生成研究计划" },
  { key: "COMMON_DIMS_LOCKED", label: "锁定 JD 共性", description: "提炼 JD 能力要点，并供用户确认" },
  { key: "REWRITE_LOOP", label: "多轮改写", description: "围绕共性和公司调性进行简历润色" },
  { key: "EXPORTABLE", label: "导出与投递", description: "生成 PDF/DOCX 并同步投递看板" },
];

export function IntentPanel() {
  return (
    <section className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">意向 & JD 概览</h2>
        <p className="text-sm text-slate-400">
          全程锁定单一目标岗位，提供深度研究式的陪伴体验。
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {journeySteps.map((step) => (
          <div
            key={step.key}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-3"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
              <span>{step.label}</span>
              <code className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                {step.key}
              </code>
            </div>
            <p className="mt-1 text-xs text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

