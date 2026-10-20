// Facts the pages share. Keep them true to the app's README and docs/STATUS.md.
export const REPO = "marshiyar/oneTake";
export const REPO_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE_PATH}${path}`;

/**
 * First-launch steps shown under a download column while that build is not code-signed.
 * Shown in mono uppercase. Remove an entry once the matching build is signed.
 */
export const UNSIGNED_NOTES: Readonly<Partial<Record<"mac" | "windows" | "linux", string>>> = {
  mac: "First open: System Settings › Privacy & Security › Open Anyway",
  windows: "If Windows warns: More info › Run anyway",
};
