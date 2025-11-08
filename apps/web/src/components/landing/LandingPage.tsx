'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, FileText, Target, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Logo } from '@/components/common/Logo';

export function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">Resume Copilot</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                功能
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                如何使用
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                价格
              </a>
              <Link
                href="/editor"
                className="px-4 py-2 bg-gradient-to-r from-[#3330E4] to-[#6B5CE8] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200"
              >
                立即开始
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-100 via-indigo-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(51,48,228,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(107,92,232,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8 backdrop-blur-sm animate-on-scroll">
            <Sparkles className="w-4 h-4" />
            AI驱动的智能简历优化
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-on-scroll">
            让每份简历都能
            <br />
            <span className="bg-gradient-to-r from-[#3330E4] via-[#6B5CE8] to-[#3330E4] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              精准命中目标岗位
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-on-scroll">
            基于OCR、JD分析与AI协同的智能简历优化平台。深度研究目标岗位，让你的简历脱颖而出。
          </p>
          <div className="flex items-center justify-center gap-4 animate-on-scroll">
            <Link
              href="/editor"
              className="px-8 py-4 bg-gradient-to-r from-[#3330E4] to-[#6B5CE8] text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 text-lg"
            >
              免费开始使用
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-700 transition-all duration-200 text-lg"
            >
              了解更多
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">强大的功能，简单的操作</h2>
            <p className="text-lg text-gray-600">一站式简历优化解决方案</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll scroll-reveal-delay-1">
              <FeatureCard
                icon={<FileText className="w-8 h-8" />}
                title="智能OCR识别"
                description="上传PDF简历，自动提取内容结构，支持多种格式，识别准确率高达99%。"
              />
            </div>
            <div className="animate-on-scroll scroll-reveal-delay-2">
              <FeatureCard
                icon={<Target className="w-8 h-8" />}
                title="岗位深度分析"
                description="聚合多个招聘平台JD，提炼共性需求，精准把握目标岗位核心要求。"
              />
            </div>
            <div className="animate-on-scroll scroll-reveal-delay-3">
              <FeatureCard
                icon={<Zap className="w-8 h-8" />}
                title="AI智能优化"
                description="基于LLM协同优化，针对性调整简历内容，提升匹配度和通过率。"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-blue-50 to-indigo-100/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">简化你的工作流程</h2>
            <p className="text-lg text-gray-600">三步完成简历优化</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll scroll-reveal-delay-1">
              <StepCard
                number="01"
                title="上传简历"
                description="上传你的PDF简历，系统自动识别并提取内容结构。"
              />
            </div>
            <div className="animate-on-scroll scroll-reveal-delay-2">
              <StepCard
                number="02"
                title="分析岗位"
                description="输入目标岗位，AI聚合分析多个平台的JD信息。"
              />
            </div>
            <div className="animate-on-scroll scroll-reveal-delay-3">
              <StepCard
                number="03"
                title="智能优化"
                description="根据岗位要求，AI协同优化简历内容，提升匹配度。"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-100/50 via-blue-50/40 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">灵活的定价方案</h2>
            <p className="text-lg text-gray-600">选择适合你的计划</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="animate-on-scroll scroll-reveal-delay-1">
              <PricingCard
              name="免费版"
              price="¥0"
              period="/月"
              features={[
                '1个活跃项目',
                '基础OCR识别',
                '简单JD分析',
                '社区支持',
              ]}
              cta="开始使用"
              href="/editor"
              />
            </div>
            <div className="animate-on-scroll scroll-reveal-delay-2">
              <PricingCard
              name="专业版"
              price="¥99"
              period="/月"
              features={[
                '无限项目',
                '高级OCR识别',
                '深度JD分析',
                '多维度匹配',
                'AI智能优化',
                '邮件支持',
              ]}
              cta="开始使用"
              href="/editor"
              highlighted
              />
            </div>
            <div className="animate-on-scroll scroll-reveal-delay-3">
              <PricingCard
              name="企业版"
              price="¥299"
              period="/月"
              features={[
                '专业版全部功能',
                '团队协作',
                '优先支持',
                '定制化服务',
                'API访问',
              ]}
              cta="联系我们"
              href="/editor"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3330E4] via-[#6B5CE8] to-[#3330E4] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-on-scroll">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            准备好提升你的简历了吗？
          </h2>
          <p className="text-xl text-white/90 mb-8">
            加入数千位求职者，让AI帮你打造完美简历
          </p>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
          >
            免费开始使用
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo className="w-8 h-8" />
                <span className="text-lg font-bold">Resume Copilot</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI驱动的智能简历优化平台
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">功能</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">价格</a></li>
                <li><a href="#" className="hover:text-white transition-colors">更新日志</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">文档</a></li>
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">法律</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 Resume Copilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-300 group">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform duration-300 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="p-8 bg-white border border-gray-200 rounded-2xl">
        <div className="text-5xl font-bold text-primary/20 mb-4">{number}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  href,
  highlighted = false,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-br from-[#3330E4] to-[#6B5CE8] text-white border-transparent shadow-2xl shadow-blue-500/50 scale-105 relative'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
          最受欢迎
        </div>
      )}
      <h3 className={`text-lg font-semibold mb-2 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {name}
      </h3>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
          {price}
        </span>
        <span className={`${highlighted ? 'text-white/80' : 'text-gray-600'}`}>{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlighted ? 'text-white' : 'text-blue-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-sm ${highlighted ? 'text-white/90' : 'text-gray-600'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block w-full py-3 rounded-xl font-semibold text-center transition-all duration-200 ${
          highlighted
            ? 'bg-white text-blue-700 hover:shadow-xl hover:scale-105'
            : 'bg-gradient-to-r from-[#3330E4] to-[#6B5CE8] text-white hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

