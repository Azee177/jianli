const prepItems = [
  {
    title: "学习计划",
    items: [
      "B 站课程：《ToB 数据产品指标体系搭建实战》",
      "阅读材料：目标公司财报与核心业务介绍",
      "LLM 生成的专题总结：用户增长指标体系",
    ],
  },
  {
    title: "面试问答模拟",
    items: [
      "抽问：如何定位 DAU 降低的根因？",
      "追问：复盘上线失败的项目并给出改进策略。",
      "深挖：补充边界场景，说明风控策略。",
    ],
  },
  {
    title: "投递看板",
    items: [
      "目标公司官网投递链接",
      "最近一次更新简历时间：待同步",
      "提醒：每 7 天触发跟进提醒",
    ],
  },
];

export function CompanyInsights() {
  return (
    <section className="flex h-full flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-100">公司定制区</h2>
        <p className="text-sm text-slate-400">
          聚焦目标公司的文化调性、业务场景与准备资料。
        </p>
      </header>
      <div className="flex flex-col gap-3">
        {prepItems.map((section) => (
          <article
            key={section.title}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-3"
          >
            <h3 className="text-sm font-semibold text-slate-200">
              {section.title}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-400">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

