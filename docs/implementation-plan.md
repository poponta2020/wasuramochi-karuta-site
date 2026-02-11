# 実装計画書：活動報告機能の改善

**作成日**: 2026年2月4日
**関連文書**: [要件定義書](./requirements-activity-reports.md)
**バージョン**: 1.0

---

## 1. 実装フェーズ概要

本プロジェクトは以下の4フェーズで実装する。

| フェーズ | 内容 | 依存関係 |
|----------|------|----------|
| Phase 1 | 外部サービスのセットアップ | なし |
| Phase 2 | データ層・共通モジュールの実装 | Phase 1 |
| Phase 3 | 公開ページの実装 | Phase 2 |
| Phase 4 | 管理画面の実装 | Phase 2 |

---

## 2. Phase 1: 外部サービスのセットアップ

### 2.1 Supabaseのセットアップ

#### タスク一覧

| # | タスク | 担当 | 備考 |
|---|--------|------|------|
| 1.1.1 | Supabaseアカウント作成 | ユーザー | https://supabase.com |
| 1.1.2 | 新規プロジェクト作成 | ユーザー | リージョン: Northeast Asia (Tokyo) 推奨 |
| 1.1.3 | reportsテーブル作成 | ユーザー/開発者 | SQLを実行 |
| 1.1.4 | RLS（Row Level Security）設定 | ユーザー/開発者 | SQLを実行 |
| 1.1.5 | API URL・anon key取得 | ユーザー | Settings → API |

#### 実行SQL

```sql
-- 1. reportsテーブル作成
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 3. RLSを有効化
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. 読み取りポリシー（全員可能）
CREATE POLICY "Public read access" ON reports
  FOR SELECT USING (true);

-- 5. 書き込みポリシー（anon keyでも可能にする - 簡易認証のため）
CREATE POLICY "Allow all operations" ON reports
  FOR ALL USING (true) WITH CHECK (true);
```

#### 取得する情報

| 項目 | 取得場所 | 用途 |
|------|----------|------|
| Project URL | Settings → API → Project URL | API接続先 |
| anon public key | Settings → API → anon public | 認証キー |

---

### 2.2 Cloudinaryのセットアップ

#### タスク一覧

| # | タスク | 担当 | 備考 |
|---|--------|------|------|
| 1.2.1 | Cloudinaryアカウント作成 | ユーザー | https://cloudinary.com |
| 1.2.2 | Upload Preset作成 | ユーザー | Settings → Upload → Upload presets |
| 1.2.3 | Cloud Name取得 | ユーザー | Dashboard |

#### Upload Preset設定

| 項目 | 値 |
|------|-----|
| Preset name | `wasuramochi-unsigned` |
| Signing Mode | **Unsigned** |
| Folder | `wasuramochi-reports` |
| Allowed formats | jpg, jpeg, png, gif, webp |
| Max file size | 10MB |

#### 取得する情報

| 項目 | 取得場所 | 用途 |
|------|----------|------|
| Cloud Name | Dashboard右上 | アップロードAPI |
| Upload Preset名 | 作成したPreset名 | アップロードAPI |

---

## 3. Phase 2: データ層・共通モジュールの実装

### 3.1 設定ファイル

**ファイル**: `js/config.js`

```javascript
// Supabase設定
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Cloudinary設定
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'wasuramochi-unsigned';

// 管理画面パスワード（ハッシュ化推奨）
const ADMIN_PASSWORD = 'YOUR_PASSWORD';

// 表示設定
const REPORTS_PER_PAGE = 6;
const TOP_PAGE_REPORTS_COUNT = 3;
```

### 3.2 Supabaseクライアント

**ファイル**: `js/supabase-client.js`

| 関数 | 説明 |
|------|------|
| `getReports(page, limit)` | 活動報告一覧取得（ページネーション対応） |
| `getReportById(id)` | 単一の活動報告取得 |
| `createReport(data)` | 活動報告作成 |
| `updateReport(id, data)` | 活動報告更新 |
| `deleteReport(id)` | 活動報告削除 |
| `getReportsCount()` | 総件数取得 |

### 3.3 Cloudinaryアップローダー

**ファイル**: `js/cloudinary-uploader.js`

| 関数 | 説明 |
|------|------|
| `uploadImage(file)` | 画像をCloudinaryにアップロード |
| `deleteImage(publicId)` | 画像を削除（※Unsigned presetでは不可、管理画面からのみ） |

