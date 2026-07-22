const ACTIVE_KEY = "offerpilot_active_profile";
const PROFILES_KEY = "offerpilot_profiles";

export interface Profile {
  id: string;
  role: string;
  city: string;
  createdAt: string;
}

export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(ACTIVE_KEY);
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(ACTIVE_KEY, id);
  }
  return id;
}

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
  } catch { return []; }
}

export function saveProfile(role: string, city: string) {
  const profiles = getProfiles();
  const existing = profiles.find((p) => p.id === getUserId());
  if (existing) { existing.role = role; existing.city = city; }
  else { profiles.push({ id: getUserId(), role, city, createdAt: new Date().toISOString() }); }
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function switchProfile(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
  window.location.href = "/dashboard";
}

// 用户名
export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("offerpilot_user_name") || "";
}
export function setUserName(name: string) {
  localStorage.setItem("offerpilot_user_name", name);
}

export function createNewProfile(): string {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(ACTIVE_KEY, id);
  const profiles = getProfiles();
  profiles.push({ id, role: "", city: "", createdAt: new Date().toISOString() });
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  return id;
}
