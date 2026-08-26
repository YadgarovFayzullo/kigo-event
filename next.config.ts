import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Standalone output keeps the Docker image small (see Dockerfile).
  output: "standalone",
  // This app stores nothing: every page is rendered per request against the
  // KiGo API using the signed-in operator's token, so nothing is prerendered.
  poweredByHeader: false,
}

export default nextConfig
