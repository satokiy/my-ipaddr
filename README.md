# My IP Address - IPアドレス確認ツール

あなたのグローバルIPアドレスを簡単に確認できるWebアプリケーションです。

## 🌟 特徴

- **グローバルIPアドレスの表示**: 実際のインターネット上のIPアドレスを表示
- **ブラウザ情報**: 使用中のブラウザ、OS、プラットフォーム情報
- **ワンクリックコピー**: IPアドレスを簡単にクリップボードにコピー
- **レスポンシブデザイン**: モバイル・デスクトップ両対応
- **TypeScript対応**: 型安全な開発環境

## 🚀 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **React Icons**: アイコンライブラリ
- **Axios**: HTTP通信
- **外部API**: 
  - ipapi.co（メイン）
  - ipify.org（フォールバック）
  - ip-api.com（フォールバック）

### バックエンド（オプション）
- **Bun**: 高速なJavaScript/TypeScriptランタイム
- **TypeScript**: ネイティブサポート
- ※現在はフロントエンドのみで動作するため使用していません

## 📦 インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/my-ipaddr.git
cd my-ipaddr

# フロントエンドの依存関係インストール
cd frontend
npm install
```

## 🎯 使い方

### 開発環境での起動

```bash
cd frontend
npm start
```

ブラウザで http://localhost:3000 にアクセス

### ビルド

```bash
cd frontend
npm run build
```

`frontend/build` フォルダに本番用ファイルが生成されます。

## 🌐 デプロイ

フロントエンドのみの静的サイトとしてデプロイ可能：

- **Vercel**: `frontend`フォルダを直接デプロイ
- **Netlify**: `frontend/build`フォルダをデプロイ
- **GitHub Pages**: ビルド後のファイルをデプロイ

## 📁 プロジェクト構造

```
my-ipaddr/
├── frontend/               # Reactアプリケーション
│   ├── src/
│   │   ├── App.tsx        # メインコンポーネント
│   │   ├── components/    # UIコンポーネント
│   │   │   ├── IPDisplay.tsx
│   │   │   ├── InfoCard.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── services/      # API通信
│   │   │   └── externalApi.ts
│   │   ├── types/         # TypeScript型定義
│   │   └── styles/        # CSS
│   └── package.json
│
└── backend/               # Bunサーバー（オプション）
    ├── server.ts          # APIサーバー
    └── package.json
```

## 🔧 カスタマイズ

### 外部APIの変更

`frontend/src/services/externalApi.ts` で使用するIPアドレス取得サービスを変更できます：

```typescript
const EXTERNAL_IP_SERVICES = [
  // 新しいサービスを追加
  {
    name: 'your-service',
    url: 'https://your-api-endpoint',
    parseResponse: (data) => ({
      ip: data.ip,
      ipType: data.version
    })
  }
];
```

## 📝 ライセンス

MIT

## 🤝 貢献

プルリクエストを歓迎します！

## ⚠️ 注意事項

- 外部APIサービスにはレート制限があります
- HTTPSでホストされているサイトからHTTPのAPIにはアクセスできません
- プライバシー保護のため、IPアドレス情報は外部に送信されません（表示のみ）
