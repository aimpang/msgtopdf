import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer and @kenjiuno/msgreader should stay external
  // to avoid bundling issues in the Node serverless runtime.
  serverExternalPackages: ["@react-pdf/renderer", "@kenjiuno/msgreader"],
  experimental: {
    // Allow larger uploads for MVP (multiple 20 MB files).
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