### 3.4 共通ユーティリティ

**ファイル**: `js/utils.js`

| 関数 | 説明 |
|------|------|
| `formatDate(dateString)` | 日付フォーマット |
| `createEventCard(report)` | イベントカードHTML生成 |
| `initCarousel(container)` | カルーセル初期化 |

---

## 4. Phase 3: 公開ページの実装

### 4.1 トップページ改修（index.html）

#### 変更内容

| 項目 | Before | After |
|------|--------|-------|
| 活動報告データ | HTMLハードコーディング | Supabaseから動的取得 |
| 表示件数 | 4件固定 | 最新3件 |
| 追加要素 | なし | 「もっと見る」ボタン |

#### 実装タスク

| # | タスク |
|---|--------|
| 3.1.1 | 既存の活動報告HTMLをプレースホルダーに置換 |
| 3.1.2 | `js/reports.js`を読み込み |
| 3.1.3 | ページ読み込み時にSupabaseから最新3件取得 |
| 3.1.4 | イベントカードを動的生成 |
| 3.1.5 | カルーセル機能を初期化 |
| 3.1.6 | 「もっと見る」ボタンを追加 |

### 4.2 活動報告一覧ページ新規作成（reports.html）

#### ページ構成

```
┌────────────────────────────────────────┐
│ ヘッダー（ナビゲーション）               │
├────────────────────────────────────────┤
│ ページタイトル「活動報告」               │
├────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐       │
│ │ イベント     │  │ イベント     │       │
│ │ カード 1    │  │ カード 2    │       │
│ └─────────────┘  └─────────────┘       │
│ ┌─────────────┐  ┌─────────────┐       │
│ │ イベント     │  │ イベント     │       │
│ │ カード 3    │  │ カード 4    │       │
│ └─────────────┘  └─────────────┘       │
│ ...                                    │
├────────────────────────────────────────┤
│ ページネーション                        │
│ [← 前へ] [1] [2] [3] [次へ →]          │
├────────────────────────────────────────┤
│ フッター                               │
└────────────────────────────────────────┘
```

#### 実装タスク

| # | タスク |
|---|--------|
| 3.2.1 | reports.htmlファイル作成（テンプレート） |
| 3.2.2 | ヘッダー・フッターをindex.htmlから流用 |
| 3.2.3 | イベントカードグリッド領域作成 |
| 3.2.4 | ページネーションUI作成 |
| 3.2.5 | URLパラメータ（?page=N）でページ切替 |
| 3.2.6 | Supabaseからデータ取得・表示 |

---

## 5. Phase 4: 管理画面の実装

### 5.1 管理画面構成

```
admin/
├── index.html      # メインHTML
├── css/
│   └── admin.css   # 管理画面専用スタイル
└── js/
    └── admin.js    # 管理画面ロジック
```

### 5.2 画面遷移

```
┌─────────────┐     パスワード正解     ┌─────────────┐
│  ログイン   │ ──────────────────────→ │ ダッシュボード│
│  画面      │                        │  (一覧)     │
└─────────────┘                        └─────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
             ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
             │  新規作成   │         │   編集      │         │   削除      │
             │  フォーム   │         │  フォーム   │         │  確認      │
             └─────────────┘         └─────────────┘         └─────────────┘
```

### 5.3 実装タスク

| # | タスク | 詳細 |
|---|--------|------|
| 4.1.1 | ログイン画面UI | パスワード入力・ログインボタン |
| 4.1.2 | ログイン処理 | パスワード照合・セッション保存 |
| 4.1.3 | ダッシュボードUI | 一覧表示・新規作成ボタン |
| 4.1.4 | 一覧データ取得 | Supabaseから全件取得 |
| 4.2.1 | 編集フォームUI | 日付・タイトル・説明・画像 |
| 4.2.2 | 画像アップロード機能 | ドラッグ&ドロップ + ファイル選択 |
| 4.2.3 | 画像プレビュー | アップロード済み画像の表示・削除 |
| 4.2.4 | 保存処理 | Supabaseへの登録・更新 |
| 4.3.1 | 削除確認モーダル | 確認ダイアログ |
| 4.3.2 | 削除処理 | Supabaseからの削除 |
| 4.4.1 | バリデーション | 必須項目チェック |
| 4.4.2 | エラーハンドリング | API エラー表示 |
| 4.4.3 | ローディング表示 | 処理中インジケーター |

