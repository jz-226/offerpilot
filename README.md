# OfferPilot 🚀

**Goal-Oriented AI Career Growth Agent**

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-上线-green?logo=vercel)](https://offerpilot-kappa.vercel.app)

> 🔗 线上地址：**[offerpilot-kappa.vercel.app](https://offerpilot-kappa.vercel.app)**

## 🎬 演示视频

📹 [下载演示视频（2 分 49 秒）](docs/demo.mp4)

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

- **Supabase Auth 登录** — 邮箱 OTP 验证码，多账号记忆切换，自动 Profile 创建
- **150+ 岗位选择** — 对标 BOSS直聘真实分类，产品/前端/后端/数据/算法/设计/运营全覆盖
- **AI 能力分析** — DeepSeek V4 Pro 两阶段分析：先识别岗位类型，再评估能力差距
- **动态评估** — 根据岗位自动切换评估维度，共 17 组 JD 匹配规则
- **个性化成长路线** — AI 生成 4-5 个阶段，readiness 达标自动推进
- **异步测验** — 5 题（2 简 1 中 2 难）+ AI 出题判分 + 逐题反馈 + AI 分析错题，异步任务轮询不卡页面
- **能力里程** — 5 级认证体系（🌱入门→🌿基础→🪴独立→🌳熟练→🏆精通）
- **每日反思** — 写学习总结，AI 给鼓励性反馈
- **多岗位档案** — 同时维护多个求职方向，一键切换，数据完全隔离
- **手机优先** — 375px 适配，底部固定导航，SPA 路由 <100ms 切换
- **完整 Auth 体系** — OTP 验证码 + Session 管理 + Middleware 鉴权 + 数据隔离

## 🛠 技术栈

| 层 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | Supabase (PostgreSQL + Auth + RLS) |
| AI | DeepSeek V4 Pro + V4 Flash |
| 部署 | Vercel (CI/CD) |

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx              # Splash 欢迎页
│   ├── login/                # 邮箱 OTP 登录（Supabase Auth）
│   ├── welcome/              # 登录后中枢（岗位选择）
│   ├── clean/                # 一键清空缓存
│   ├── onboarding/           # 功能介绍
│   ├── goal/                 # 目标创建（150+ 岗位选择器）
│   ├── assessment/           # 能力自评（动态 JD 匹配）
│   ├── analysis/             # AI 分析报告（异步+重试）
│   ├── dashboard/            # 首页（准备度、每日任务、打卡）
│   ├── roadmap/              # 成长路线（自定义时间）
│   ├── learning/             # 学习中心（异步测验弹窗）
│   ├── reflection/           # 每日反思（AI 总结）
│   ├── growth/               # 成长记录（时间线+删除）
│   ├── profile/              # 个人档案（多岗位切换+昵称编辑）
│   ├── test-done/            # 满分演示页
│   ├── auth/callback/        # Auth OTP 回调
│   └── api/
│       ├── analyze/          # AI 分析接口（JSON 容错）
│       ├── quiz/             # 异步测验（start + status 轮询）
│       ├── summarize/        # AI 总结接口
│       └── auth/             # OTP 发送/校验
├── components/
│   └── AuthSync.tsx          # 全局 Auth 同步（Session 缓存）
├── lib/
│   ├── supabase/             # 数据库 client/server + service
│   ├── ai/deepseek.ts        # DeepSeek 调用（重试+超时配置）
│   ├── user.ts               # 用户身份（Auth Session 优先）
│   └── milestone.ts          # 能力里程计算
├── middleware.ts             # 轻量鉴权（<1ms cookie 检查）
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

### 3. 开启 Supabase Auth

Authentication → Providers → 开启 **Email** 和 **Email OTP**

### 4. 配置 DeepSeek

去 [platform.deepseek.com](https://platform.deepseek.com) 申请 API Key

### 5. 环境变量

创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
DEEPSEEK_API_KEY=sk-你的key
```

### 6. 启动

```bash
npm run dev
```

打开 http://localhost:3000

## 📊 数据库表

| 表 | 用途 |
|------|------|
| `user_goals` | 用户目标 |
| `user_assessment` | 能力自评 |
| `ai_analysis` | AI 分析结果 |
| `quiz_results` | 测验记录（user_id + goal_id 双键） |
| `quiz_tasks` | 异步测验任务 |
| `reflections` | 每日反思 |
| `user_profiles` | 用户 Profile |
| `roadmap` | 成长路线 |
| `otp_codes` | 验证码记录 |

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

## 🔧 工程实践

- **数据隔离**：Auth user_id + goal_id 双重键，跨账号跨岗位完全隔离
- **JSON 容错**：从 DeepSeek V4 推理输出中智能提取 JSON，处理截断/换行
- **异步任务**：Quiz 生成轮询模式（pending→completed/failed→auto-retry 5 次）
- **性能优化**：中间件 <1ms（本地 cookie 检查）、SPA 导航 <100ms、Auth 缓存
- **AI 模型切换**：V4 Pro（分析深度）⊕ V4 Flash（测验速度）
- **响应式**：375px 移动端优先，iPhone 安全区，60fps 滚动优化

## 📄 License

MIT
