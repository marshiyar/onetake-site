import { describe, expect, it } from "vitest";
import {
  LATEST_RELEASE_API,
  detectOS,
  fetchLatestRelease,
  formatDate,
  formatSize,
  parseRelease,
  primaryAsset,
  version,
} from "@/lib/release";

const DL = "https://github.com/marshiyar/oneTake/releases/download/build-main-43d4bcf";
const asset = (name: string, size: number) => ({ name, size, browser_download_url: `${DL}/${name}` });

// The real latest release, 19 October 2026.
const LATEST = {
  tag_name: "build-main-43d4bcf",
  name: "MpVFX 2026-10-19 (main 43d4bcf)",
  published_at: "2026-10-19T22:33:50Z",
  html_url: "https://github.com/marshiyar/oneTake/releases/tag/build-main-43d4bcf",
  assets: [
    asset("MpVFX-0.1.0-macos-arm64.dmg", 6079789),
    asset("MpVFX-0.1.0-windows-x64-setup.exe", 37318656),
    asset("mpvfx-windows-x64-43d4bcf.zip", 37625177),
    asset("mpvfx_0.1.0+git202610192051.43d4bcf_amd64.deb", 20784930),
    asset("mpvfx-linux-x64-43d4bcf.tar.gz", 36251532),
    asset("linux-smoke.png", 120000),
    asset("mac-smoke.png", 130000),
    asset("windows-smoke.png", 140000),
  ],
};

describe("parseRelease", () => {
  const r = parseRelease(LATEST);

  it("keeps the release metadata", () => {
    expect(r.tag).toBe("build-main-43d4bcf");
    expect(r.name).toBe("MpVFX 2026-10-19 (main 43d4bcf)");
    expect(r.publishedAt).toBe("2026-10-19T22:33:50Z");
    expect(r.url).toBe(LATEST.html_url);
  });

  it("classifies every downloadable asset by OS, kind and arch", () => {
    expect(r.assets.map(({ name, os, kind, arch, size }) => ({ name, os, kind, arch, size }))).toEqual([
      { name: "MpVFX-0.1.0-macos-arm64.dmg", os: "mac", kind: "Disk image (.dmg)", arch: "Apple silicon", size: 6079789 },
      { name: "MpVFX-0.1.0-windows-x64-setup.exe", os: "windows", kind: "Installer (.exe)", arch: "x64", size: 37318656 },
      { name: "mpvfx-windows-x64-43d4bcf.zip", os: "windows", kind: "Zip, no install", arch: "x64", size: 37625177 },
      { name: "mpvfx_0.1.0+git202610192051.43d4bcf_amd64.deb", os: "linux", kind: "Ubuntu / Debian (.deb)", arch: "x64", size: 20784930 },
      { name: "mpvfx-linux-x64-43d4bcf.tar.gz", os: "linux", kind: "Archive (.tar.gz)", arch: "x64", size: 36251532 },
    ]);
    expect(r.assets[0].url).toBe(`${DL}/MpVFX-0.1.0-macos-arm64.dmg`);
  });

  it("lists the smoke screenshots as ignored instead of dropping them silently", () => {
    expect(r.ignored).toEqual(["linux-smoke.png", "mac-smoke.png", "windows-smoke.png"]);
  });

  it("picks the primary asset per OS", () => {
    expect(primaryAsset(r, "mac")?.name).toBe("MpVFX-0.1.0-macos-arm64.dmg");
    expect(primaryAsset(r, "windows")?.name).toBe("MpVFX-0.1.0-windows-x64-setup.exe");
    expect(primaryAsset(r, "linux")?.name).toBe("mpvfx_0.1.0+git202610192051.43d4bcf_amd64.deb");
  });

  it("rejects JSON that is not a release", () => {
    expect(() => parseRelease(null)).toThrow(/expected an object/);
    expect(() => parseRelease({ tag_name: "x" })).toThrow(/assets/);
  });
});

describe("detectOS", () => {
  it("recognises desktop systems", () => {
    expect(detectOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15", "MacIntel")).toBe("mac");
    expect(detectOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", "Win32")).toBe("windows");
    expect(detectOS("Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0", "Linux x86_64")).toBe("linux");
    expect(detectOS("Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36")).toBe("linux");
  });

  it("returns null for phones and unknown agents", () => {
    expect(detectOS("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", "iPhone")).toBeNull();
    expect(detectOS("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36", "Linux armv8l")).toBeNull();
    expect(detectOS("curl/8.5.0")).toBeNull();
    expect(detectOS("")).toBeNull();
  });
});

describe("formatSize and formatDate", () => {
  it("formats bytes", () => {
    expect(formatSize(6079789)).toBe("5.8 MB");
    expect(formatSize(37318656)).toBe("35.6 MB");
    expect(formatSize(20784930)).toBe("19.8 MB");
    expect(formatSize(2048)).toBe("2.0 KB");
    expect(formatSize(512)).toBe("512 B");
  });

  it("formats the publish date in UTC", () => {
    expect(formatDate("2026-10-19T22:33:50Z")).toBe("19 October 2026");
  });
});

describe("version", () => {
  it("reads the app version from asset names and the build from the tag", () => {
    expect(version(parseRelease(LATEST))).toEqual({ version: "0.1.0", build: "43d4bcf" });
  });

  it("returns nulls when neither is present", () => {
    expect(version(parseRelease({ ...LATEST, tag_name: "nightly", assets: [] }))).toEqual({ version: null, build: null });
  });
});

describe("fetchLatestRelease", () => {
  const fakeFetch = (status: number, body: string): typeof fetch => {
    return async (input) => {
      expect(String(input)).toBe(LATEST_RELEASE_API);
      return new Response(body, { status, headers: { "Content-Type": "application/json" } });
    };
  };

  it("parses a 200 response", async () => {
    const r = await fetchLatestRelease(fakeFetch(200, JSON.stringify(LATEST)));
    expect(r.assets).toHaveLength(5);
    expect(r.tag).toBe("build-main-43d4bcf");
  });

  it("throws a clear error on 403 (rate limit)", async () => {
    await expect(fetchLatestRelease(fakeFetch(403, '{"message":"API rate limit exceeded"}'))).rejects.toThrow("GitHub returned 403 for the latest release.");
  });

  it("throws a clear error on bad JSON", async () => {
    await expect(fetchLatestRelease(fakeFetch(200, "<html>"))).rejects.toThrow(/not valid JSON/);
  });
});