### 5.4 画像アップロードUI仕様

```
┌────────────────────────────────────────────────────────┐
│  画像をドラッグ&ドロップ または                          │
│                                                        │
│            [ファイルを選択]                             │
│                                                        │
│  対応形式: JPG, PNG, GIF, WebP (最大10MB)               │
└────────────────────────────────────────────────────────┘

アップロード済み:
┌────────┐ ┌────────┐ ┌────────┐
│ 画像1  │ │ 画像2  │ │ 画像3  │
│   [×]  │ │   [×]  │ │   [×]  │
└────────┘ └────────┘ └────────┘
```

---

## 6. Phase 5: データ移行・テスト

### 6.1 既存データの移行

| # | タスク |
|---|--------|
| 5.1.1 | 既存4件の活動報告データをSupabaseに登録 |
| 5.1.2 | 既存画像をCloudinaryにアップロード（任意） |
| 5.1.3 | index.htmlから旧コードを削除 |

### 6.2 テスト項目

| カテゴリ | テスト内容 |
|----------|------------|
| 表示 | トップページに最新3件表示される |
| 表示 | 一覧ページで6件ずつ表示される |
| 表示 | ページネーションが正しく動作する |
| 表示 | カルーセルが正しく動作する |
| 表示 | スマホで正しく表示される |
| 管理 | パスワードでログインできる |
| 管理 | 新規記事を作成できる |
| 管理 | 画像をアップロードできる（PC） |
| 管理 | 画像をアップロードできる（スマホ） |
| 管理 | 記事を編集できる |
| 管理 | 記事を削除できる |
| エラー | オフライン時にエラーメッセージが表示される |

---

## 7. ファイル一覧（最終成果物）

```
wasuramochi-karuta-site/
├── index.html                    # 改修
├── reports.html                  # 新規
├── style.css                     # 改修（追加スタイル）
├── admin/
│   ├── index.html               # 新規
│   └── css/
│       └── admin.css            # 新規
├── js/
│   ├── config.js                # 新規
│   ├── supabase-client.js       # 新規
│   ├── cloudinary-uploader.js   # 新規
│   ├── utils.js                 # 新規
│   ├── reports.js               # 新規
│   └── admin.js                 # 新規
├── docs/
│   ├── requirements-activity-reports.md  # 要件定義書
│   └── implementation-plan.md            # 本ファイル
└── images/                       # 既存（移行後は使用しない可能性あり）
```

---

## 8. 実装順序サマリー

```
Phase 1: 外部サービスセットアップ
    │
    ├── 1.1 Supabase設定
    │       └── アカウント作成 → プロジェクト作成 → テーブル作成 → API Key取得
    │
    └── 1.2 Cloudinary設定
            └── アカウント作成 → Upload Preset作成 → Cloud Name取得
    │
    ▼
Phase 2: データ層・共通モジュール
    │
    ├── 2.1 js/config.js（設定値）
    ├── 2.2 js/supabase-client.js（DB操作）
    ├── 2.3 js/cloudinary-uploader.js（画像アップロード）
    └── 2.4 js/utils.js（共通関数）
    │
    ▼
Phase 3: 公開ページ
    │
    ├── 3.1 index.html改修（動的読み込み化）
    ├── 3.2 reports.html新規作成
    └── 3.3 js/reports.js（表示ロジック）
    │
    ▼
Phase 4: 管理画面
    │
    ├── 4.1 admin/index.html
    ├── 4.2 admin/css/admin.css
    └── 4.3 js/admin.js
    │
    ▼
Phase 5: データ移行・テスト
    │
    ├── 5.1 既存データ移行
    └── 5.2 動作確認テスト
```

---

## 9. 注意事項

### 9.1 セキュリティ

- `js/config.js`にはAPIキーが含まれるため、Gitリポジトリにコミットする場合は注意
- 本番環境では環境変数の利用を検討（Netlify環境変数など）

### 9.2 ブラウザ互換性

- ES6+構文を使用するため、IE非対応
- 必要に応じてBabelでトランスパイル

### 9.3 画像最適化

- Cloudinaryは自動的に画像を最適化・リサイズ可能
- URL パラメータで `w_800,q_auto` などを指定可能

---

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| 1.0 | 2026/02/04 | 初版作成 |