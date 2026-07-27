"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";

/* ═══════════════════ ANIMATION PRIMITIVES ═══════════════════ */

function StaggerItem({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 12 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = springVal.on("change", (latest) => setDisplay(Math.round(latest).toString()));
    return unsub;
  }, [springVal]);

  return <span ref={ref} className={className}>{display}{suffix}</span>;
}

function AnimatedBar({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : {}}
        transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`h-full rounded-full ${className}`}
      />
    </div>
  );
}

/* ═══════════════════ PHONE FRAME with 3D Perspective ═══════════════════ */

function PhoneFrame({ children, bg }: { children: React.ReactNode; bg?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 30 });
  const glowX = useSpring(mouseX, { stiffness: 60, damping: 35 });

  // Scroll-based rotation
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const scrollRY = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const scrollRX = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -2]);

  // Mouse-driven rotation (±5deg X, ±8deg Y) — clamp mouse to [-1,1] range
  const mouseRY = useTransform(springX, [-0.5, 0.5], [8, -8]);
  const mouseRX = useTransform(springY, [-0.5, 0.5], [-5, 5]);

  // Combine scroll + mouse
  const finalRY = useTransform(() => scrollRY.get() + mouseRY.get());
  const finalRX = useTransform(() => scrollRX.get() + mouseRX.get());

  // Gloss reflection position
  const glossPos = useTransform(glowX, [-0.5, 0.5], [20, 80]);
  const glossBg = useTransform(glossPos, (p) =>
    `linear-gradient(105deg, transparent ${Number(p) - 8}%, rgba(255,255,255,0.10) ${Number(p)}%, rgba(255,255,255,0.03) ${Number(p) + 3}%, transparent ${Number(p) + 12}%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      style={{ perspective: 1000 }}
      className="relative mx-auto w-[375px] cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateY: finalRY,
          rotateX: finalRX,
          transformStyle: "preserve-3d",
        }}
        className="rounded-[2.5rem] border-[4px] border-gray-200 bg-white shadow-2xl shadow-gray-300/50 overflow-hidden relative"
      >
        {/* Glass reflection overlay */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none rounded-[2.4rem]"
          style={{ background: glossBg }}
        />

        {/* Subtle edge highlight */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[2.4rem] ring-1 ring-inset ring-white/30" />

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-gray-200 rounded-b-2xl z-30" />

        {/* Screen content — kept perfectly stable */}
        <div className="relative z-10 h-[700px] overflow-hidden" style={{ background: bg || "#f8faff", transform: "translateZ(0)" }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════ SECTION WRAPPER ═══════════════════ */

function Section({ children, reverse, bg }: { children: React.ReactNode; reverse?: boolean; bg?: string }) {
  return (
    <section className={`min-h-screen flex items-center justify-center px-6 py-16 ${bg || ""}`}>
      <div className={`max-w-6xl w-full flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}>
        {children}
      </div>
    </section>
  );
}

