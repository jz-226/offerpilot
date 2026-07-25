// ===== 用户身份 —— 基于 Supabase Auth，不用 localStorage =====

// 模块级缓存：AuthSync 登录后写入
let _authUserId: string | null = null;
let _authEmail: string | null = null;

export function setAuthUser(id: string, email?: string) {
  _authUserId = id;
  if (email) _authEmail = email;
}

export function clearAuthUser() {
  _authUserId = null;
  _authEmail = null;
}

// 同步读——用于所有 Supabase 查询
export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  if (_authUserId) return _authUserId;
  // 兜底：从 session cookie 重建
  return "unauth";
}

export function getUserEmail(): string { return _authEmail || ""; }

// ===== 用户名（轻量，存 localStorage 用于问候语） =====
const NAME_KEY = "offerpilot_user_name";
export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) || "";
}
export function setUserName(name: string) { localStorage.setItem(NAME_KEY, name); }

// ===== 当前选中的目标档案 =====
const GOAL_KEY = "offerpilot_active_goal";
export function setActiveGoalId(id: number) { localStorage.setItem(GOAL_KEY, String(id)); }
export function getActiveGoalId(): number | null {
  const v = localStorage.getItem(GOAL_KEY);
  return v ? Number(v) : null;
}

// ===== 记忆账号（纯展示用） =====
const ACCOUNTS_KEY = "offerpilot_accounts";
export function addSavedAccount(email: string, name: string) {
  const accounts = getSavedAccounts();
  const existing = accounts.find((a) => a.email === email);
  if (existing) { existing.name = name; existing.lastLogin = Date.now(); }
  else { accounts.push({ email, name, lastLogin: Date.now() }); }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
export function getSavedAccounts(): { email: string; name: string; lastLogin: number }[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}
export function removeSavedAccount(email: string) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(getSavedAccounts().filter((a) => a.email !== email)));
}
