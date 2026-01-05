# Firebase認証ドメイン設定ガイド

## 問題: `auth/unauthorized-domain` エラー

Vercelにデプロイした際に、Google認証で以下のエラーが発生する場合があります：

```
Firebase: Error (auth/unauthorized-domain).
```

これは、VercelのデプロイドメインがFirebase Consoleの「認証済みドメイン」リストに追加されていないことが原因です。

## 解決方法

### ステップ1: Vercelのドメインを確認

Vercelのプロジェクトページで、以下のドメインを確認してください：

1. **Vercelが自動生成するドメイン**
   - `your-project-name.vercel.app`
   - `your-project-name-git-main-your-username.vercel.app` (プレビューデプロイ)

2. **カスタムドメイン**（設定している場合）
   - `yourdomain.com`
   - `www.yourdomain.com`

### ステップ2: Firebase Consoleで認証済みドメインを追加

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/
   - プロジェクト「sirius-cf574」を選択

2. **Authenticationに移動**
   - 左メニューから「Authentication」をクリック
   - 「Sign-in method」タブを選択

3. **認証済みドメインを確認・追加**
   - ページ下部の「認証済みドメイン」セクションを展開
   - デフォルトで以下のドメインが登録されています：
     - `localhost`（ローカル開発用）
     - `sirius-cf574.firebaseapp.com`（Firebase Hosting用）

4. **Vercelのドメインを追加**
   - 「ドメインを追加」ボタンをクリック
   - Vercelのドメインを入力（例: `your-project-name.vercel.app`）
   - 「追加」をクリック

5. **すべての環境のドメインを追加**
   - プロダクション: `your-project-name.vercel.app`
   - プレビュー: `your-project-name-git-main-your-username.vercel.app`（必要に応じて）
   - カスタムドメイン: `yourdomain.com`、`www.yourdomain.com`（設定している場合）

### ステップ3: 動作確認

1. Vercelでアプリケーションにアクセス
2. Google認証を試す
3. エラーが解消されているか確認

## よくある質問

### Q: プレビューデプロイのドメインも追加する必要がありますか？

A: プレビューデプロイでGoogle認証を使用する場合は、プレビュードメインも追加する必要があります。ただし、プレビュードメインはブランチごとに異なるため、すべてを追加することは現実的ではありません。

**推奨対応**:

- プロダクションドメインのみ追加（本番環境でのみ認証を使用）
- または、プレビュー環境ではゲストログインのみを使用

### Q: カスタムドメインを設定した場合も追加が必要ですか？

A: はい。カスタムドメイン（例: `yourdomain.com`）を使用する場合、そのドメインも認証済みドメインに追加する必要があります。

### Q: ワイルドカード（`*.vercel.app`）は使用できますか？

A: いいえ。Firebaseの認証済みドメインではワイルドカードは使用できません。個別のドメインを追加する必要があります。

## チェックリスト

- [ ] Vercelのプロダクションドメインを確認
- [ ] Firebase Consoleで認証済みドメインに追加
- [ ] カスタムドメインがある場合は追加
- [ ] 本番環境でGoogle認証が動作することを確認
- [ ] エラーメッセージが表示されなくなったことを確認

## 関連ドキュメント

- `doc/本番運用チェックリスト.md` - デプロイ前のチェックリスト
- `doc/環境変数設定ガイド.md` - 環境変数の設定方法
