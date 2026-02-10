# 実装計画書：サイト全体CMS化

**作成日**: 2026年2月10日
**対応する要件定義書**: requirements-site-cms.md v1.1

---

## 進捗サマリー

| フェーズ | 内容 | ステータス |
|---------|------|:----------:|
| 1 | データベーステーブル作成 + 初期データ投入 | [ ] 未着手 |
| 2 | SupabaseClient拡張 | [ ] 未着手 |
| 3 | 公開ページの動的表示化 | [ ] 未着手 |
| 4 | 管理画面UI改修（レイアウト + ナビゲーション） | [ ] 未着手 |
| 5 | 管理画面ロジック実装 | [ ] 未着手 |
| 6 | 動作確認 + 微調整 | [ ] 未着手 |

---

## フェーズ1: データベーステーブル作成 + 初期データ投入

### タスク一覧
- [ ] 1-1. `update_updated_at` 関数の作成SQL
- [ ] 1-2. 4テーブルの作成SQL（site_contents, karuta_cards, activity_cards, faq_items）
- [ ] 1-3. 初期データ投入SQL
- [ ] 1-4. SQLファイル `docs/sql/create-cms-tables.sql` として保存
- [ ] 1-5. ユーザーがSupabase SQL Editorで実行

### 実行するSQL

#### 1-1. `update_updated_at` 関数（未作成の場合）
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 1-2. テーブル作成
要件定義書 3.2 に記載の4テーブルをそのまま作成：
- `site_contents` （キー・バリュー形式）
- `karuta_cards` （百人一首カード）
- `activity_cards` （活動内容カード）
- `faq_items` （FAQ）

#### 1-3. 初期データ投入
要件定義書 3.3 に記載のINSERT文を実行。

### 成果物
- `docs/sql/create-cms-tables.sql` — テーブル作成 + 初期データ投入の全SQLをまとめたファイル

### ユーザー作業
- ユーザーがSupabase管理画面のSQL Editorでこのファイルの内容を実行する

---

## フェーズ2: SupabaseClient拡張

### タスク一覧
- [ ] 2-1. site_contents用メソッド追加（getSiteContents, updateSiteContents）
- [ ] 2-2. karuta_cards用CRUDメソッド追加（get, create, update, delete）
- [ ] 2-3. activity_cards用メソッド追加（get, update）
- [ ] 2-4. faq_items用CRUDメソッド追加（get, create, update, delete）

### 作業内容
`js/supabase-client.js` に以下のメソッドを追加する。

### 追加メソッド一覧

| メソッド名 | 説明 | HTTPメソッド |
|-----------|------|-------------|
| `getSiteContents(sectionKey)` | 指定セクションの全フィールドを取得 | GET |
| `updateSiteContents(sectionKey, fields)` | セクションの複数フィールドを一括更新（UPSERT） | POST (upsert) |
| `getKarutaCards()` | 百人一首カード一覧を取得（sort_order順） | GET |
| `createKarutaCard(data)` | 百人一首カードを作成 | POST |
| `updateKarutaCard(id, data)` | 百人一首カードを更新 | PATCH |
| `deleteKarutaCard(id)` | 百人一首カードを削除 | DELETE |
| `getActivityCards()` | 活動内容カード一覧を取得（sort_order順） | GET |
| `updateActivityCard(id, data)` | 活動内容カードを更新 | PATCH |
| `getFaqItems()` | FAQ一覧を取得（sort_order順） | GET |
| `createFaqItem(data)` | FAQを作成 | POST |
| `updateFaqItem(id, data)` | FAQを更新 | PATCH |
| `deleteFaqItem(id)` | FAQを削除 | DELETE |

### 実装ポイント

**site_contentsのUPSERT処理:**
- Supabase REST APIの `Prefer: resolution=merge-duplicates` ヘッダーを使用
- `on_conflict=section_key,field_key` パラメータで重複時にUPDATE
- `updateSiteContents(sectionKey, fields)` はフィールドのオブジェクトを受け取り、各キーバリューをUPSERTする

**ソート順の更新:**
- karuta_cards / faq_items の並び替え時は、対象のsort_orderを入れ替えるPATCHを2回呼ぶ

---

## フェーズ3: 公開ページの動的表示化

### タスク一覧
- [ ] 3-1. `js/site-loader.js` 新規作成（全セクション動的読み込み）
- [ ] 3-2. `index.html` に動的更新対象のID付与
- [ ] 3-3. `index.html` に `site-loader.js` のscriptタグ追加
- [ ] 3-4. FAQアコーディオンをイベント委任方式に変更

### 作業内容

#### 3-1. `js/site-loader.js`（新規作成）

トップページの各セクションをデータベースから読み込み、DOMを更新する。

