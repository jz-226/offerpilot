# OfferPilot V1 - MVP Prioritization

## 1. 优先级原则

MVP 开发遵循：

> 优先完成能够证明核心价值闭环的功能。
> 

核心闭环：

用户创建目标

↓

AI 分析差距

↓

生成今日任务

↓

用户完成行动

↓

提交成长反馈

↓

更新成长状态

---

# 2. P0（必须完成）

## Feature 1：Create Goal（创建目标）

优先级：

P0

原因：

没有用户目标，AI 无法进行个性化分析。

实现：

用户输入：

- 目标岗位
- 目标城市
- 目标时间
- 当前背景

输出：

用户目标数据。

---

## Feature 2：AI Goal Analysis（目标分析）

优先级：

P0

原因：

这是产品核心 AI 能力。

实现：

输入：

用户目标

调用 DeepSeek

输出：

- 能力模型
- Gap分析
- 成长建议

---

## Feature 3：Dashboard（首页）

优先级：

P0

原因：

体现产品核心价值：

“每天知道最重要的一件事。”

实现：

展示：

- 今日任务
- Offer Readiness
- AI建议

---

## Feature 4：Daily Reflection（每日反馈）

优先级：

P0

原因：

形成 Evidence 闭环。

实现：

用户提交：

- 学习总结
- 笔记

AI 输出：

- 成长反馈
- 下一步建议

---

# 3. P1（重要但可延后）

## Feature 5：Roadmap（成长路线）

优先级：

P1

原因：

增强长期规划体验。

实现：

展示：

- 阶段目标
- 成长节点

---

## Feature 6：Learning Hub（学习中心）

优先级：

P1

原因：

辅助完成任务。

实现：

AI 推荐：

- B站资源
- 文档
- GitHub

---

# 4. P2（未来版本）

## Feature 7：Profile

优先级：

P2

原因：

不影响核心闭环。

---

## Feature 8：复杂通知系统

P2

未来：

- 每日提醒
- 周总结

---

## Feature 9：社区功能

P2

未来：

用户交流

经验分享

---

# 5. V1 Demo 核心路径

最终 Demo 只需要跑通：

```
创建目标

↓

AI分析报告

↓

Dashboard生成今日任务

↓

Learning Hub查看资源

↓

Daily Reflection提交反馈

↓

Readiness更新
```

---

# 6. V1 成功标准

不是功能数量。

而是：

用户可以体验完整闭环：

“我有一个 Offer 目标 → AI告诉我差距 → AI告诉我今天做什么 → 我行动 → AI记录成长。”