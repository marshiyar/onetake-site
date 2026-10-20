// The latest oneTake build on GitHub Releases: fetch it, keep only what a person can download, and say what each file is.
import { REPO } from "./site";

export type OS = "mac" | "windows" | "linux";

export type AssetKind = "Disk image" | "Installer" | "Portable zip" | "Debian/Ubuntu package" | "Tarball";

export interface ReleaseAsset {
  name: string;
  size: number;
  url: string;
  os: OS;
  kind: AssetKind;
  arch: string;
}

export interface Release {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
  assets: ReleaseAsset[];
  /** Files attached to the release that are not downloads (screenshots, unknown names). Kept so nothing is dropped silently. */
  ignored: string[];
}

export const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;

export const OS_LABEL: Record<OS, string> = { mac: "macOS", windows: "Windows", linux: "Linux" };

interface Rule {
  test: RegExp;
  os: OS;
  kind: AssetKind;
  arch: string;
}

const RULES: Rule[] = [
  { test: /-macos-arm64\.dmg$/i, os: "mac", kind: "Disk image", arch: "Apple silicon" },
  { test: /-setup\.exe$/i, os: "windows", kind: "Installer", arch: "x64" },
  { test: /-windows-x64-[^/]*\.zip$/i, os: "windows", kind: "Portable zip", arch: "x64" },
  { test: /\.deb$/i, os: "linux", kind: "Debian/Ubuntu package", arch: "x64" },
  { test: /-linux-x64-[^/]*\.tar\.gz$/i, os: "linux", kind: "Tarball", arch: "x64" },
];

/** The asset each OS's primary button points at. */
const PRIMARY_KIND: Record<OS, AssetKind> = { mac: "Disk image", windows: "Installer", linux: "Debian/Ubuntu package" };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v !== "string") throw new Error(`Release JSON: "${key}" is missing or not a string.`);
  return v;
}

export function classifyAsset(name: string): Omit<ReleaseAsset, "name" | "size" | "url"> | null {
  const rule = RULES.find((r) => r.test.test(name));
  return rule ? { os: rule.os, kind: rule.kind, arch: rule.arch } : null;
}

export function parseRelease(json: unknown): Release {
  if (!isRecord(json)) throw new Error("Release JSON: expected an object.");
  const rawAssets = json.assets;
  if (!Array.isArray(rawAssets)) throw new Error('Release JSON: "assets" is missing or not a list.');

  const assets: ReleaseAsset[] = [];
  const ignored: string[] = [];
  for (const raw of rawAssets) {
    if (!isRecord(raw)) throw new Error("Release JSON: an asset is not an object.");
    const name = str(raw, "name");
    const cls = classifyAsset(name);
    if (!cls) {
      ignored.push(name);
      continue;
    }
    const size = raw.size;
    if (typeof size !== "number" || !Number.isFinite(size)) throw new Error(`Release JSON: asset "${name}" has no size.`);
    assets.push({ name, size, url: str(raw, "browser_download_url"), ...cls });
  }

  return {
    tag: str(json, "tag_name"),
    name: typeof json.name === "string" ? json.name : str(json, "tag_name"),
    publishedAt: str(json, "published_at"),
    url: str(json, "html_url"),
    assets,
    ignored,
  };
}

export function assetsFor(release: Release, os: OS): ReleaseAsset[] {
  return release.assets.filter((a) => a.os === os);
}

export function primaryAsset(release: Release, os: OS): ReleaseAsset | null {
  return release.assets.find((a) => a.os === os && a.kind === PRIMARY_KIND[os]) ?? null;
}

/** The desktop OS from a user agent; null for phones, tablets, ChromeOS and anything unrecognised. Never a guess. */
export function detectOS(userAgent: string, platform?: string): OS | null {
  const ua = userAgent.toLowerCase();
  const pf = (platform ?? "").toLowerCase();
  if (/iphone|ipad|ipod|android|mobile|cros/.test(ua)) return null;
  if (/iphone|ipad|ipod|android/.test(pf)) return null;
  if (ua.includes("windows") || pf.startsWith("win")) return "windows";
  if (ua.includes("macintosh") || ua.includes("mac os x") || pf.startsWith("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11") || pf.startsWith("linux")) return "linux";
  return null;
}

/** Binary units, labelled the way people read them: 6079789 → "5.8 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}

/** "19 October 2026", in UTC so the date does not move with the reader's time zone. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

/** App version from the asset names ("0.1.0") and the build from the tag ("43d4bcf"). Either is null when absent. */
export function version(release: Release): { version: string | null; build: string | null } {
  let v: string | null = null;
  for (const a of release.assets) {
    const m = /[-_](\d+\.\d+\.\d+)(?=[-_+])/.exec(a.name);
    if (m) {
      v = m[1];
      break;
    }
  }
  const b = /([0-9a-f]{7,40})$/i.exec(release.tag);
  return { version: v, build: b ? b[1] : null };
}

export async function fetchLatestRelease(fetchImpl: typeof fetch = fetch): Promise<Release> {
  const res = await fetchImpl(LATEST_RELEASE_API, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub returned ${res.status} for the latest release.`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("GitHub returned a latest release that is not valid JSON.");
  }
  return parseRelease(json);
}

let shared: Promise<Release> | null = null;

/** One request per page load, shared by every component that shows release data. */
export function loadLatestRelease(): Promise<Release> {
  if (!shared) shared = fetchLatestRelease((input, init) => fetch(input, init));
  return shared;
}
