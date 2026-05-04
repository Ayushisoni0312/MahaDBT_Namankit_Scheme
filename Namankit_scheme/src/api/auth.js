// ============================================================
//  src/api/auth.js
// ============================================================
import { apiFetch } from "./liferay";

export const ROLES = {
  CONTROLLER: "Controller_namankit",
  PO:         "PO_namankit",
  ATC:        "ATC_namankit",
  SCHOOL: "Pre School",
  // SCHOOL:     "School_namankit",
};

// Dev user IDs — only used on localhost
const DEV_USERS = {
  [ROLES.CONTROLLER]: 3073612,
  [ROLES.PO]:         3073517,
  [ROLES.ATC]:        3073547,
  [ROLES.SCHOOL]:     3076723,
};

const IS_DEV = window.location.hostname === "localhost";
const DEV_ROLE_KEY = "namankit_dev_role";

// ── Dev helpers ───────────────────────────────────────────────
export function getDevRole()       { return localStorage.getItem(DEV_ROLE_KEY); }
export function setDevRole(role)   { localStorage.setItem(DEV_ROLE_KEY, role); }
export function clearDevRole()     { localStorage.removeItem(DEV_ROLE_KEY); }

// ── Logout ────────────────────────────────────────────────────
export function logout() {
  if (IS_DEV) {
    clearDevRole();
    window.location.reload();
  } else {
    window.location.href = "/c/portal/logout";
  }
}

// ── Get user ID ───────────────────────────────────────────────
function getLiferayUserId() {
  return window.Liferay?.ThemeDisplay?.getUserId() || null;
}

// ── Main: get current user's Namankit role ───────────────────
export async function getUserRole() {
  // ── DEV MODE (localhost) ──
  if (IS_DEV) {
    const devRole = getDevRole();
    if (!devRole) return null; // show dev login screen
    console.log("[auth] DEV role:", devRole);
    return devRole;
  }

  // ── PRODUCTION (Liferay) ──
  const userId = getLiferayUserId();
  if (!userId) {
    console.warn("[auth] No Liferay user ID found");
    return null;
  }

  const userData = await apiFetch(
    `/o/headless-admin-user/v1.0/user-accounts/${userId}`
  );
  const roles = userData?.roleBriefs || [];

  console.log("[auth] userId:", userId);
  console.log("[auth] roles:", roles.map((r) => r.name));

  if (roles.some((r) => r.name === ROLES.CONTROLLER)) return ROLES.CONTROLLER;
  if (roles.some((r) => r.name === ROLES.PO))         return ROLES.PO;
  if (roles.some((r) => r.name === ROLES.ATC))        return ROLES.ATC;
  if (roles.some((r) => r.name === ROLES.SCHOOL))     return ROLES.SCHOOL;

  console.warn("[auth] No Namankit role found for userId:", userId);
  return null;
}