```
loadSiteContents()
  ├── loadHeroSection()      // subtitle, ボタンテキスト/リンクを更新
  ├── loadAboutSection()     // 紹介文, 説明文, 画像を更新
  ├── loadKarutaSection()    // カード一覧をDBから生成
  ├── loadActivitiesSection() // カード内容をDBから更新
  ├── loadFaqSection()       // FAQ一覧をDBから生成
  └── loadContactSection()   // SNS URL, メールを更新
```

**フォールバック方針:**
- 各load関数はtry-catchで囲む
- DB取得失敗時はHTMLのデフォルト値をそのまま表示（何もしない）
- コンソールにエラーログのみ出力

**パフォーマンス最適化:**
- `site_contents` は1回のGETで全セクション分を取得し、セクション別に振り分ける
- 各テーブルのGETリクエストは `Promise.all` で並列実行

#### 3-2. `index.html` の修正

- `<script src="/js/site-loader.js"></script>` を追加
- 各セクションの動的更新対象要素にIDを付与：

| セクション | 追加するID |
|-----------|-----------|
| ヒーロー | `hero-subtitle`, `hero-cta-primary`, `hero-cta-secondary` |
| サークル紹介 | `about-intro`, `about-description`, `about-image` |
| 百人一首 | `karuta-grid`（既存の `.explanation-grid` にID付与） |
| 活動内容 | `activities-grid`（既存の `.activities-grid` にID付与） |
| FAQ | `faq-list`（既存の `.faq-list` にID付与） |
| お問い合わせ | `contact-line`, `contact-instagram`, `contact-twitter`, `contact-email` |

- FAQ動的生成後もアコーディオン動作するよう、FAQクリックイベントをイベント委任に変更

---

## フェーズ4: 管理画面UI改修

### タスク一覧
- [ ] 4-1. `admin/index.html` サイドバー付きレイアウトに変更
- [ ] 4-2. ヒーロー編集ビューHTML追加
- [ ] 4-3. サークル紹介編集ビューHTML追加
- [ ] 4-4. 百人一首カード編集ビューHTML追加
- [ ] 4-5. 活動内容編集ビューHTML追加
- [ ] 4-6. FAQ編集ビューHTML追加
- [ ] 4-7. お問い合わせ編集ビューHTML追加
- [ ] 4-8. `css/admin.css` サイドバー + 各編集画面スタイル追加

### 作業内容

#### 4-1. `admin/index.html` の改修

**レイアウト変更:**
現在の単一ビュー構成を、サイドバー + メインコンテンツのレイアウトに変更する。

```html
<div class="admin-layout">
    <aside class="admin-sidebar">
        <nav class="sidebar-nav">
            <a href="#" data-section="reports" class="active">活動報告</a>
            <a href="#" data-section="hero">ヒーロー</a>
            <a href="#" data-section="about">サークル紹介</a>
            <a href="#" data-section="karuta">百人一首・競技かるた</a>
            <a href="#" data-section="activities">活動内容</a>
            <a href="#" data-section="faq">よくある質問</a>
            <a href="#" data-section="contact">お問い合わせ</a>
        </nav>
    </aside>
    <main class="admin-main">
        <!-- 各セクションのビューがここに切り替わる -->
    </main>
</div>
```

**各セクション用のビュー（HTML構造）:**

1. **活動報告ビュー** — 既存のダッシュボード + 編集フォームをそのまま維持
2. **ヒーロー編集ビュー** — サブタイトル、ボタン2つ（テキスト+リンク）のフォーム
3. **サークル紹介編集ビュー** — 紹介文、説明文テキストエリア、画像アップロード
4. **百人一首カード編集ビュー** — カード一覧テーブル + 追加/編集/削除/並び替えUI
5. **活動内容編集ビュー** — 3枚のカードフォーム（アイコン、タイトル、本文）
6. **FAQ編集ビュー** — FAQ一覧 + 追加/編集/削除/並び替えUI
7. **お問い合わせ編集ビュー** — SNS URL × 3 + メールアドレスのフォーム

#### 4-2. `css/admin.css` の追加スタイル

- サイドバーレイアウト（`.admin-layout`, `.admin-sidebar`）
- サイドバーナビゲーション（`.sidebar-nav`）
- リスト管理用スタイル（並び替えボタン、カード一覧）
- モバイル対応（サイドバーはハンバーガーメニューで折りたたみ）

---

## フェーズ5: 管理画面ロジック実装

### タスク一覧
- [ ] 5-1. セクション切り替え機能
- [ ] 5-2. ヒーロー編集ロジック（loadHeroEdit, saveHero）
- [ ] 5-3. サークル紹介編集ロジック（loadAboutEdit, saveAbout + 画像アップロード）
- [ ] 5-4. 百人一首カード管理ロジック（CRUD + 並び替え）
- [ ] 5-5. 活動内容編集ロジック（loadActivitiesEdit, saveActivities）
- [ ] 5-6. FAQ管理ロジック（CRUD + 並び替え）
- [ ] 5-7. お問い合わせ編集ロジック（loadContactEdit, saveContact）

