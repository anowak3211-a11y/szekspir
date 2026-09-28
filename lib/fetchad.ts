import {safeDownload} from "./safe-fetch";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const MAX_BYTES = 24 * 1024 * 1024; // Whisper hard limit is 25MB

async function download(url: string, filename: string): Promise<File> {
  const {buffer: buf} = await safeDownload(url, MAX_BYTES);
  if (buf.byteLength > MAX_BYTES) {
    throw new Error(
      `Video is ${(buf.byteLength / 1024 / 1024).toFixed(0)}MB — over the 25MB transcription limit. Download it manually and drop the file into SZEKSPIR (browser extracts the audio).`
    );
  }
  if (buf.byteLength < 10_000) throw new Error("Downloaded file is too small — link probably didn't point at a video.");
  return new File([new Uint8Array(buf)], filename, { type: "video/mp4" });
}

function unescapeJson(s: string): string {
  try {
    return JSON.parse(`"${s}"`);
  } catch {
    return s.replace(/\\\//g, "/").replace(/\\u0025/g, "%");
  }
}

// Accepts: direct video links, and public ad-library pages
// (Facebook Ad Library and similar) whose HTML embeds a video URL.
export async function fetchAdVideo(
  url: string
): Promise<{ file: File; videoUrl: string }> {
  if (/\.(mp4|mov|webm|mp3|m4a|wav)(\?|#|$)/i.test(url)) {
    return {
      file: await download(
        url,
        "ad" + (url.match(/\.\w+(?=\?|#|$)/)?.[0] || ".mp4")
      ),
      videoUrl: url,
    };
  }

  const html = (await safeDownload(url, 4 * 1024 * 1024)).buffer.toString("utf8");

  const patterns = [
    /"video_hd_url"\s*:\s*"([^"]+)"/,
    /"video_sd_url"\s*:\s*"([^"]+)"/,
    /"playable_url_quality_hd"\s*:\s*"([^"]+)"/,
    /"playable_url"\s*:\s*"([^"]+)"/,
    /<meta[^>]+property="og:video(?::secure_url)?"[^>]+content="([^"]+)"/,
    /<video[^>]+src="([^"]+)"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) {
      const videoUrl = unescapeJson(m[1]).replace(/&amp;/g, "&");
      if (videoUrl.startsWith("http")) {
        return { file: await download(videoUrl, "ad.mp4"), videoUrl };
      }
    }
  }
  throw new Error(
    "No video found at this link. The page may require login or render the video with JavaScript — download the video manually and drop the file here instead."
  );
}
