const ACTIVE_KEY = "offerpilot_active_profile";
const PROFILES_KEY = "offerpilot_profiles";
const NAME_KEY = "offerpilot_user_name";

// 纯同步，读 localStorage
export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(ACTIVE_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(ACTIVE_KEY, id);
  }
  return id;
}

// Auth 登录后把 Supabase user.id 写进来
export function setAuthUserId(uid: string) {
  localStorage.setItem(ACTIVE_KEY, uid);
}

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) || "";
}
export function setUserName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}

export interface Profile {
  id: string;
  role: string;
  city: string;
  createdAt: string;
}

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"); }
  catch { return []; }
}

export function saveProfile(role: string, city: string) {
  const profiles = getProfiles();
  const uid = getUserId();
  const existing = profiles.find((p) => p.id === uid);
  if (existing) { existing.role = role; existing.city = city; }
  else { profiles.push({ id: uid, role, city, createdAt: new Date().toISOString() }); }
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function switchProfile(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
  window.location.href = "/dashboard";
}

export function createNewProfile(): string {
  const id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(ACTIVE_KEY, id);
  // 不创建占位档案——等 saveProfile 写入真实数据
  return id;
}
