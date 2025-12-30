import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
    ],
  },
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
    // firebase-adminを外部パッケージとして扱う
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push("firebase-admin");
    } else if (typeof config.externals === "object") {
      config.externals["firebase-admin"] = "commonjs firebase-admin";
    }
    return config;
  },
};

export default nextConfig;
