import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer and @kenjiuno/msgreader should stay external
  // to avoid bundling issues in the Node serverless runtime.
  serverExternalPackages: ["@react-pdf/renderer", "@kenjiuno/msgreader"],
  api: {
    // Allow uploads up to 60MB (Pro max is 50MB + form overhead)
    bodyParser: {
      sizeLimit: "60mb",
    },
  },
  experimental: {
    // Allow larger uploads for MVP (multiple 20 MB files).
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
