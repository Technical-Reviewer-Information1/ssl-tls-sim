# SSL/TLS

『大学入学共通テスト「情報Ⅰ」対策問題集』（技術評論社, ISBN 978-4-297-15084-6）pp.128-129 連動Webアプリ。

**公開URL**: https://technical-reviewer-information1.github.io/ssl-tls-sim/

共通鍵は速い、公開鍵は鍵を渡さなくてよい。両方のいいとこ取りがハイブリッド暗号方式です。実際の通信の始まりを追いかけましょう。

## 技術

静的な HTML / CSS / JavaScript のみで動作します。ビルド不要・外部CDN不使用・サーバ通信なし。
GitHub Pages で配信しており、Python や Streamlit は不要です。スマートフォン／タブレット／PC に対応。

```
index.html
css/style.css   全アプリ共通スタイル
css/app.css     このアプリ固有のスタイル
js/app.js       画面制御
```

`streamlit_app.py` は旧版（Streamlit Community Cloud 用）です。

---
Created by Dit-Lab.(Daiki ITO) / Supported by Tomoaki ATSUMI
