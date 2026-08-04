import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    // Pin workspace root to this repo — avoids picking up ~/package-lock.json
    root: path.resolve(__dirname),
  },
};

export default withNextIntl(nextConfig);