### 作業内容
`js/admin.js` の `AdminPanel` クラスに各セクション管理機能を追加する。

### 追加する機能

#### 5-1. セクション切り替え
- サイドバーのクリックイベントで `data-section` に応じたビューを表示/非表示
- 各ビューの表示時にデータをロード

#### 5-2. ヒーロー編集
- `loadHeroEdit()` — site_contentsから `hero` セクションのデータを取得しフォームに反映
- `saveHero()` — フォームの内容を `updateSiteContents('hero', {...})` で保存

#### 5-3. サークル紹介編集
- `loadAboutEdit()` — site_contentsから `about` セクションのデータを取得
- 画像アップロード — 既存の `cloudinaryUploader` を利用
- `saveAbout()` — テキスト + 画像URLを保存

#### 5-4. 百人一首カード管理
- `loadKarutaEdit()` — カード一覧を取得しテーブル表示
- `showKarutaForm(id?)` — 新規/編集フォーム表示
- `saveKarutaCard()` — カード保存（作成 or 更新）
- `deleteKarutaCard(id)` — 削除確認 → 削除
- `moveKarutaCard(id, direction)` — sort_orderの入れ替え

#### 5-5. 活動内容編集
- `loadActivitiesEdit()` — 3枚のカードデータを取得しフォームに反映
- `saveActivities()` — 3枚まとめて保存

#### 5-6. FAQ管理
- `loadFaqEdit()` — FAQ一覧を取得しテーブル表示
- `showFaqForm(id?)` — 新規/編集フォーム表示
- `saveFaqItem()` — FAQ保存（作成 or 更新）
- `deleteFaqItem(id)` — 削除確認 → 削除
- `moveFaqItem(id, direction)` — sort_orderの入れ替え

#### 5-7. お問い合わせ編集
- `loadContactEdit()` — site_contentsから `contact` セクションのデータを取得
- `saveContact()` — URLとメールアドレスを保存

---

## フェーズ6: 動作確認 + 微調整

### タスク一覧
- [ ] 6-1. Supabaseにテーブル・初期データが正しく作成されているか
- [ ] 6-2. 公開ページで各セクションがDBからの値で表示されるか
- [ ] 6-3. DB接続失敗時にHTMLのデフォルト値でフォールバック表示されるか
- [ ] 6-4. 管理画面のサイドバーで各セクションに切り替えできるか
- [ ] 6-5. ヒーロー: サブタイトル・ボタンの編集・保存が反映されるか
- [ ] 6-6. サークル紹介: テキスト・画像の編集・保存が反映されるか
- [ ] 6-7. 百人一首カード: 追加・編集・削除・並び替えが正しく動作するか
- [ ] 6-8. 活動内容: 3枚のカード内容の編集・保存が反映されるか
- [ ] 6-9. FAQ: 追加・編集・削除・並び替えが正しく動作するか
- [ ] 6-10. お問い合わせ: SNS URL・メールの編集・保存が反映されるか
- [ ] 6-11. モバイルでの管理画面レスポンシブ表示
- [ ] 6-12. 既存の活動報告機能が影響を受けていないか

---

## ファイル変更サマリー

| ファイル | 種別 | 変更内容 |
|---------|------|---------|
| `docs/sql/create-cms-tables.sql` | 新規 | テーブル作成 + 初期データ投入SQL |
| `js/supabase-client.js` | 改修 | 4テーブル用のCRUDメソッド追加 |
| `js/site-loader.js` | 新規 | 公開ページの動的読み込みロジック |
| `index.html` | 改修 | 動的更新対象へのID付与 + script追加 + FAQイベント委任化 |
| `admin/index.html` | 改修 | サイドバーレイアウト + 各セクション編集画面HTML |
| `css/admin.css` | 改修 | サイドバー + 各編集画面用スタイル追加 |
| `js/admin.js` | 改修 | 各セクション編集ロジック追加 |

---

## 実装順序と依存関係

```
フェーズ1（SQL）
    ↓
フェーズ2（SupabaseClient拡張）
    ↓
┌─────────────────┬─────────────────────┐
フェーズ3             フェーズ4
（公開ページ動的化）    （管理画面UI）
└─────────────────┴─────────────────────┘
                  ↓
           フェーズ5（管理画面ロジック）
                  ↓
           フェーズ6（動作確認）
```

フェーズ3とフェーズ4は並行作業可能。フェーズ5はフェーズ2・4の完了が必要。
