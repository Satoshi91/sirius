# Vercel環境変数設定ガイド

Vercelにデプロイする際に設定する必要がある環境変数のリストです。
Vercelのプロジェクト設定 > Environment Variables から設定してください。

## 必須環境変数

### Firebase Client Configuration

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sirius-cf574.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sirius-cf574
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sirius-cf574.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=753671151982
NEXT_PUBLIC_FIREBASE_APP_ID=1:753671151982:web:457a1dd3d208b39b1ca17f
```

### Firebase Service Account (サーバー側のみ)

Firebase Console > プロジェクト設定 > サービスアカウント から取得してください。

```
FIREBASE_PROJECT_ID=sirius-cf574
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sirius-cf574.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**注意**: `FIREBASE_PRIVATE_KEY` は改行文字 `\n` を含むため、Vercelで設定する際はそのまま貼り付けてください。

### ゲストログイン用パスワード（開発環境・Preview環境のみ）

```
NEXT_PUBLIC_GUEST_PASSWORD=your-guest-password-here
```

**注意**: 開発環境・Preview環境でのみ使用。Firebase Consoleで作成したゲストユーザー（s.t.n.uytrewq+guest@gmail.com）のパスワードと同じ値に設定してください。

### Cookie署名キー

認証Cookieの署名に使用します。ランダムな文字列（32文字以上推奨）を設定してください。

```
COOKIE_SIGNATURE_KEY_1=your-random-signature-key-1-min-32-chars
COOKIE_SIGNATURE_KEY_2=your-random-signature-key-2-min-32-chars
```

## コピー&ペースト用（.env.local形式）

以下の内容を `.env.local` にコピーして、実際の値に置き換えてください：

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sirius-cf574.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sirius-cf574
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sirius-cf574.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=753671151982
NEXT_PUBLIC_FIREBASE_APP_ID=1:753671151982:web:457a1dd3d208b39b1ca17f
FIREBASE_PROJECT_ID=sirius-cf574
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sirius-cf574.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
COOKIE_SIGNATURE_KEY_1=your-random-signature-key-1-min-32-chars
COOKIE_SIGNATURE_KEY_2=your-random-signature-key-2-min-32-chars
```

## 設定方法

1. Vercelのダッシュボードにログイン
2. プロジェクトを選択
3. Settings > Environment Variables に移動
4. 上記の環境変数を追加
5. 各環境（Production, Preview, Development）に適用するか選択
6. 保存後、再デプロイ
