import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Windowsでのファイルウォッチャーの問題を解決
      config.watchOptions = {
        poll: 1000, // 1秒ごとにポーリング
        aggregateTimeout: 300, // 変更後の待機時間
      };
    }
    return config;
  },
};

export default nextConfig;
