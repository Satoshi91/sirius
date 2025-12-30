#!/bin/bash
# Vercel環境変数設定スクリプト (Bash版)
# .env.localから環境変数を読み込んでVercelに設定します

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "エラー: $ENV_FILE が見つかりません"
    exit 1
fi

echo ".env.localから環境変数を読み込んでいます..."

# 環境を選択
echo ""
echo "環境を選択してください:"
echo "  1. Production"
echo "  2. Preview"
echo "  3. Development"
echo "  4. すべての環境"
read -p "選択 (1-4): " choice

case $choice in
    1) environments=("production") ;;
    2) environments=("preview") ;;
    3) environments=("development") ;;
    4) environments=("production" "preview" "development") ;;
    *)
        echo "無効な選択です"
        exit 1
        ;;
esac

echo ""
echo "Vercelに環境変数を設定します..."
echo "注意: 各環境変数について、値を入力するかEnterキーで現在の値をそのまま使用します"
echo ""

# .env.localを読み込んで環境変数を設定
while IFS='=' read -r key value || [ -n "$key" ]; do
    # コメント行と空行をスキップ
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$key" ]] && continue
    
    # 前後の空白を削除
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # 引用符を削除
    value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/')
    
    echo "[$key]"
    
    for env in "${environments[@]}"; do
        echo "  → $env に設定中..."
        echo "$value" | vercel env add "$key" "$env" --force
    done
    
    echo ""
done < "$ENV_FILE"

echo "完了しました！"

