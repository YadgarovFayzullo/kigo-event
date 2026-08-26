import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /**
   * `standalone` produces the self-contained server the Dockerfile copies.
   *
   * Vercel builds its own output and its post-build step expects the trace
   * files that standalone mode replaces, so setting it there fails the build
   * with a missing `next-server.js.nft.json`. `VERCEL` is set on their
   * builders, so this keeps one config working for both targets.
   */
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
}

export default nextConfig
