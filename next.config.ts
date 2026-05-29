import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/fit-alliance',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/fit-alliance',
  },
};

export default nextConfig;
