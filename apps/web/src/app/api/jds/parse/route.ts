import { NextRequest, NextResponse } from "next/server";
import { saveJD } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, text } = body || {};
    
    let jdText = text;
    let company = "Unknown Company";
    let title = "Unknown Position";
    
    if (url && !text) {
      // 模拟从URL抓取JD内容
      if (url.includes('tencent') || url.includes('腾讯')) {
        company = "腾讯科技";
        title = "高级产品经理";
        jdText = `岗位职责：
1. 负责政企数据产品的中长期规划，定义核心指标与体验目标
2. 与数据、研发、运营团队合作，构建面向 ToB 客户的增长解决方案
3. 推动跨团队项目落地，协调资源并跟进项目执行与复盘
4. 深入理解政企客户需求，设计符合行业特点的产品功能

任职要求：
1. 5年以上互联网产品经验，熟悉大数据或政企行业
2. 具备良好的量化分析能力，能独立构建业务指标体系
3. 擅长跨部门沟通与项目管理，推动复杂项目上线落地
4. 熟悉 ToB 产品设计，有政企客户服务经验优先
5. 具备数据驱动的产品思维，能够通过数据分析指导产品决策`;
      } else if (url.includes('bytedance') || url.includes('字节')) {
        company = "字节跳动";
        title = "后端开发工程师";
        jdText = `岗位职责：
1. 负责后端服务架构设计与开发，保证系统高可用性
2. 参与核心业务系统的技术选型和架构优化
3. 与前端、算法团队协作，完成产品功能开发
4. 负责系统性能优化，解决高并发场景下的技术问题

任职要求：
1. 3年以上后端开发经验，熟练掌握 Go/Java/Python 等语言
2. 熟悉 MySQL、Redis、MongoDB 等数据库技术
3. 有微服务架构经验，熟悉 Docker、Kubernetes
4. 了解分布式系统设计，有高并发系统开发经验
5. 有 AI/LLM 相关项目经验者优先`;
      } else {
        jdText = `JD from ${url}: 这是一个通用的职位描述，要求具备相关技术技能和工作经验。`;
      }
    } else if (!jdText) {
      jdText = "请提供职位描述内容或URL";
    }
    
    // 从文本中提取公司和职位信息
    if (jdText.includes('腾讯') && company === "Unknown Company") {
      company = "腾讯科技";
    }
    if (jdText.includes('字节') && company === "Unknown Company") {
      company = "字节跳动";
    }
    if (jdText.includes('产品经理') && title === "Unknown Position") {
      title = "产品经理";
    }
    if (jdText.includes('后端') && title === "Unknown Position") {
      title = "后端开发工程师";
    }
    
    const jd = saveJD({ 
      jd_text: jdText, 
      company, 
      title 
    });
    
    return NextResponse.json(jd);
  } catch (error) {
    console.error('JD parse error:', error);
    return NextResponse.json(
      { message: 'JD解析失败' },
      { status: 500 }
    );
  }
}