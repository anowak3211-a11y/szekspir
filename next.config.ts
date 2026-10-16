import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ffmpeg-static'],
  outputFileTracingIncludes: {'/api/**/*': ['./node_modules/ffmpeg-static/ffmpeg','./docs/antki/kompendium-uk-us-ads.md','./docs/antki/zasady-lokalizacji-us-uk.md']},
};

export default nextConfig;
