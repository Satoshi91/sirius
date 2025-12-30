# Vercel環境変数設定方法

## 方法1: Vercel CLIを使用（推奨）

### 個別に設定する場合

各環境変数を個別に設定する場合：

```bash
# Production環境に設定
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production

# Preview環境に設定
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview

# Development環境に設定
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY development

# すべての環境に設定
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

### 一括設定スクリプトを使用

`.env.local`から自動的に環境変数を読み込んで設定するスクリプトを用意しました：

**Windows (PowerShell):**
```powershell
.\scripts\set-vercel-env.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x scripts/set-vercel-env.sh
./scripts/set-vercel-env.sh
```

## 方法2: Vercelダッシュボードから設定

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクトを選択
3. **Settings** > **Environment Variables** に移動
4. 以下の環境変数を追加：

### 必須環境変数

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sirius-cf574.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sirius-cf574
FIREBASE_PROJECT_ID=sirius-cf574
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sirius-cf574.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+wmfhXCkyeTSj\njiM7NSOBPUeiiC8QuZRrWpxpzgnLZjqKK85qSxAuWgwOmKQojyphm9kaJdojodPs\n62edr4mZ9nr39tsHeEej1dwYV9gm85p0EcXDcgIH0rV05H/HXCY2S2XVe87lLVZl\nQ1P2bqrPU/mwWAlMpziJTst8VHqv6JkYNRwFRj+3i8lEwXcLAS3c1gLE/PVuGktT\n9aVF2HijSiWNKSF3SSnsL6nv/XlgoN3evuL4XfzeDQy/IGJdq8Z7394Bz0Vbxd6c\nCmQG9s7/2XuOUIc64Q0OBeA1k9aQd57irgiob0kMOOqAhExkTEyJFYmAL8OV5WCW\nlCytlIvNAgMBAAECggEAIiTk+CMJYrXsNJxD9RyRUtg3osFyfzFgfgi1d4DAIw6U\nyteFdmQiLNHEV7Z9p57cjKUbKoF89qTILJ+EJ+bcH9lM8GZYlREz7YDhiN/sWih/\nTGhD+DRHZcQS463kqzf0xQIg46HqCf5f+Pcgp7ruSvbyedyAKZ7C0Vzvsjziyupt\npB+bPoXQBKpddL2UBfdU/8ApumI/BL5AarofxN+d8/zVfNAG8E18RSeulbn5ZXVo\n9aOOw292o2BHwTR1pqhpse5EfHdiNqMv+7Ey427GUFfHrWZxk7J+n1Vi7TUcaBWD\nRwI9nq/wdpyaOgPtNxzI/ea/f/wHodR3++/WSO21YQKBgQDekJOWrP7237GFL6TT\nPxV/pd3MPn+gejJwxaQtGNKmVplbMpLhgL6NXxw9Zkfx+NEDg/FCq+NIjpL3visf\ngsrk0+N2JtwB5CgwzalaVxCi010VQ8zhqa09Ji3IRXk/s+xQGclH4awtEuePuLrp\nZu6J/ahyCCePU1rv/f/VoSujEQKBgQDbaqen+dB82VQG+XjDA5hswOPoH6LezQKp\nDMX5WVOrZaDnTKnJirPYaOTFZ69fPazRMt2t8EUxDosA1tWIcooENMUVxazbbzSF\nHnTMFmlFhObPbrpFduzmmElZ/tV40Tg1AsIP1VxZqu0wQT3i2jsA+jq/Q6qAqrlG\n6k/rLiYk/QKBgAZGnWLKTgY4GJFg3oz2YmzPCIoR2Rd1WqbDa/W5lXcLShfAPVQO\nhVEHNYylrbGtCnfG6K6wmiAZpRtHSYAB+CarsuZKAjorbNazdesOOXHd8+n9l3Fl\nj3UB9piHHPwm3qsDjyFvw6MhvVXYJ60dMezCMlXE1Ri9iPrrdqNXgBuBAoGAJVHn\nwFdqUcH5W9JU6v6Sj3TjjtjKsBC4sh49EiNSauW3T4AnpOMVoep9duIi3xUzbsWz\nFOG4MxbhJ7xix3mL5hk/qGtd8ljg2v+KKChrsWpgg8m2nxgSRUqDt23zyz/yynl0\nnpLQyWOcQkfmic5KmOj20w9kUcw4BUrXWw4XaNUCgYBZAXEJs9sKYlGM2xBDOFPp\n8DGDC/4MoaFF+lDgvQyx1BIA8dMY66arcU9D/aAhS1BeRoSapBUOyaqNfnAtueX1\nH05UFyJ2qLx1EUBUa3dN1R1V9IYbL9NzsrPes8l7QkoLZmyK3/3GfBcuqP/OqBaR\nW9wOM2T1FylJ59yd0Z7Ldw==\n-----END PRIVATE KEY-----\n"
COOKIE_SIGNATURE_KEY_1=ab3d860ed38194fa5a2c28b391e40d4fd7dfabccedfef731d586c81719c5ee5b
COOKIE_SIGNATURE_KEY_2=eff39895f50f2e48dfd450e124caea3fb308bbacb844d8aa8da020d4653b07ab
```

## 環境変数の確認

設定した環境変数を確認する場合：

```bash
# すべての環境変数を表示
vercel env ls

# 特定の環境変数を表示
vercel env ls NEXT_PUBLIC_FIREBASE_API_KEY
```

## 注意事項

1. **FIREBASE_PRIVATE_KEY**: 改行文字 `\n` を含むため、Vercelで設定する際はそのまま貼り付けてください
2. **COOKIE_SIGNATURE_KEY**: 本番環境では必ずランダムな文字列に変更してください
3. **環境の選択**: Production、Preview、Developmentのどの環境に適用するか選択できます

