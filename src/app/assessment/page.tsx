"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { saveAssessment, getLatestGoal } from "@/lib/supabase/service";
import { getUserId } from "@/lib/user";

// ---- 通用问题 ----
const baseQuestions = [
  { key: "stage", label: "当前阶段", options: ["大一", "大二", "大三", "大四", "工作"] },
  { key: "project_experience", label: "项目经验", options: ["无经验", "课程项目", "个人项目", "实习经验"] },
  { key: "daily_time", label: "每天可投入学习时间", options: ["30分钟", "1小时", "2小时以上"] },
];

const strengthsOptions = ["学习能力", "执行力", "技术基础", "沟通能力"];

// ---- 根据岗位关键词匹配技能问题 ----
// 每个维度均基于真实市场 JD（BOSS直聘/拉勾）的核心要求提炼
function getSkillQuestions(role: string): { key: string; label: string; options: string[] }[] {
  const r = role.toLowerCase();

  // === AI 产品经理（优先于算法，避免"AI"关键词误匹配） ===
  if (r.includes("ai 产品") || r.includes("ai产品") || (r.includes("产品") && r.includes("ai"))) {
    return [
      { key: "PRD", label: "PRD 撰写经验", options: ["无经验", "了解", "写过"] },
      { key: "AI技术认知", label: "AI 技术边界认知（能判断什么能做、什么做不了）", options: ["不了解", "了解概念", "能判断可行性"] },
      { key: "模型选型", label: "模型选型与方案设计（知道什么场景用什么模型）", options: ["无经验", "了解", "能独立选型"] },
      { key: "商业化思维", label: "AI 产品商业化与 ROI 思维", options: ["无经验", "了解", "有实践经验"] },
      { key: "产品落地", label: "AI 产品落地经验（从概念到上线全流程）", options: ["无经验", "了解流程", "完整跟过上线"] },
    ];
  }
  // === 产品经理 ===
  if (r.includes("产品经理") || r.includes("产品总监")) {
    return [
      { key: "PRD", label: "PRD 撰写经验", options: ["无经验", "了解", "写过"] },
      { key: "用户研究", label: "用户研究方法（访谈/问卷/可用性测试）", options: ["无经验", "了解方法", "做过调研"] },
      { key: "产品项目", label: "产品项目经验", options: ["无经验", "课程项目", "真实项目"] },
      { key: "数据分析", label: "数据驱动决策能力（AB测试/用户行为分析）", options: ["无经验", "基础", "熟练"] },
      { key: "竞品分析", label: "竞品分析与市场调研能力", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === 前端 ===
  if (r.includes("前端") || r.includes("web") || r.includes("js") || r.includes("javascript") || r.includes("小程序") || r.includes("h5") || r.includes("react") || r.includes("vue")) {
    return [
      { key: "三件套", label: "HTML5 / CSS3 / JavaScript（ES6+）", options: ["无经验", "基础", "熟练"] },
      { key: "框架", label: "Vue 或 React 框架经验", options: ["无经验", "学习中", "有项目经验"] },
      { key: "工程化", label: "工程化能力（Webpack/Vite/模块化/Git）", options: ["无经验", "了解", "实践过"] },
      { key: "性能优化", label: "性能优化经验（首屏加载/内存管理/CDN）", options: ["无经验", "了解", "实践过"] },
      { key: "全栈扩展", label: "Node.js / 服务端基础 / 跨端能力", options: ["无经验", "了解", "有项目经验"] },
    ];
  }
  // === 移动端 ===
  if (r.includes("android") || r.includes("ios") || r.includes("移动端") || r.includes("flutter") || r.includes("鸿蒙") || r.includes("rn ") || r.includes("u3d") || r.includes("ue4") || r.includes("ue5")) {
    return [
      { key: "编程基础", label: "编程基础（Java/Kotlin/Swift/Object-C）", options: ["无经验", "基础", "熟练"] },
      { key: "平台开发", label: "平台开发经验", options: ["无经验", "基础", "有项目经验"] },
      { key: "性能适配", label: "屏幕适配与性能优化", options: ["无经验", "了解", "实践过"] },
      { key: "发布流程", label: "应用商店发布与审核经验", options: ["无经验", "了解", "发布过"] },
      { key: "跨平台", label: "跨平台开发能力（Flutter/RN/鸿蒙）", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === 后端 ===
  if (r.includes("后端") || r.includes("java") || r.includes("python") || r.includes("go") || r.includes("node") || r.includes("php") || r.includes(".net") || r.includes("c#") || r.includes("c++") || r.includes("全栈")) {
    return [
      { key: "编程语言", label: "主力编程语言掌握程度", options: ["入门", "能写业务", "精通+源码级别"] },
      { key: "数据库缓存", label: "数据库（MySQL/PostgreSQL）+ 缓存（Redis）", options: ["无经验", "基础操作", "熟练调优"] },
      { key: "分布式", label: "分布式/微服务经验（Spring Cloud/Dubbo）", options: ["无经验", "了解", "实践过"] },
      { key: "高并发", label: "高并发/高可用系统设计经验", options: ["无经验", "了解", "实践过"] },
      { key: "容器化", label: "Docker/K8s 容器化与 CI/CD", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === AI / 算法（纯技术岗） ===
  if (r.includes("算法") || r.includes("机器学习") || r.includes("深度学习") || r.includes("nlp") || r.includes("cv") || r.includes("大模型") || r.includes("ai 训练") || r.includes("数据挖掘")) {
    return [
      { key: "数学基础", label: "数学基础（概率/统计/线性代数/最优化）", options: ["薄弱", "基础", "扎实"] },
      { key: "编程能力", label: "Python / C++ 编程能力", options: ["无经验", "基础", "熟练"] },
      { key: "框架", label: "PyTorch / TensorFlow 框架经验", options: ["无经验", "了解", "熟练"] },
      { key: "模型调优", label: "模型训练、调优与部署经验", options: ["无经验", "了解", "实践过"] },
      { key: "算法项目", label: "算法项目/竞赛/论文经验", options: ["无经验", "课程项目", "竞赛获奖/顶会论文"] },
    ];
  }
  // === 数据 ===
  if (r.includes("数据") || r.includes("bi") || r.includes("etl") || r.includes("爬虫") || r.includes("仓库") || r.includes("治理")) {
    return [
      { key: "SQL", label: "SQL 能力（多表查询/窗口函数/性能调优）", options: ["无经验", "基础查询", "熟练+调优"] },
      { key: "编程", label: "Python（Pandas/NumPy）或 R 数据分析能力", options: ["无经验", "基础", "熟练"] },
      { key: "BI工具", label: "BI 可视化工具（Tableau/FineBI/Power BI）", options: ["不熟悉", "基础使用", "熟练搭建看板"] },
      { key: "数据建模", label: "数据建模与指标体系搭建能力", options: ["无经验", "了解", "实践过"] },
      { key: "业务理解", label: "业务理解与数据驱动决策能力", options: ["无经验", "了解", "能在业务中落地"] },
    ];
  }
  // === 测试 ===
  if (r.includes("测试") || r.includes("qa")) {
    return [
      { key: "测试理论", label: "测试理论与方法（黑盒/白盒/灰盒）", options: ["无经验", "了解", "熟练"] },
      { key: "自动化", label: "自动化测试能力（Selenium/JUnit/Postman）", options: ["无经验", "了解", "实践过"] },
      { key: "编程脚本", label: "测试脚本编写能力（Python/Shell）", options: ["无经验", "基础", "熟练"] },
      { key: "性能测试", label: "性能/压力测试经验", options: ["无经验", "了解", "实践过"] },
      { key: "CI/CD", label: "CI/CD 流程与测试工具链经验", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === 运维 / DevOps ===
  if (r.includes("运维") || r.includes("devops") || r.includes("sre") || r.includes("dba") || r.includes("网络工程师") || r.includes("系统管理") || r.includes("系统工程师")) {
    return [
      { key: "Linux", label: "Linux 系统管理与网络知识", options: ["无经验", "基础", "熟练"] },
      { key: "脚本", label: "自动化脚本能力（Shell/Python）", options: ["无经验", "基础", "熟练"] },
      { key: "容器云", label: "Docker/K8s/云平台经验", options: ["无经验", "了解", "实践过"] },
      { key: "监控", label: "监控告警体系（Prometheus/Grafana/ELK）", options: ["无经验", "了解", "搭建过"] },
      { key: "故障排查", label: "故障排查与应急响应能力", options: ["无经验", "跟过流程", "独立负责过"] },
    ];
  }
  // === 安全 ===
  if (r.includes("安全") || r.includes("渗透")) {
    return [
      { key: "网络攻防", label: "网络攻防与安全体系知识", options: ["无经验", "了解", "熟练"] },
      { key: "渗透测试", label: "渗透测试与漏洞挖掘能力", options: ["无经验", "了解", "实践过"] },
      { key: "安全工具", label: "安全工具使用（Burp/Nmap/Wireshark等）", options: ["不熟悉", "了解", "熟练"] },
      { key: "安全审计", label: "安全审计与代码审计经验", options: ["无经验", "了解", "实践过"] },
      { key: "密码学", label: "密码学与数据安全基础", options: ["无经验", "了解", "深入"] },
    ];
  }
  // === 设计 ===
  if (r.includes("设计") || r.includes("ui") || r.includes("ux") || r.includes("视觉") || r.includes("原画") || r.includes("建模") || r.includes("美术") || r.includes("动效")) {
    return [
      { key: "设计工具", label: "设计工具（Figma/Sketch/PS/AI）", options: ["无经验", "基础", "熟练"] },
      { key: "设计项目", label: "设计项目经验", options: ["无经验", "课程项目", "实习/商业项目"] },
      { key: "作品集", label: "作品集情况", options: ["无", "有少量作品", "有完整作品集"] },
      { key: "UX能力", label: "UX 交互设计与用户研究能力", options: ["无经验", "了解原则", "实践过"] },
      { key: "AIGC工具", label: "AIGC 设计工具使用（Midjourney/SD等）", options: ["不熟悉", "了解", "日常使用"] },
    ];
  }
  // === 运营 ===
  if (r.includes("运营")) {
    return [
      { key: "内容策划", label: "内容策划与创作能力", options: ["无经验", "基础", "熟练"] },
      { key: "数据分析", label: "数据驱动运营能力（转化率/留存/ROI）", options: ["无经验", "基础", "熟练"] },
      { key: "用户运营", label: "用户分层与精细化运营经验", options: ["无经验", "了解", "实践过"] },
      { key: "活动策划", label: "活动策划与执行能力", options: ["无经验", "了解", "实践过"] },
      { key: "渠道推广", label: "渠道推广与获客经验", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === 市场 ===
  if (r.includes("市场") || r.includes("品牌") || r.includes("广告") || r.includes("seo") || r.includes("sem") || r.includes("投放") || r.includes("公关") || r.includes("增长") || r.includes("aso")) {
    return [
      { key: "营销策划", label: "营销策划与创意能力", options: ["无经验", "基础", "熟练"] },
      { key: "数据分析", label: "数据驱动 ROI 优化能力", options: ["无经验", "基础", "熟练"] },
      { key: "投放经验", label: "广告投放经验（信息流/搜索）", options: ["无经验", "了解", "独立操盘"] },
      { key: "品牌传播", label: "品牌建设与公关传播能力", options: ["无经验", "了解", "实践过"] },
      { key: "渠道管理", label: "多渠道推广与预算管理", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === 游戏 ===
  if (r.includes("游戏")) {
    return [
      { key: "游戏理解", label: "游戏品类理解与玩家洞察", options: ["不熟悉", "了解", "深度玩家/从业者"] },
      { key: "设计开发", label: "游戏设计或开发经验", options: ["无经验", "了解", "实践过"] },
      { key: "引擎", label: "游戏引擎经验（Unity/Unreal/Cocos）", options: ["无经验", "了解", "实践过"] },
      { key: "数值分析", label: "游戏数值与数据分析能力", options: ["无经验", "基础", "熟练"] },
      { key: "项目经验", label: "游戏项目经验", options: ["无经验", "个人作品", "商业项目"] },
    ];
  }
  // === 技术管理 ===
  if (r.includes("架构") || r.includes("总监") || r.includes("cto") || r.includes("负责人") || r.includes("技术经理")) {
    return [
      { key: "技术深度", label: "核心技术栈深度", options: ["入门", "熟练", "专家级"] },
      { key: "架构能力", label: "系统架构设计与技术选型能力", options: ["无经验", "了解", "主导过"] },
      { key: "团队管理", label: "团队管理与人才培养经验", options: ["无经验", "带过小组", "管理过部门"] },
      { key: "项目管理", label: "项目管理与跨部门协调能力", options: ["无经验", "了解", "熟练"] },
      { key: "技术规划", label: "技术战略规划与决策能力", options: ["无经验", "了解", "实践过"] },
    ];
  }
  // === 区块链 ===
  if (r.includes("区块链") || r.includes("web3")) {
    return [
      { key: "智能合约", label: "智能合约开发（Solidity/Rust）", options: ["无经验", "基础", "熟练"] },
      { key: "协议", label: "区块链协议与共识机制理解", options: ["不熟悉", "了解", "深入"] },
      { key: "DApp", label: "DApp 开发经验", options: ["无经验", "了解", "开发过"] },
      { key: "安全审计", label: "区块链安全与审计", options: ["无经验", "了解", "实践过"] },
      { key: "密码学", label: "密码学基础", options: ["无经验", "了解", "扎实"] },
    ];
  }
  // === 职能/通用 ===
  return [
    { key: "专业能力", label: "岗位核心专业能力", options: ["入门", "能独立工作", "熟练"] },
    { key: "项目经验", label: "相关项目经验", options: ["无经验", "有参与", "独立负责"] },
    { key: "工具使用", label: "常用工具/软件掌握程度", options: ["不熟悉", "基础使用", "熟练"] },
    { key: "行业认知", label: "行业认知与理解", options: ["不熟悉", "了解", "熟悉"] },
    { key: "学习意愿", label: "主动学习意愿", options: ["愿意学习", "正在自学", "有系统计划"] },
  ];
}

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skillAnswers, setSkillAnswers] = useState<Record<string, string>>({});
  const [strengths, setStrengths] = useState<string[]>([]);
  const [motivation, setMotivation] = useState("");
  const [saving, setSaving] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    getLatestGoal().then((g) => {
      if (g) setTargetRole(g.target_role);
    });
  }, []);

  const skillQuestions = getSkillQuestions(targetRole);

  const toggleStrength = (s: string) => {
    setStrengths((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await saveAssessment({
        user_id: getUserId(),
        stage: answers.stage || "",
        project_experience: answers.project_experience || "",
        daily_time: answers.daily_time || "",
        skill_answers: skillAnswers,
        strengths,
        motivation,
      });
      // 分析延迟到 Analysis 页面执行
      router.push("/analysis");
    } catch (err: any) {
      console.error("保存评估失败:", err?.message || err);
      router.push("/analysis");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col px-6 py-6"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}
    >
      <div className="flex items-center mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
      </div>

      <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">能力自评</h1>
        <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
          {targetRole ? `目标：${targetRole}` : "让 AI 更了解你，给你精准的分析"}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-auto pb-24">
        {baseQuestions.map((q) => (
          <div key={q.key} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{q.label}</h3>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const s = answers[q.key] === opt;
                return (
                  <button key={opt} onClick={() => setAnswers({ ...answers, [q.key]: opt })}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${s ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"}`}>{opt}</button>
                );
              })}
            </div>
          </div>
        ))}

        {skillQuestions.map((q) => (
          <div key={q.key} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{q.label}</h3>
            <p className="text-xs text-gray-400 mb-3">基于真实 JD 需求 · {targetRole || "..."}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const s = skillAnswers[q.key] === opt;
                return (
                  <button key={opt} onClick={() => setSkillAnswers({ ...skillAnswers, [q.key]: opt })}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${s ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"}`}>{opt}</button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">自我优势</h3>
          <p className="text-xs text-gray-400 mb-3">可多选</p>
          <div className="flex flex-wrap gap-2">
            {strengthsOptions.map((s) => {
              const sel = strengths.includes(s);
              return (
                <button key={s} onClick={() => toggleStrength(s)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${sel ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"}`}>
                  {sel && <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="inline mr-1"><path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}{s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">职业目标动机</h3>
          <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)}
            placeholder="例如：为什么你想做这个岗位？你希望未来能做什么？" rows={3}
            className="w-full text-sm text-gray-900 placeholder:text-gray-300 bg-transparent resize-none focus:outline-none leading-relaxed" />
          <div className="text-right text-xs text-gray-300 mt-1">{motivation.length}/500</div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pt-3 pb-8 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-lg mx-auto">
          <button onClick={handleSubmit}
            disabled={saving || !answers.stage || !answers.project_experience || !answers.daily_time || skillQuestions.some((q) => !skillAnswers[q.key]) || strengths.length === 0}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? "AI 分析中..." : !answers.stage || !answers.project_experience || !answers.daily_time || skillQuestions.some((q) => !skillAnswers[q.key]) || strengths.length === 0 ? "请完成所有选项" : "开始 AI 分析"}
          </button>
        </div>
      </div>
    </main>
  );
}
