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

// 同步读——优先模块缓存，AuthSync 注入
// 注意：页面首次渲染时 AuthSync 还未执行，可能返回 "unauth"
// 所有页面 useEffect 中会重新通过 supabase.auth.getUser() 获取正确 ID
export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  if (_authUserId) return _authUserId;
  return "unauth";
}

// 异步获取——页面需要真实 user_id 时用
export async function fetchUserId(): Promise<string> {
  if (_authUserId) return _authUserId;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const { data: { user } } = await createClient().auth.getUser();
    if (user) {
      setAuthUser(user.id, user.email);
      return user.id;
    }
  } catch {}
  return "unauth";
}

export function getUserEmail(): string { return _authEmail || ""; }

// ===== 用户 Profile —— Supabase user_profiles 表 =====
let _profileNickname = "";
export function setProfileNickname(n: string) { _profileNickname = n; }
export function getProfileNickname(): string { return _profileNickname; }
// 向后兼容 Dashboard 等页
export function getUserName(): string { return _profileNickname; }
export function setUserName(name: string) { _profileNickname = name; }

// ===== 当前选中的目标档案 =====
const GOAL_KEY = "offerpilot_active_goal";
let _activeGoalId: number | null | undefined = undefined;

export function setActiveGoalId(id: number) {
  _activeGoalId = id;
  if (typeof window !== "undefined") localStorage.setItem(GOAL_KEY, String(id));
  // 同步到 Supabase
  if (_authUserId && typeof window !== "undefined") {
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().from("user_profiles").upsert({ user_id: _authUserId, active_goal_id: id }, { onConflict: "user_id" }).then(() => {});
    });
  }
}

export function getActiveGoalId(): number | null {
  if (_activeGoalId !== undefined) return _activeGoalId;
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(GOAL_KEY);
  _activeGoalId = v ? Number(v) : null;
  return _activeGoalId;
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
