# Vercel環境変数設定コマンド

`.env.local`の内容から、Vercel CLIで環境変数を設定するコマンドです。
以下のコマンドをコピー&ペーストして実行してください。

**重要**: `echo`コマンドは改行文字を追加する可能性があるため、以下の方法を使用してください。

## すべての環境に設定する場合

```powershell
# 改行文字を確実に削除するため、Write-Output -NoEnumerate を使用
# または、一時ファイルを使用する方法（推奨）

# NEXT_PUBLIC_FIREBASE_API_KEY
$value = "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg"; $value | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
$value = "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg"; $value | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY preview
$value = "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg"; $value | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY development

# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
$value = "sirius-cf574.firebaseapp.com"; $value | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
$value = "sirius-cf574.firebaseapp.com"; $value | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN preview
$value = "sirius-cf574.firebaseapp.com"; $value | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN development

# NEXT_PUBLIC_FIREBASE_PROJECT_ID
$value = "sirius-cf574"; $value | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
$value = "sirius-cf574"; $value | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID preview
$value = "sirius-cf574"; $value | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID development

# FIREBASE_PROJECT_ID
$value = "sirius-cf574"; $value | vercel env add FIREBASE_PROJECT_ID production
$value = "sirius-cf574"; $value | vercel env add FIREBASE_PROJECT_ID preview
$value = "sirius-cf574"; $value | vercel env add FIREBASE_PROJECT_ID development

# FIREBASE_CLIENT_EMAIL
$value = "firebase-adminsdk-fbsvc@sirius-cf574.iam.gserviceaccount.com"; $value | vercel env add FIREBASE_CLIENT_EMAIL production
$value = "firebase-adminsdk-fbsvc@sirius-cf574.iam.gserviceaccount.com"; $value | vercel env add FIREBASE_CLIENT_EMAIL preview
$value = "firebase-adminsdk-fbsvc@sirius-cf574.iam.gserviceaccount.com"; $value | vercel env add FIREBASE_CLIENT_EMAIL development

# FIREBASE_PRIVATE_KEY (長い値のため、PowerShellのヒアストリングを使用)
$privateKey = @"
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+wmfhXCkyeTSj
jiM7NSOBPUeiiC8QuZRrWpxpzgnLZjqKK85qSxAuWgwOmKQojyphm9kaJdojodPs
62edr4mZ9nr39tsHeEej1dwYV9gm85p0EcXDcgIH0rV05H/HXCY2S2XVe87lLVZl
Q1P2bqrPU/mwWAlMpziJTst8VHqv6JkYNRwFRj+3i8lEwXcLAS3c1gLE/PVuGktT
9aVF2HijSiWNKSF3SSnsL6nv/XlgoN3evuL4XfzeDQy/IGJdq8Z7394Bz0Vbxd6c
CmQG9s7/2XuOUIc64Q0OBeA1k9aQd57irgiob0kMOOqAhExkTEyJFYmAL8OV5WCW
lCytlIvNAgMBAAECggEAIiTk+CMJYrXsNJxD9RyRUtg3osFyfzFgfgi1d4DAIw6U
yteFdmQiLNHEV7Z9p57cjKUbKoF89qTILJ+EJ+bcH9lM8GZYlREz7YDhiN/sWih/
TGhD+DRHZcQS463kqzf0xQIg46HqCf5f+Pcgp7ruSvbyedyAKZ7C0Vzvsjziyupt
pB+bPoXQBKpddL2UBfdU/8ApumI/BL5AarofxN+d8/zVfNAG8E18RSeulbn5ZXVo
9aOOw292o2BHwTR1pqhpse5EfHdiNqMv+7Ey427GUFfHrWZxk7J+n1Vi7TUcaBWD
RwI9nq/wdpyaOgPtNxzI/ea/f/wHodR3++/WSO21YQKBgQDekJOWrP7237GFL6TT
PxV/pd3MPn+gejJwxaQtGNKmVplbMpLhgL6NXxw9Zkfx+NEDg/FCq+NIjpL3visf
gsrk0+N2JtwB5CgwzalaVxCi010VQ8zhqa09Ji3IRXk/s+xQGclH4awtEuePuLrp
Zu6J/ahyCCePU1rv/f/VoSujEQKBgQDbaqen+dB82VQG+XjDA5hswOPoH6LezQKp
DMX5WVOrZaDnTKnJirPYaOTFZ69fPazRMt2t8EUxDosA1tWIcooENMUVxazbbzSF
HnTMFmlFhObPbrpFduzmmElZ/tV40Tg1AsIP1VxZqu0wQT3i2jsA+jq/Q6qAqrlG
6k/rLiYk/QKBgAZGnWLKTgY4GJFg3oz2YmzPCIoR2Rd1WqbDa/W5lXcLShfAPVQO
hVEHNYylrbGtCnfG6K6wmiAZpRtHSYAB+CarsuZKAjorbNazdesOOXHd8+n9l3Fl
j3UB9piHHPwm3qsDjyFvw6MhvVXYJ60dMezCMlXE1Ri9iPrrdqNXgBuBAoGAJVHn
wFdqUcH5W9JU6v6Sj3TjjtjKsBC4sh49EiNSauW3T4AnpOMVoep9duIi3xUzbsWz
FOG4MxbhJ7xix3mL5hk/qGtd8ljg2v+KKChrsWpgg8m2nxgSRUqDt23zyz/yynl0
npLQyWOcQkfmic5KmOj20w9kUcw4BUrXWw4XaNUCgYBZAXEJs9sKYlGM2xBDOFPp
8DGDC/4MoaFF+lDgvQyx1BIA8dMY66arcU9D/aAhS1BeRoSapBUOyaqNfnAtueX1
H05UFyJ2qLx1EUBUa3dN1R1V9IYbL9NzsrPes8l7QkoLZmyK3/3GfBcuqP/OqBaR
W9wOM2T1FylJ59yd0Z7Ldw==
-----END PRIVATE KEY-----
"@
$privateKey | vercel env add FIREBASE_PRIVATE_KEY production
$privateKey | vercel env add FIREBASE_PRIVATE_KEY preview
$privateKey | vercel env add FIREBASE_PRIVATE_KEY development

# COOKIE_SIGNATURE_KEY_1
$value = "ab3d860ed38194fa5a2c28b391e40d4fd7dfabccedfef731d586c81719c5ee5b"; $value | vercel env add COOKIE_SIGNATURE_KEY_1 production
$value = "ab3d860ed38194fa5a2c28b391e40d4fd7dfabccedfef731d586c81719c5ee5b"; $value | vercel env add COOKIE_SIGNATURE_KEY_1 preview
$value = "ab3d860ed38194fa5a2c28b391e40d4fd7dfabccedfef731d586c81719c5ee5b"; $value | vercel env add COOKIE_SIGNATURE_KEY_1 development

# COOKIE_SIGNATURE_KEY_2
$value = "eff39895f50f2e48dfd450e124caea3fb308bbacb844d8aa8da020d4653b07ab"; $value | vercel env add COOKIE_SIGNATURE_KEY_2 production
$value = "eff39895f50f2e48dfd450e124caea3fb308bbacb844d8aa8da020d4653b07ab"; $value | vercel env add COOKIE_SIGNATURE_KEY_2 preview
$value = "eff39895f50f2e48dfd450e124caea3fb308bbacb844d8aa8da020d4653b07ab"; $value | vercel env add COOKIE_SIGNATURE_KEY_2 development
```

