import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ffmpeg-static'],
  outputFileTracingIncludes: {'/api/**/*': ['./node_modules/ffmpeg-static/ffmpeg','./docs/antki/kompendium-uk-us-ads.md','./docs/antki/zasady-lokalizacji-us-uk.md','./docs/antki/copywriting-uk-2026-10-17.md','./docs/antki/rewrite-uk-v2.md']},
};

export default nextConfig;
