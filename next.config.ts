import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // i18n/request.ts loads catalogs via a template-literal dynamic import, which
  // Next's file tracing can miss; force them into the standalone bundle.
  outputFileTracingIncludes: {
    "/": ["./messages/*.json"],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
