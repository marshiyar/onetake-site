import { describe, expect, it } from "vitest";
import {
  RELEASES_API,
  channelOf,
  detectOS,
  fetchReleases,
  formatDate,
  formatSize,
  parseRelease,
  pickChannels,
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
  prerelease: false,
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
    expect(r.prerelease).toBe(false);
    expect(r.channel).toBe("nightly");
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

describe("channelOf", () => {
  it("treats a full v1.2.3 release as official", () => {
    expect(channelOf({ tag: "v0.2.0", prerelease: false })).toBe("official");
  });

  it("ignores a v1.2.3 tag marked as a prerelease", () => {
    expect(channelOf({ tag: "v0.2.0", prerelease: true })).toBeNull();
  });

  it("treats nightly-<sha> and the older build-main-<sha> as nightly", () => {
    expect(channelOf({ tag: "nightly-abc1234", prerelease: true })).toBe("nightly");
    expect(channelOf({ tag: "build-main-43d4bcf", prerelease: false })).toBe("nightly");
  });

  it("returns null for any other tag", () => {
    expect(channelOf({ tag: "random", prerelease: false })).toBeNull();
    expect(channelOf({ tag: "release-0.2.0", prerelease: false })).toBeNull();
  });
});

const rel = (tag: string, published_at: string, prerelease: boolean) =>
  parseRelease({ ...LATEST, tag_name: tag, name: tag, published_at, prerelease });

describe("pickChannels", () => {
  it("picks the newest release of each channel by publish date", () => {
    const list = [
      rel("nightly-aaaaaaa", "2026-10-20T03:00:00Z", true),
      rel("v0.2.0", "2026-10-18T10:00:00Z", false),
      rel("build-main-43d4bcf", "2026-10-19T22:33:50Z", false),
      rel("v0.2.1", "2026-10-19T10:00:00Z", false),
      rel("v0.3.0-rc1", "2026-10-20T10:00:00Z", true),
      rel("random", "2026-10-21T10:00:00Z", false),
    ];
    const c = pickChannels(list);
    expect(c.official?.tag).toBe("v0.2.1");
    expect(c.nightly?.tag).toBe("nightly-aaaaaaa");
  });

  it("returns null for official when only development builds exist (today)", () => {
    const c = pickChannels([parseRelease(LATEST)]);
    expect(c.official).toBeNull();
    expect(c.nightly?.tag).toBe("build-main-43d4bcf");
  });

  it("returns nulls for an empty list", () => {
    expect(pickChannels([])).toEqual({ official: null, nightly: null });
  });
});

describe("version by channel", () => {
  it("uses the tag without v for an official release", () => {
    expect(version(rel("v0.2.0", "2026-10-18T10:00:00Z", false))).toEqual({ version: "0.2.0", build: null });
  });

  it("uses the asset names and the tag sha for a nightly", () => {
    expect(version(rel("nightly-abc1234", "2026-10-20T03:00:00Z", true))).toEqual({ version: "0.1.0", build: "abc1234" });
  });
});

describe("fetchReleases", () => {
  const fakeFetch = (status: number, body: string): typeof fetch => {
    return async (input) => {
      expect(String(input)).toBe(RELEASES_API);
      return new Response(body, { status, headers: { "Content-Type": "application/json" } });
    };
  };

  it("asks for 30 releases", () => {
    expect(RELEASES_API).toBe("https://api.github.com/repos/marshiyar/oneTake/releases?per_page=30");
  });

  it("parses a 200 response and skips drafts", async () => {
    const draft = { ...LATEST, tag_name: "v9.9.9", draft: true, published_at: null };
    const list = await fetchReleases(fakeFetch(200, JSON.stringify([LATEST, draft])));
    expect(list).toHaveLength(1);
    expect(list[0].assets).toHaveLength(5);
    expect(list[0].tag).toBe("build-main-43d4bcf");
    expect(list[0].channel).toBe("nightly");
  });

  it("throws a clear error on 403 (rate limit)", async () => {
    await expect(fetchReleases(fakeFetch(403, '{"message":"API rate limit exceeded"}'))).rejects.toThrow(
      "GitHub returned 403 for the list of releases.",
    );
  });

  it("throws a clear error on bad JSON", async () => {
    await expect(fetchReleases(fakeFetch(200, "<html>"))).rejects.toThrow(/not valid JSON/);
  });

  it("throws a clear error when the JSON is not a list", async () => {
    await expect(fetchReleases(fakeFetch(200, JSON.stringify(LATEST)))).rejects.toThrow(/not a list|other than a list/);
  });
});
