// oneTake builds on GitHub Releases: fetch them, sort them into official releases and nightly builds, keep only what a person
// can download, and say what each file is.
import { REPO } from "./site";

export type OS = "mac" | "windows" | "linux";

export type AssetKind = "Disk image (.dmg)" | "Installer (.exe)" | "Zip, no install" | "Ubuntu / Debian (.deb)" | "Archive (.tar.gz)";

export interface ReleaseAsset {
  name: string;
  size: number;
  url: string;
  os: OS;
  kind: AssetKind;
  arch: string;
}

/** Official: a tested, numbered release (tag v1.2.3, not a prerelease). Nightly: a development build from main. */
export type Channel = "official" | "nightly";

export interface Release {
  tag: string;
  prerelease: boolean;
  /** Null for a release that is neither official nor nightly; such releases are never offered. */
  channel: Channel | null;
  name: string;
  publishedAt: string;
  url: string;
  assets: ReleaseAsset[];
  /** Files attached to the release that are not downloads (screenshots, unknown names). Kept so nothing is dropped silently. */
  ignored: string[];
}

export const RELEASES_API = `https://api.github.com/repos/${REPO}/releases?per_page=30`;

export const OS_LABEL: Record<OS, string> = { mac: "macOS", windows: "Windows", linux: "Linux" };

interface Rule {
  test: RegExp;
  os: OS;
  kind: AssetKind;
  arch: string;
}

const RULES: Rule[] = [
  { test: /-macos-arm64\.dmg$/i, os: "mac", kind: "Disk image (.dmg)", arch: "Apple silicon" },
  { test: /-setup\.exe$/i, os: "windows", kind: "Installer (.exe)", arch: "x64" },
  { test: /-windows-x64-[^/]*\.zip$/i, os: "windows", kind: "Zip, no install", arch: "x64" },
  { test: /\.deb$/i, os: "linux", kind: "Ubuntu / Debian (.deb)", arch: "x64" },
  { test: /-linux-x64-[^/]*\.tar\.gz$/i, os: "linux", kind: "Archive (.tar.gz)", arch: "x64" },
];

/** The asset each OS's primary button points at. */
const PRIMARY_KIND: Record<OS, AssetKind> = { mac: "Disk image (.dmg)", windows: "Installer (.exe)", linux: "Ubuntu / Debian (.deb)" };

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

/** Which channel a release belongs to, from its tag and prerelease flag. */
export function channelOf(release: Pick<Release, "tag" | "prerelease">): Channel | null {
  if (/^v\d+\.\d+\.\d+/.test(release.tag)) return release.prerelease ? null : "official";
  // build-main-<sha7> is the older name for a development build from main.
  if (release.tag.startsWith("nightly-") || release.tag.startsWith("build-main-")) return "nightly";
  return null;
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

  const tag = str(json, "tag_name");
  const prerelease = json.prerelease === true;
  return {
    tag,
    prerelease,
    channel: channelOf({ tag, prerelease }),
    name: typeof json.name === "string" && json.name !== "" ? json.name : tag,
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

/**
 * Version and build for the summary line. Official: the version is the tag without "v" ("v0.2.0" → "0.2.0"), no build.
 * Nightly and anything else: the version from the asset names ("0.1.0") and the build from the tag ("43d4bcf"). Null when absent.
 */
export function version(release: Release): { version: string | null; build: string | null } {
  if (release.channel === "official") return { version: release.tag.replace(/^v/, ""), build: null };
  let v: string | null = null;
  for (const a of release.assets) {
    const m = /[-_](\d+\.\d+\.\d+)(?=[-_+])/.exec(a.name);
    if (m) {
      v = m[1];
      break;
    }
  }
  const b = /-([0-9a-f]{7,40})$/i.exec(release.tag);
  return { version: v, build: b ? b[1] : null };
}

/** The newest 30 releases, newest first as GitHub returns them. Drafts are skipped. */
export async function fetchReleases(fetchImpl: typeof fetch = fetch): Promise<Release[]> {
  const res = await fetchImpl(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub returned ${res.status} for the list of releases.`);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("GitHub returned a list of releases that is not valid JSON.");
  }
  if (!Array.isArray(json)) throw new Error("GitHub returned something other than a list of releases.");
  return json.filter((r) => !(isRecord(r) && r.draft === true)).map(parseRelease);
}

export interface Channels {
  official: Release | null;
  nightly: Release | null;
}

function newer(a: Release, b: Release): boolean {
  const ta = Date.parse(a.publishedAt);
  const tb = Date.parse(b.publishedAt);
  return (Number.isNaN(ta) ? -Infinity : ta) > (Number.isNaN(tb) ? -Infinity : tb);
}

/** The newest official release and the newest nightly build, by publish date. Either is null when there is none. */
export function pickChannels(list: Release[]): Channels {
  const out: Channels = { official: null, nightly: null };
  for (const r of list) {
    if (!r.channel) continue;
    const current = out[r.channel];
    if (!current || newer(r, current)) out[r.channel] = r;
  }
  return out;
}

let shared: Promise<Channels> | null = null;

/** One request per page load, shared by every component that shows release data. */
export function loadChannels(): Promise<Channels> {
  if (!shared) shared = fetchReleases((input, init) => fetch(input, init)).then(pickChannels);
  return shared;
}