function TextSide({ num, title, desc, bullets }: { num: string; title: React.ReactNode; desc: string; bullets?: string[] }) {
  return (
    <div className="flex-1 max-w-sm lg:max-w-md">
      <StaggerItem delay={0}>
        <span className="text-blue-500 text-xs font-mono tracking-[0.25em] uppercase">{num}</span>
      </StaggerItem>
      <StaggerItem delay={0.1}>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mt-3 mb-4 leading-tight">{title}</h2>
      </StaggerItem>
      <StaggerItem delay={0.2}>
        <p className="text-gray-500 text-base leading-relaxed">{desc}</p>
      </StaggerItem>
      {bullets && (
        <ul className="mt-5 space-y-2">
          {bullets.map((b, i) => (
            <StaggerItem key={b} delay={0.3 + i * 0.08}>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5 shrink-0">•</span> {b}
              </li>
            </StaggerItem>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ═══════════════════ SCREEN: GOAL ═══════════════════ */

function GoalScreen() {
  return (
    <div className="h-full flex flex-col" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      <div className="px-6 pt-4 pb-0 flex items-center shrink-0">
        <StaggerItem delay={0.05} className="flex items-center gap-1 text-blue-500">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">返回</span>
        </StaggerItem>
      </div>

      <div className="px-6 mb-2 mt-3 shrink-0">
        <StaggerItem delay={0.1}>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">创建你的目标</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">告诉我们你的目标岗位，让 AI 为你规划成长路线</p>
        </StaggerItem>
      </div>

      <div className="flex-1 px-6 space-y-2 overflow-auto pb-2">
        {/* Role Picker */}
        <StaggerItem delay={0.2}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
            <label className="block text-xs text-gray-400 mb-2">目标岗位</label>
            <div className="w-full flex items-center justify-between text-left">
              <motion.span
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="text-lg font-medium text-blue-600"
              >
                AI 产品经理
              </motion.span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </StaggerItem>

        {/* Role grid */}
        <StaggerItem delay={0.3}>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            whileInView={{ opacity: 1, height: "auto" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-2">
              <div className="text-[10px] font-semibold text-gray-300 uppercase px-2 py-1 tracking-wider">产品经理</div>
              <div className="flex flex-wrap gap-1 px-1">
                {["产品经理", "AI 产品经理", "ToB 产品经理", "ToC 产品经理", "增长产品经理"].map((r, i) => (
                  <motion.span
                    key={r}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55 + i * 0.04 }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border ${r === "AI 产品经理" ? "bg-blue-50 text-blue-600 border-blue-200 font-semibold ring-1 ring-blue-200" : "bg-gray-50 text-gray-600 border-gray-100"}`}
                  >
                    {r}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </StaggerItem>

        {[
          { label: "目标城市", value: "上海" },
          { label: "目标公司（选填）", value: "字节跳动" },
          { label: "期望入职时间", value: "2027 秋招" },
          { label: "期望薪资（选填）", value: "20-30K" },
        ].map((f, i) => (
          <StaggerItem key={f.label} delay={0.35 + i * 0.08}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
              <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <input value={f.value} readOnly className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none" />
              </motion.div>
            </div>
          </StaggerItem>
        ))}
      </div>

      <div className="px-6 pt-2 pb-2 shrink-0">
        <StaggerItem delay={0.8}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-blue-500 text-white font-semibold text-lg rounded-2xl text-center shadow-lg shadow-blue-200 cursor-pointer"
          >
            开始 AI 分析
          </motion.div>
        </StaggerItem>
      </div>
    </div>
  );
}

/* ═══════════════════ SCREEN: ANALYSIS ═══════════════════ */

function AnalysisScreen() {
  const scores = [
    { dim: "学习能力", score: 68, color: "bg-emerald-500" },
    { dim: "项目经验", score: 55, color: "bg-amber-500" },
    { dim: "PRD 撰写", score: 28, color: "bg-red-500" },
    { dim: "AI 工具应用", score: 35, color: "bg-amber-500" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
      <div className="px-6 pt-4 pb-0 shrink-0">
        <StaggerItem delay={0.05} className="flex items-center gap-1 text-blue-500 mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">返回</span>
        </StaggerItem>
        <StaggerItem delay={0.1}>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI 分析报告</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">基于你提供的真实背景，AI 评估你的能力现状</p>
        </StaggerItem>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-6 pb-24">
        {/* Ability Scores */}
        <StaggerItem delay={0.2}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">能力维度评估</h2>
            <div className="space-y-4">
              {scores.map((a, i) => (
                <div key={a.dim}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{a.dim}</span>
                    <AnimatedNumber
                      value={a.score}
                      className={`text-sm font-bold ${a.score >= 60 ? "text-emerald-500" : a.score >= 30 ? "text-amber-500" : "text-red-500"}`}
                    />
                  </div>
                  <AnimatedBar value={a.score} className={a.color} />
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Strengths */}
        <StaggerItem delay={0.35}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">当前优势</h2>
            <div className="flex flex-wrap gap-2">
              {["学习能力强", "有项目经验"].map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {s}
                </motion.span>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Gaps */}
        <StaggerItem delay={0.45}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">能力缺口</h2>
            <div className="flex flex-wrap gap-2">
              {["无 PRD 经验", "未使用过 AI 工具"].map((g, i) => (
                <motion.span
                  key={g}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" /></svg>
                  {g}
                </motion.span>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Roadmap preview */}
        <StaggerItem delay={0.55}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">为你生成的成长路线</h2>
            <div className="relative">
              {[
                { stage: "基础能力", duration: "1-2个月", goal: "掌握核心基础", active: true },
                { stage: "核心技能", duration: "2-3个月", goal: "提升专业能力", active: false },
                { stage: "项目实践", duration: "3-4个月", goal: "积累作品经验", active: false },
                { stage: "求职准备", duration: "4-5个月", goal: "准备面试材料", active: false },
              ].map((phase, i, arr) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.75 + i * 0.12 }}
                  className="flex items-start gap-4 pb-5 last:pb-0 relative"
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${phase.active ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"}`} />
                    {i < arr.length - 1 && <div className={`w-0.5 h-full min-h-[28px] mt-1 ${phase.active ? "bg-blue-500" : "bg-gray-200"}`} />}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center gap-2.5 mb-0.5">
                      <h3 className={`text-base font-semibold ${phase.active ? "text-blue-500" : "text-gray-400"}`}>{phase.stage}</h3>
                      <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-lg">{phase.duration}</span>
                    </div>
                    <p className="text-xs text-gray-400">{phase.goal}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Next Action */}
        <StaggerItem delay={0.65}>
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                  <path d="M10 5V10L13 12" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-700 mb-1">下一步建议</h3>
                <p className="text-sm text-gray-600 leading-relaxed">本周集中学习 PRD 文档撰写规范，完成第一个产品需求文档练习</p>
              </div>
            </div>
          </div>
        </StaggerItem>
      </div>

      <div className="px-6 pt-2 pb-3 shrink-0 bg-gradient-to-t from-white via-white to-transparent">
        <StaggerItem delay={0.8}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-blue-500 text-white font-semibold text-lg rounded-2xl text-center shadow-lg shadow-blue-200 cursor-pointer"
          >
            进入首页
          </motion.div>
        </StaggerItem>
      </div>
    </div>
  );
}

/* ═══════════════════ SCREEN: ROADMAP ═══════════════════ */

function RoadmapScreen() {
  const readiness = 42;

  function stageStyle(i: number, total: number) {
    const perStage = 90 / total;
    const threshold = Math.round((i + 1) * perStage);
    if (readiness >= threshold) return { s: "已完成", cls: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500 ring-blue-100", line: "bg-blue-500" };
    if (i === 0 || readiness >= Math.round(i * perStage)) return { s: "进行中", cls: "bg-indigo-50 text-indigo-600 border-indigo-100", dot: "bg-indigo-500 ring-indigo-100", line: "bg-indigo-500" };
    return { s: "待开始", cls: "bg-gray-50 text-gray-400 border-gray-100", dot: "bg-gray-300 ring-gray-100", line: "bg-transparent" };
  }

  const stages = [
    { stage: "基础能力", duration: "1.5个月", goal: "掌握核心基础概念，建立知识框架", reason: "入职必备基本功" },
    { stage: "核心技能", duration: "2个月", goal: "提升专业能力，达到岗位基础要求", reason: "岗位核心要求" },
    { stage: "项目实践", duration: "3个月", goal: "积累项目经验，打造个人作品集", reason: "企业最看重" },
    { stage: "求职准备", duration: "1.5个月", goal: "准备简历、面试，开始投递", reason: "冲刺阶段" },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "#f8faff" }}>
      <div className="px-6 pt-4 pb-1 shrink-0">
        <StaggerItem delay={0.05} className="flex items-center gap-1 text-blue-500 mb-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm">返回</span>
        </StaggerItem>
        <StaggerItem delay={0.1}>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI 成长路线</h1>
          <p className="text-gray-400 text-base mt-1.5 leading-relaxed">根据你的目标 Offer，AI 为你规划成长路径</p>
        </StaggerItem>
      </div>

      <div className="flex-1 overflow-auto pb-20">
        {/* Target Job Card */}
        <StaggerItem delay={0.2}>
          <div className="px-6 mb-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">目标岗位</h3>
                  <p className="text-lg font-semibold text-gray-900">AI 产品经理</p>
                  <p className="text-xs text-gray-400 mt-0.5">上海 · 2027 秋招</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">综合准备度</h3>
                  <AnimatedNumber value={readiness} suffix="%" className="text-2xl font-bold text-blue-500" />
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${readiness}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Timeframe Selector */}
        <StaggerItem delay={0.3}>
          <div className="px-6 mb-3">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-900">可用时间</span>
                <span className="text-xs text-gray-400">AI 原规划 8 个月，你可自定义</span>
              </div>
              <div className="flex gap-2 mb-3">
                {[1, 3, 6, 9, 12].map((m, i) => (
                  <motion.span
                    key={m}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border text-center cursor-pointer ${m === 6 ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-100"}`}
                  >
                    {m}个月
                  </motion.span>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "33%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
                <span className="text-sm font-bold text-blue-500 w-14 text-right">6个月</span>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Timeline */}
        <div className="px-6 mb-3">
          <StaggerItem delay={0.4}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">你的成长阶段</h2>
          </StaggerItem>
          <div className="relative">
            {stages.map((phase, i) => {
              const s = stageStyle(i, stages.length);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="flex items-start gap-3.5 pb-0"
                >
                  <div className="flex flex-col items-center flex-shrink-0 pt-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + i * 0.12, type: "spring", stiffness: 300 }}
                      className={`w-3.5 h-3.5 rounded-full ring-4 flex-shrink-0 ${s.dot}`}
                    />
                    {i < stages.length - 1 && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 + i * 0.12, duration: 0.4 }}
                        className={`w-0.5 flex-1 min-h-[36px] mt-1 origin-top ${s.line}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full text-left rounded-2xl border p-4 ${s.cls}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold opacity-50">{String(i + 1).padStart(2, "0")}</span>
                          <h3 className="text-sm font-semibold">{phase.stage}</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium opacity-70">{phase.duration}</span>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M4 6L7 9L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI Suggestion */}
        <StaggerItem delay={0.7}>
          <div className="px-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">AI 建议</h2>
            <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm shadow-indigo-50 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <motion.svg
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                  >
                    <circle cx="10" cy="10" r="7" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                    <circle cx="10" cy="10" r="3" fill="#6366f1" />
                    <line x1="10" y1="3" x2="10" y2="7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.svg>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                  根据你的能力评估，当前优先提升 <span className="font-semibold text-gray-900">PRD 撰写</span> 和 <span className="font-semibold text-gray-900">AI 工具应用</span> 能力。
                </p>
              </div>
              <div className="bg-indigo-50 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="6" stroke="#6366f1" strokeWidth="1.2" />
                  <path d="M8 4V8L10.5 9.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-medium text-indigo-700">本周完成 PRD 文档基础学习，下周开始 AI 工具实操</span>
              </div>
            </div>
          </div>
        </StaggerItem>
        <div className="h-4" />
      </div>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-white border-t border-gray-100 px-2 pt-2 pb-4 flex items-center justify-around">
        {[
          { l: "首页", i: "home", a: false },
          { l: "路线", i: "route", a: true },
          { l: "学习", i: "learn", a: false },
          { l: "成长", i: "growth", a: false },
          { l: "我的", i: "profile", a: false },
        ].map((item) => (
          <div key={item.l} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <motion.div
              animate={item.a ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-6 h-6 flex items-center justify-center ${item.a ? "text-blue-500" : "text-gray-300"}`}
            >
              {iconMap(item.i, item.a)}
            </motion.div>
            <span className={`text-[10px] font-medium ${item.a ? "text-blue-500" : "text-gray-300"}`}>{item.l}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

function iconMap(name: string, active: boolean) {
  const c = active ? "currentColor" : "currentColor";
  switch (name) {
    case "home": return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 10L12 3L21 10V20H14V14H10V20H3V10Z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} /></svg>;
    case "route": return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} /><path d="M12 6V12L16 14" stroke={c} strokeWidth="2" strokeLinecap="round" /></svg>;
    case "learn": return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} /><line x1="8" y1="9" x2="16" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="12" x2="14" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" /></svg>;
    case "growth": return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polyline points="3,17 9,11 13,15 21,7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "#eff6ff" : "none"} /><polyline points="16,7 21,7 21,12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "profile": return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" fill={active ? "#eff6ff" : "none"} /><path d="M4 20C4 16 8 14 12 14C16 14 20 16 20 20" stroke={c} strokeWidth="2" strokeLinecap="round" /></svg>;
    default: return null;
  }
}

/* ═══════════════════ SCREEN: LEARNING ═══════════════════ */

function LearningScreen() {
  return (
    <div className="h-full flex flex-col" style={{ background: "#f8faff" }}>
      <div className="flex-1 overflow-auto pb-20">
        <div className="px-6 pt-4 pb-1">
          <StaggerItem delay={0.05} className="flex items-center gap-1 text-blue-500 mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-sm">返回</span>
          </StaggerItem>
          <StaggerItem delay={0.1}>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">学习中心</h1>
            <p className="text-gray-400 text-base mt-1.5 leading-relaxed">「AI 产品经理」· 基础能力 · AI 推荐学习资源</p>
          </StaggerItem>
        </div>

        {/* Featured */}
        <StaggerItem delay={0.2}>
          <div className="px-6 mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">今日推荐</h2>
            <div className="bg-white rounded-3xl border border-blue-100 shadow-sm shadow-blue-50 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 origin-left"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 产品经理 入门教程</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">根据你的目标岗位「AI 产品经理」，当前<span className="font-semibold text-gray-900">PRD 撰写</span>需要进一步提升。</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-gray-500">方向：</span><span className="text-xs font-semibold text-gray-900">PRD 撰写</span></div>
                  <div className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9ca3af" strokeWidth="1.2" /><line x1="7" y1="4.5" x2="7" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="7" x2="9" y2="7" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" /></svg><span className="text-xs text-gray-500">预计：</span><span className="text-xs font-semibold text-gray-900">45 分钟</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-blue-500 text-white font-semibold text-sm rounded-2xl text-center cursor-pointer">
                    开始测验
                  </motion.div>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg whitespace-nowrap">首次测验满分 +5</span>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Resources */}
        <div className="px-6">
          <StaggerItem delay={0.3}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2.5">推荐资源</h2>
          </StaggerItem>
          <div className="space-y-2.5">
            {[
              { title: "AI 产品经理 零基础入门", source: "Bilibili", desc: "PRD 撰写方向零基础入门视频，快速建立认知。", reason: "入门「PRD 撰写」", typeColor: "bg-red-50 text-red-500", type: "视频学习" },
              { title: "PRD 文档基础概念", source: "官方文档", desc: "系统学习 PRD 基础知识，打好地基。", reason: "打好「PRD」基础", typeColor: "bg-blue-50 text-blue-500", type: "官方文档" },
              { title: "AI 工具实操练习", source: "Gitee", desc: "通过简单练习熟悉 AI 工具基本操作。", reason: "练习「AI 工具应用」", typeColor: "bg-emerald-50 text-emerald-600", type: "实践项目" },
            ].map((r, i) => (
              <StaggerItem key={i} delay={0.4 + i * 0.1}>
                <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.typeColor}`}>
                      {r.type === "视频学习" ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" /><polygon points="8,6 8,14 14,10" fill="currentColor" /></svg>
                        : r.type === "官方文档" ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" /><line x1="7" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><line x1="7" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 13L6 6L9 9L12 4L15 7L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="14" cy="4" r="1.5" fill="currentColor" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</h4><span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md mt-1 ${r.typeColor}`}>{r.type}</span></div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M6 3L11 8L6 13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">{r.desc}</p>
                  <div className="flex items-center justify-between"><span className="text-[11px] text-gray-300">来源：{r.source}</span><span className="text-[11px] text-blue-400">{r.reason}</span></div>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </div>
        <div className="h-4" />
      </div>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-white border-t border-gray-100 px-2 pt-2 pb-4 flex items-center justify-around">
        {[
          { l: "首页", i: "home", a: false },
          { l: "路线", i: "route", a: false },
          { l: "学习", i: "learn", a: true },
          { l: "成长", i: "growth", a: false },
          { l: "我的", i: "profile", a: false },
        ].map((item) => (
          <div key={item.l} className="flex flex-col items-center gap-0.5 px-3 py-1">
            <motion.div
              animate={item.a ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-6 h-6 flex items-center justify-center ${item.a ? "text-blue-500" : "text-gray-300"}`}
            >
              {iconMap(item.i, item.a)}
            </motion.div>
            <span className={`text-[10px] font-medium ${item.a ? "text-blue-500" : "text-gray-300"}`}>{item.l}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */

export default function Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -40]);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#eff6ff_0%,transparent_70%)]" />
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-blue-500 text-xs font-mono tracking-[0.3em] uppercase mb-4"
          >
            AI × Career Navigation
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none"
          >
            <span className="text-blue-500">Offer</span>Pilot
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-gray-400 text-lg sm:text-xl mt-4 max-w-md mx-auto"
          >
            Your AI career navigator.<br />From goal to offer, one step at a time.
          </motion.p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="relative z-10 text-gray-300 text-sm mt-12"
        >
          Scroll to explore ↓
        </motion.p>
      </section>

      {/* 01 — Goal */}
      <Section>
        <TextSide
          num="01 — Goal"
          title={<>Choose your <span className="text-blue-500">target</span>.</>}
          desc="Pick from 150+ roles across 14 categories. Set your target city, company, and timeline. One click starts your AI-powered journey."
          bullets={["14 career categories, 150+ roles", "Real market data matches your target", "Instant AI analysis trigger"]}
        />
        <div className="flex-1 flex justify-center lg:justify-end">
          <PhoneFrame bg="linear-gradient(180deg, #ffffff 0%, #f8faff 100%)"><GoalScreen /></PhoneFrame>
        </div>
      </Section>

      {/* 02 — Analysis */}
      <Section reverse bg="bg-[#fafbfc]">
        <TextSide
          num="02 — Analysis"
          title={<>AI finds your <span className="text-blue-500">gaps</span>.</>}
          desc="Our AI scans your background against real JD requirements. See exactly which skills you have and which ones you need."
          bullets={["4-dimension ability scoring", "Strength & gap visualization", "Personalized growth roadmap"]}
        />
        <div className="flex-1 flex justify-center lg:justify-start">
          <PhoneFrame bg="linear-gradient(180deg, #ffffff 0%, #f8faff 100%)"><AnalysisScreen /></PhoneFrame>
        </div>
      </Section>

      {/* 03 — Roadmap */}
      <Section>
        <TextSide
          num="03 — Roadmap"
          title={<>Your <span className="text-blue-500">path</span>, step by step.</>}
          desc="A 4-stage growth roadmap built for your target. Adjust the timeline freely. Each stage auto-advances as you complete quizzes."
          bullets={["Flexible timeline with slider control", "Real-time readiness progress bar", "Stage details expand on tap"]}
        />
        <div className="flex-1 flex justify-center lg:justify-end">
          <PhoneFrame><RoadmapScreen /></PhoneFrame>
        </div>
      </Section>

      {/* 04 — Learning */}
      <Section reverse bg="bg-[#fafbfc]">
        <TextSide
          num="04 — Learning"
          title={<>Learn. <span className="text-blue-500">Level up.</span></>}
          desc="AI-curated resources tailored to your weakest dimensions. Take quizzes, earn scores, and watch your skills grow in real time."
          bullets={["AI-recommended daily learning", "Adaptive quiz with instant scoring", "Per-dimension skill growth tracking"]}
        />
        <div className="flex-1 flex justify-center lg:justify-start">
          <PhoneFrame><LearningScreen /></PhoneFrame>
        </div>
      </Section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-[#fafbfc]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-md mx-auto"
        >
          <h2 className="text-3xl font-bold tracking-tight">Ready to start?</h2>
          <p className="text-gray-400 mt-3 mb-8">From goal to offer. AI-powered, step by step.</p>
          <div className="flex gap-3 justify-center">
            <a href="https://offerpilot-kappa.vercel.app" target="_blank"
              className="px-6 py-3 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors">
              Try OfferPilot →
            </a>
            <a href="https://github.com/jz-226/offerpilot" target="_blank"
              className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
              GitHub
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="py-8 text-center text-gray-300 text-xs">
        OfferPilot · AI Career Navigator
      </footer>
    </main>
  );
}
