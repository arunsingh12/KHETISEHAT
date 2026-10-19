import type { NextConfig } from "next";

// `npm run build:cpanel` sets this — a self-contained bundle for cPanel's
// "Setup Node.js App" (see docs/deploy-cpanel.md). Normal builds (local,
// Netlify) are unaffected.
const forCpanel = process.env.BUILD_TARGET === "cpanel";

const nextConfig: NextConfig = {
  ...(forCpanel
    ? {
        output: "standalone",
        // Trace from this folder, not a parent that happens to have a lockfile.
        outputFileTracingRoot: process.cwd(),
        // Prisma's Linux query engines aren't picked up by static tracing.
        outputFileTracingIncludes: {
          "/*": ["src/generated/prisma/libquery_engine-rhel-*.so.node"],
        },
        // The bundled `sharp` is built for the machine running the build,
        // not the Linux server, so serve images as-is.
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
