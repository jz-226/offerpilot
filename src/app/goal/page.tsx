"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUserGoal } from "@/lib/supabase/service";
import { getUserId, saveProfile, createNewProfile, getProfiles, setActiveGoalId } from "@/lib/user";

const roleCategories = [
  {
    category: "后端开发",
    roles: ["Java 开发", "Python 开发", "Go 开发", "Node.js 开发", "C++ 开发", "PHP 开发", ".NET 开发", "C# 开发", "全栈工程师", "后端工程师", "区块链工程师"],
  },
  {
    category: "前端 / 移动端",
    roles: ["前端工程师", "Web 前端开发", "JavaScript 开发", "Android 开发", "iOS 开发", "鸿蒙开发", "小程序开发", "H5 开发", "React Native 开发", "Flutter 开发", "移动端开发", "U3D 开发", "UE4/UE5 开发"],
  },
  {
    category: "人工智能 / 算法",
    roles: ["算法工程师", "大模型算法", "NLP 工程师", "CV 工程师", "推荐算法", "搜索算法", "语音算法", "机器学习工程师", "深度学习工程师", "数据挖掘", "风控算法", "自动驾驶算法", "SLAM 算法", "AI 训练师", "算法研究员"],
  },
  {
    category: "数据",
    roles: ["数据分析师", "数据工程师", "数据科学家", "BI 分析师", "ETL 工程师", "大数据开发", "数据架构师", "数据仓库", "爬虫工程师", "数据治理"],
  },
  {
    category: "产品经理",
    roles: ["产品经理", "AI 产品经理", "ToB 产品经理", "ToC 产品经理", "ToG 产品经理", "电商产品经理", "金融产品经理", "教育产品经理", "医疗产品经理", "游戏产品经理", "策略产品经理", "增长产品经理", "商业化产品经理", "产品总监"],
  },
  {
    category: "测试",
    roles: ["测试工程师", "软件测试", "自动化测试", "功能测试", "测试开发", "性能测试", "硬件测试", "游戏测试", "渗透测试", "QA 工程师"],
  },
  {
    category: "运维 / DevOps",
    roles: ["运维工程师", "DevOps 工程师", "SRE 工程师", "运维开发工程师", "网络工程师", "系统工程师", "系统管理员", "DBA", "IT 技术支持", "云平台运维"],
  },
  {
    category: "安全",
    roles: ["安全工程师", "网络安全", "渗透测试工程师", "安全架构师", "数据安全工程师", "系统安全", "安全运维"],
  },
  {
    category: "设计",
    roles: ["UI 设计师", "UX 设计师", "交互设计师", "视觉设计师", "平面设计师", "品牌设计师", "动效设计师", "原画师", "三维建模", "包装设计", "美术指导", "技术美术（TA）"],
  },
  {
    category: "运营",
    roles: ["用户运营", "内容运营", "产品运营", "活动运营", "新媒体运营", "社区运营", "电商运营", "直播运营", "数据运营", "策略运营", "B端商家运营", "游戏运营", "视频运营", "微信运营", "跨境电商运营"],
  },
  {
    category: "市场",
    roles: ["品牌营销", "公关传播", "SEM/SEO", "广告投放", "市场推广", "ASO 优化", "社交媒体运营", "活动策划", "增长黑客", "新媒体运营"],
  },
  {
    category: "游戏",
    roles: ["游戏策划", "游戏运营", "游戏开发", "游戏美术", "技术美术（TA）", "游戏测试", "游戏制作人"],
  },
  {
    category: "技术管理",
    roles: ["技术经理", "架构师", "技术总监", "CTO", "技术合伙人", "项目经理", "技术负责人", "运维总监"],
  },
  {
    category: "职能 / 通用",
    roles: ["HR", "行政", "财务", "法务", "客服", "销售", "技术支持", "技术文档工程师"],
  },
];

export default function GoalPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("AI 产品经理");
  const [city, setCity] = useState("上海");
  const [company, setCompany] = useState("");
  const [deadline, setDeadline] = useState("2027 秋招");
  const [salary, setSalary] = useState("20-30K");
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = async () => {
    // 检查重复
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data: existingRole } = await supabase
      .from("user_goals")
      .select("id").eq("user_id", getUserId())
      .eq("target_role", selectedRole)
      .maybeSingle();
    if (existingRole) {
      alert(`你已有「${selectedRole}」岗位，不能重复创建。`);
      return;
    }

    setSaving(true);
    try {
      const goal = await createUserGoal({
        user_id: getUserId(),
        target_role: selectedRole,
        target_city: city,
        target_company: company,
        deadline,
        salary_range: salary,
      });
      if (goal?.id) setActiveGoalId(goal.id);
      saveProfile(selectedRole, city);
      router.push("/assessment");
    } catch (err: any) {
      console.error("保存目标失败:", err?.message || err);
      router.push("/assessment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}
    >
      {/* Top: Back */}
      <div className="px-6 pt-6 pb-0 flex items-center">
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

      {/* Hero */}
      <div className="px-6 mb-4 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          创建你的目标
        </h1>
        <p className="text-gray-400 text-base mt-1.5 leading-relaxed">
          告诉我们你的目标岗位，让 AI 为你规划成长路线
        </p>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 px-6 space-y-2.5 overflow-auto pb-4">
        {/* Role Picker */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
          <label className="block text-xs text-gray-400 mb-2">目标岗位</label>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className={`text-lg font-medium ${selectedRole ? "text-gray-900" : "text-gray-300"}`}>
              {selectedRole || "请选择"}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={`transition-transform ${showPicker ? "rotate-180" : ""}`}
            >
              <path d="M4 6L8 10L12 6" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Expanded Picker */}
        {showPicker && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-1 max-h-[55vh] overflow-auto">
            {roleCategories.map((cat) => (
              <div key={cat.category} className="mb-2 last:mb-0">
                <div className="text-[10px] font-semibold text-gray-300 uppercase px-4 py-2 tracking-wider">
                  {cat.category}
                </div>
                <div className="flex flex-wrap gap-1.5 px-3 pb-1">
                  {cat.roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setShowPicker(false);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        selectedRole === role
                          ? "bg-blue-50 text-blue-600 border-blue-200 font-semibold"
                          : "bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other fields — always input */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
          <label className="block text-xs text-gray-400 mb-1">目标城市</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="例如：上海 / 北京 / 深圳"
            className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
          <label className="block text-xs text-gray-400 mb-1">目标公司（选填）</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="输入目标公司"
            className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
          <label className="block text-xs text-gray-400 mb-1">期望入职时间</label>
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="例如：2027 春招 / 2027 秋招"
            className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
          <label className="block text-xs text-gray-400 mb-1">期望薪资（选填）</label>
          <input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="例如：15-25K"
            className="w-full text-lg text-gray-900 font-medium bg-transparent placeholder:text-gray-300 focus:outline-none"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pt-3 pb-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-4 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "保存中..." : "开始 AI 分析"}
        </button>
      </div>
    </main>
  );
}