## Production環境のみに設定する場合

```powershell
$value = "AIzaSyCyjOZ0BLsVrq49-O_ihwMq1kO9ZO_Aoeg"; $value | vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
$value = "sirius-cf574.firebaseapp.com"; $value | vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
$value = "sirius-cf574"; $value | vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
$value = "sirius-cf574"; $value | vercel env add FIREBASE_PROJECT_ID production
$value = "firebase-adminsdk-fbsvc@sirius-cf574.iam.gserviceaccount.com"; $value | vercel env add FIREBASE_CLIENT_EMAIL production

$privateKey = @"
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+wmfhXCkyeTSj
jiM7NSOBPUeiiC8QuZRrWpxpzgnLZjqKK85qSxAuWgwOmKQojyphm9kaJdojodPs
62edr4mZ9nr39tsHeEej1dwYV9gm85p0EcXDcgIH0rV05H/HXCY2S2XVe87lLVZl
Q1P2bqrPU/mwWAlMpziJTst8VHqv6JkYNRwFRj+3i8lEwXcLAS3c1gLE/PVuGktT
9aVF2HijSiWNKSF3SSnsL6nv/XlgoN3evuL4XfzeDQy/IGJdq8Z7394Bz0Vbxd6c
CmQG9s7/2XuOUIc64Q0OBeA1k9aQd57irgiob0kMOOqAhExkTEyJFYmAL8OV5WCW
lCytlIvNAgMBAAECggEAIiTk+CMJYrXsNJxD9RyRUtg3osFyfzFgfgi1d4DAIw6U
yteFdmQiLNHEV7Z9p57cjKUbKoF89qTILJ+EJ+bcH9lM8GZYlREz7YDhiN/sWih/
TGhD+DRHZcQS463kqzf0xQIg46HqCf5f+Pcgp7ruSvbyedyAKZ7C0Vzvsjziyupt
pB+bPoXQBKpddL2UBfdU/8ApumI/BL5AarofxN+d8/zVfNAG8E18RSeulbn5ZXVo
9aOOw292o2BHwTR1pqhpse5EfHdiNqMv+7Ey427GUFfHrWZxk7J+n1Vi7TUcaBWD
RwI9nq/wdpyaOgPtNxzI/ea/f/wHodR3++/WSO21YQKBgQDekJOWrP7237GFL6TT
PxV/pd3MPn+gejJwxaQtGNKmVplbMpLhgL6NXxw9Zkfx+NEDg/FCq+NIjpL3visf
gsrk0+N2JtwB5CgwzalaVxCi010VQ8zhqa09Ji3IRXk/s+xQGclH4awtEuePuLrp
Zu6J/ahyCCePU1rv/f/VoSujEQKBgQDbaqen+dB82VQG+XjDA5hswOPoH6LezQKp
DMX5WVOrZaDnTKnJirPYaOTFZ69fPazRMt2t8EUxDosA1tWIcooENMUVxazbbzSF
HnTMFmlFhObPbrpFduzmmElZ/tV40Tg1AsIP1VxZqu0wQT3i2jsA+jq/Q6qAqrlG
6k/rLiYk/QKBgAZGnWLKTgY4GJFg3oz2YmzPCIoR2Rd1WqbDa/W5lXcLShfAPVQO
hVEHNYylrbGtCnfG6K6wmiAZpRtHSYAB+CarsuZKAjorbNazdesOOXHd8+n9l3Fl
j3UB9piHHPwm3qsDjyFvw6MhvVXYJ60dMezCMlXE1Ri9iPrrdqNXgBuBAoGAJVHn
wFdqUcH5W9JU6v6Sj3TjjtjKsBC4sh49EiNSauW3T4AnpOMVoep9duIi3xUzbsWz
FOG4MxbhJ7xix3mL5hk/qGtd8ljg2v+KKChrsWpgg8m2nxgSRUqDt23zyz/yynl0
npLQyWOcQkfmic5KmOj20w9kUcw4BUrXWw4XaNUCgYBZAXEJs9sKYlGM2xBDOFPp
8DGDC/4MoaFF+lDgvQyx1BIA8dMY66arcU9D/aAhS1BeRoSapBUOyaqNfnAtueX1
H05UFyJ2qLx1EUBUa3dN1R1V9IYbL9NzsrPes8l7QkoLZmyK3/3GfBcuqP/OqBaR
W9wOM2T1FylJ59yd0Z7Ldw==
-----END PRIVATE KEY-----
"@
$privateKey | vercel env add FIREBASE_PRIVATE_KEY production

$value = "ab3d860ed38194fa5a2c28b391e40d4fd7dfabccedfef731d586c81719c5ee5b"; $value | vercel env add COOKIE_SIGNATURE_KEY_1 production
$value = "eff39895f50f2e48dfd450e124caea3fb308bbacb844d8aa8da020d4653b07ab"; $value | vercel env add COOKIE_SIGNATURE_KEY_2 production
```

## 確認方法

設定した環境変数を確認する場合：

```bash
vercel env ls
```

