export interface Milestone {
  level: number;
  icon: string;
  name: string;
  desc: string;
  min: number;
}

const milestones: Milestone[] = [
  { level: 0, icon: "⚪", name: "未入门", desc: "尚未开始", min: 0 },
  { level: 1, icon: "🌱", name: "入门", desc: "了解基本概念", min: 20 },
  { level: 2, icon: "🌿", name: "基础", desc: "能在指导下完成", min: 40 },
  { level: 3, icon: "🪴", name: "独立", desc: "能独立完成标准任务", min: 60 },
  { level: 4, icon: "🌳", name: "熟练", desc: "能处理复杂场景", min: 80 },
  { level: 5, icon: "🏆", name: "精通", desc: "可以指导他人", min: 95 },
];

export function getMilestone(score: number): Milestone {
  let result = milestones[0];
  for (const m of milestones) {
    if (score >= m.min) result = m;
  }
  return result;
}

export function getNextMilestone(score: number): Milestone | null {
  for (const m of milestones) {
    if (score < m.min) return m;
  }
  return null;
}

export function getMilestoneGap(score: number): number {
  const next = getNextMilestone(score);
  return next ? next.min - score : 0;
}
