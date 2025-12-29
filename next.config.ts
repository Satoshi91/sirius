import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Windowsでのファイルウォッチャーの問題を解決
      config.watchOptions = {
        poll: 1000, // 1秒ごとにポーリング
        aggregateTimeout: 300, // 変更後の待機時間
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/.cursor/**', // デバッグログファイルをウォッチ対象から除外
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
