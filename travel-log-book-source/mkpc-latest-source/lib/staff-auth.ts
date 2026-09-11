export type StaffAccount = {
  username: string;
  password: string;
  displayName: string;
};

export type StaffSession = {
  username: string;
  displayName: string;
  loggedInAt: string;
};

const SESSION_KEY = "mkpc-staff-session";
const ACCOUNTS_KEY = "mkpc-staff-accounts";

export const DEFAULT_STAFF_ACCOUNTS: StaffAccount[] = [
  { username: "teacher", password: "mkpc2026", displayName: "老師" },
  { username: "admin", password: "mkpc2026", displayName: "校務處" },
];

export function listStaffAccounts(): StaffAccount[] {
  if (typeof window === "undefined") return DEFAULT_STAFF_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return DEFAULT_STAFF_ACCOUNTS.map((item) => ({ ...item }));
    const parsed = JSON.parse(raw) as StaffAccount[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_STAFF_ACCOUNTS.map((item) => ({ ...item }));
    }
    return parsed.filter((item) => item.username && item.password);
  } catch {
    return DEFAULT_STAFF_ACCOUNTS.map((item) => ({ ...item }));
  }
}

export function saveStaffAccounts(accounts: StaffAccount[]) {
  if (accounts.length === 0) {
    throw new Error("至少要保留一個教職員帳號");
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function addStaffAccount(account: StaffAccount) {
  const username = account.username.trim().toLowerCase();
  const displayName = account.displayName.trim() || account.username.trim();
  const password = account.password;
  if (!username || !password) {
    throw new Error("請填帳號同密碼");
  }
  if (password.length < 6) {
    throw new Error("密碼至少 6 個字");
  }
  const accounts = listStaffAccounts();
  if (accounts.some((item) => item.username.toLowerCase() === username)) {
    throw new Error("呢個帳號已經存在");
  }
  saveStaffAccounts([...accounts, { username, password, displayName }]);
}

export function updateStaffAccount(username: string, partial: Partial<StaffAccount>) {
  const accounts = listStaffAccounts();
  const index = accounts.findIndex((item) => item.username.toLowerCase() === username.toLowerCase());
  if (index === -1) throw new Error("找不到呢個帳號");
  if (partial.password && partial.password.length < 6) {
    throw new Error("密碼至少 6 個字");
  }
  accounts[index] = {
    ...accounts[index],
    ...partial,
    username: accounts[index].username,
    displayName: (partial.displayName ?? accounts[index].displayName).trim() || accounts[index].username,
  };
  saveStaffAccounts(accounts);
}

export function deleteStaffAccount(username: string) {
  const next = listStaffAccounts().filter((item) => item.username.toLowerCase() !== username.toLowerCase());
  saveStaffAccounts(next);
}

export function exportStaffAccounts(): string {
  return `${JSON.stringify({ kind: "mkpc-staff-accounts", version: 1, accounts: listStaffAccounts() }, null, 2)}\n`;
}

export function importStaffAccounts(raw: unknown) {
  const data = raw as { accounts?: StaffAccount[]; kind?: string };
  const accounts = Array.isArray(data) ? data : data.accounts;
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("檔案沒有帳號");
  }
  saveStaffAccounts(
    accounts.map((item) => ({
      username: String(item.username || "").trim().toLowerCase(),
      password: String(item.password || ""),
      displayName: String(item.displayName || item.username || "").trim(),
    })).filter((item) => item.username && item.password)
  );
}

export function getStaffSession(): StaffSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaffSession;
    if (!parsed.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function loginStaff(username: string, password: string): StaffSession {
  const account = listStaffAccounts().find(
    (item) =>
      item.username.toLowerCase() === username.trim().toLowerCase() &&
      item.password === password
  );
  if (!account) {
    throw new Error("帳號或密碼不正確");
  }
  const session: StaffSession = {
    username: account.username,
    displayName: account.displayName,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutStaff() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isStaffLoggedIn(): boolean {
  return Boolean(getStaffSession());
}
