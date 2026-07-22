# OfferPilot V1 - Development Task Breakdown

## 1. 开发策略

采用 Incremental Development（渐进式开发）。

开发顺序：

基础框架

↓

核心页面

↓

AI能力接入

↓

数据闭环

↓

UI优化

---

# Phase 1：项目初始化（Project Setup）

## Task 001：创建项目基础框架

目标：

建立 OfferPilot 前端项目。

完成：

- 初始化项目
- 配置开发环境
- 创建基础目录结构
- 配置页面路由

验收：

项目可以正常运行。

---

# Phase 2：UI 页面开发

## Task 002：实现 Splash 页面

目标：

完成品牌入口。

要求：

Apple HIG 风格：

- 大留白
- 简洁
- 蓝色主题

验收：

启动后展示 Splash。

---

## Task 003：实现 Onboarding 页面

目标：

介绍产品价值。

展示：

- Goal-Oriented AI
- 每日一个关键任务
- Evidence成长

验收：

用户可以进入创建目标。

---

## Task 004：实现 Create Goal 页面

目标：

让用户创建职业目标。

输入：

- 岗位
- 城市
- 时间
- 当前背景

验收：

用户提交后保存数据。

---

# Phase 3：AI 能力开发

## Task 005：接入 DeepSeek API

目标：

建立 AI 调用能力。

实现：

- API连接
- Prompt管理
- 返回结果处理

验收：

可以成功调用模型。

---

## Task 006：实现 AI Goal Analysis

目标：

生成目标分析报告。

输入：

用户目标信息。

输出：

- 能力模型
- Gap分析
- 成长建议

验收：

展示 AI Analysis 页面。

---

# Phase 4：核心闭环

## Task 007：实现 Dashboard

目标：

展示每日成长中心。

展示：

- Offer Readiness
- 今日任务
- AI建议

验收：

用户打开首页知道下一步行动。

---

## Task 008：实现 Learning Hub

目标：

展示 AI 推荐资源。

展示：

- 推荐内容
- 推荐原因

验收：

用户可以查看学习资源。

---

## Task 009：实现 Daily Reflection

目标：

记录用户成长。

输入：

- 文本
- 笔记

AI 输出：

- Evidence
- 成长反馈

验收：

成长记录保存。

---

# Phase 5：数据闭环

## Task 010：实现 Readiness 更新逻辑

目标：

根据 Evidence 更新成长状态。

流程：

Reflection

↓

Evidence

↓

Capability更新

↓

Dashboard展示

验收：

用户反馈会影响后续任务。

---

# Phase 6：产品优化

## Task 011：Apple HIG UI优化

优化：

- 圆角
- 间距
- 字体
- 卡片设计

---

## Task 012：Demo流程优化

准备秋招展示：

完整路径：

创建目标

↓

AI分析

↓

Dashboard

↓

学习资源

↓

Reflection

↓

成长更新

---

# 开发完成标准

OfferPilot V1 完成：

用户可以体验完整闭环：

“输入目标 → AI分析 → 获得任务 → 执行动作 → 产生证据 → 成长更新”