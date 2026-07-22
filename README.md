# OfferPilot 🚀

**Goal-Oriented AI Career Growth Agent**

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-上线-green?logo=vercel)](https://offerpilot-kappa.vercel.app)

> 🔗 线上地址：**[offerpilot-kappa.vercel.app](https://offerpilot-kappa.vercel.app)**

不是学习计划生成器，不是刷题平台。OfferPilot 是一个 AI 职业成长陪伴 Agent——根据你的目标岗位，AI 分析你的能力差距，生成个性化成长路线，通过测验验证学习成果，让你的准备度逐步提升直到拿到 Offer。

---

## 🎯 产品定位

```
你告诉 AI：我想做前端工程师，目标上海，2027 春招
       ↓
AI 分析：你跟岗位的差距在哪里
       ↓
AI 路线：每个阶段该学什么
       ↓
每日测验：学完就测，答对就涨分
       ↓
准备度一点点涨，阶段自动推进
```

## ✨ 功能

- **150+ 岗位选择** — 对标 BOSS直聘真实分类，产品/前端/后端/数据/算法/设计/运营全覆盖
- **AI 能力分析** — DeepSeek 两阶段分析：先识别岗位类型，再评估能力差距
- **动态评估** — 根据岗位自动切换评估维度，共 17 组 JD 匹配规则
- **个性化成长路线** — AI 生成 4-5 个阶段，readiness 达标自动推进
- **每日测验** — 5 题（2 简 1 中 2 难），AI 出题判分，逐题反馈 + AI 分析错题
- **能力里程** — 5 级认证体系（🌱入门→🌿基础→🪴独立→🌳熟练→🏆精通）
- **每日反思** — 写学习总结，AI 给反馈
- **多岗位档案** — 同时维护多个求职方向，一键切换
- **手机优先** — 375px 适配，底部固定导航，iPhone 安全区

## 🛠 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | Supabase (PostgreSQL) |
| AI | DeepSeek API |
| 部署 | Vercel |

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx              # Splash 欢迎页
│   ├── login/                # 手机号登录
│   ├── welcome/              # 名字输入
│   ├── onboarding/           # 功能介绍
│   ├── goal/                 # 目标创建（150+ 岗位选择器）
│   ├── assessment/           # 能力自评（动态 JD 匹配）
│   ├── analysis/             # AI 分析报告
│   ├── dashboard/            # 首页（准备度、每日任务、打卡）
│   ├── roadmap/              # 成长路线（可自定义时间）
│   ├── learning/             # 学习中心（测验弹窗）
│   ├── reflection/           # 每日反思（AI 总结）
│   ├── growth/               # 成长记录（时间线 + 删除）
│   ├── profile/              # 个人档案（多岗位切换）
│   ├── test-done/            # 满分演示页
│   └── api/
│       ├── analyze/          # AI 分析接口
│       ├── quiz/             # 测验出题接口
│       └── summarize/        # AI 总结接口
├── lib/
│   ├── supabase/             # 数据库 client + service
│   ├── ai/deepseek.ts        # DeepSeek 调用封装
│   ├── user.ts               # 用户档案管理（localStorage）
│   └── milestone.ts          # 能力里程计算
└── supabase_schema.sql       # 数据库建表 SQL
```

## 🚀 本地运行

### 1. 克隆项目

```bash
git clone https://github.com/jz-226/offerpilot.git
cd offerpilot
npm install
```

### 2. 配置 Supabase

去 [supabase.com](https://supabase.com) 创建项目 → SQL Editor → 粘贴运行 `supabase_schema.sql`

### 3. 配置 DeepSeek

去 [platform.deepseek.com](https://platform.deepseek.com) 申请 API Key

### 4. 环境变量

创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
DEEPSEEK_API_KEY=sk-你的key
```

### 5. 启动

```bash
npm run dev
```

打开 http://localhost:3000

## 📱 手机端测试

```bash
npm run dev -- -H 0.0.0.0 -p 3000
```

手机连同一 WiFi，访问 `http://你的电脑IP:3000`

## 📊 数据库表

| 表 | 用途 |
|------|------|
| `user_goals` | 用户目标 |
| `user_assessment` | 能力自评 |
| `ai_analysis` | AI 分析结果 |
| `quiz_results` | 测验记录 |
| `reflections` | 每日反思 |
| `roadmap` | 成长路线 |
| `evidence` | 成长证据 |
| `learning_records` | 学习记录 |

## 📋 产品文档

完整 PRD 文档见 `docs/prd/` 目录，共 8 份：

| 文档 | 内容 |
|------|------|
| Product Overview | 产品背景、定位、愿景、目标用户、核心价值 |
| MVP PRD | 产品需求文档：4 个核心功能需求、MVP 范围 |
| MVP Prioritization | 优先级划分（P0/P1/P2）、核心闭环定义 |
| User Flow V1 | 用户流程图：从创建目标到成长反馈 |
| Information Architecture | 信息架构：页面层级、导航结构 |
| AI Decision Logic | AI 决策逻辑：何时调分析、何时调建议 |
| Prompt Design | Prompt 工程设计：System Prompt、输出格式 |
| Tech Stack & Data Flow | 技术栈选型、数据流向、架构图 |

→ 产看方式：用任意 Markdown 阅读器打开（Typora / VS Code / Notion Import）

## 🔒 上线检查清单

- [x] `npm run build` 通过
- [x] DeepSeek Key 仅服务端调用
- [x] 无硬编码 user_id
- [x] 用户数据隔离
- [x] 所有资源链接国内可访问
- [x] iPhone 安全区适配
- [x] 底部导航固定悬浮

## 📄 License

MIT
