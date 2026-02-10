# 要件定義書：サイト全体CMS化

**作成日**: 2026年2月10日
**プロジェクト**: わすらもち会 公式サイト
**バージョン**: 1.1

---

## 1. 概要

### 1.1 背景
活動報告セクションの管理画面化は完了したが、それ以外のセクション（サークル紹介、活動内容、FAQ、お問い合わせ等）は依然としてHTMLに直接記述されている。練習場所の変更、参加費用の改定、FAQの追加・修正など、頻繁に更新が必要な情報がある。

### 1.2 目的
1. サイト上のすべての編集可能なセクションを管理画面から更新できるようにする
2. HTMLの直接編集を不要にし、非エンジニアでもコンテンツ更新を行えるようにする

### 1.3 スコープ（対象セクション）

| # | セクション | CMS化 | 備考 |
|---|-----------|-------|------|
| 1 | ヒーローセクション | 対象 | サブタイトル・ボタンのみ |
| 2 | サークル紹介（About） | 対象 | 紹介文・説明文・画像のみ |
| 3 | 百人一首・競技かるたとは | 対象 | カードの追加・削除可能 |
| 4 | 活動内容（Activities） | 対象 | 3枚固定、内容のみ編集 |
| 5 | 活動報告（Reports） | 対象外 | 実装済み |
| 6 | よくある質問（FAQ） | 対象 | 追加・削除・並び替え可能 |
| 7 | 参加方法・お問い合わせ | 対象 | SNS URL・メールのみ |

---

## 2. 機能要件

### 2.1 管理対象セクションの詳細

#### 2.1.1 ヒーローセクション

| フィールド | 型 | 編集 | 説明 | 現在の値 |
|-----------|------|:----:|------|---------|
| title | string | 固定 | メインタイトル | わすらもち会 |
| subtitle | string | ○ | サブタイトル（HTML改行対応） | 札幌市で活動する&lt;br&gt;競技かるたサークルです |
| cta_primary_text | string | ○ | 主ボタンテキスト | 体験参加申し込み |
| cta_primary_link | string | ○ | 主ボタンリンク先 | #contact |
| cta_secondary_text | string | ○ | 副ボタンテキスト | サークルについて |
| cta_secondary_link | string | ○ | 副ボタンリンク先 | #about |

#### 2.1.2 サークル紹介（About）

| フィールド | 型 | 編集 | 説明 | 現在の値 |
|-----------|------|:----:|------|---------|
| heading | string | 固定 | セクション見出し | わすらもち会について |
| intro_text | string | ○ | 紹介文 | 札幌で競技かるたをしたい人達が集まるサークルです |
| description | text | ○ | 説明文（HTML対応） | 高校生から社会人まで〜 |
| image | string | ○ | 画像URL（Cloudinaryアップロード可） | /images/rensyuu_huukei.jpeg |

#### 2.1.3 百人一首・競技かるたとは

説明カードをリスト形式で管理する（**追加・削除可能**）。

**各カードのフィールド：**

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | UUID | 一意識別子 |
| title | string | カードタイトル |
| image | string | 画像URL |
| description | text | 説明文 |
| sort_order | integer | 表示順 |

**現在のカード一覧（2枚）：**
1. 小倉百人一首（画像: IMG_6720.jpeg）
2. 競技かるた（画像: tsukite.jpeg）

#### 2.1.4 活動内容（Activities）

**3枚固定**で、各カードの内容のみ編集可能。カードの追加・削除・並び替えは不可。

**各カードのフィールド：**

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | UUID | 一意識別子 |
| icon | string | アイコン（絵文字） |
| title | string | カードタイトル |
| content | text | 本文（HTML対応） |
| sort_order | integer | 表示順（固定） |

**現在のカード一覧（3枚）：**
1. 📍 練習場所 - 各施設の名前・住所・時間
2. 📅 活動頻度 - 週2回等
3. 💰 参加費用 - 年会費・参加費

#### 2.1.5 よくある質問（FAQ）

FAQ項目をリスト形式で管理する（**追加・削除・並び替え可能**）。

**各FAQ項目のフィールド：**

| フィールド | 型 | 説明 |
|-----------|------|------|
| id | UUID | 一意識別子 |
| question | string | 質問文 |
| answer | text | 回答文 |
| sort_order | integer | 表示順 |

**現在のFAQ一覧（5件）：**
1. 百人一首を全く知らないのですが、参加できますか？
2. どのくらいで上達できますか？
3. 必要な道具はありますか？
4. 年齢制限はありますか？
5. 見学だけでも大丈夫ですか？

#### 2.1.6 参加方法・お問い合わせ（Contact）

| フィールド | 型 | 編集 | 説明 | 現在の値 |
|-----------|------|:----:|------|---------|
| heading | string | 固定 | セクション見出し | 参加方法・お問い合わせ |
| description | string | 固定 | 説明文 | 百人一首に興味を持たれた方〜 |
| line_url | string | ○ | LINE URL | https://line.me/ti/p/@721raufe |
| instagram_url | string | ○ | Instagram URL | https://www.instagram.com/wasuramochi_karuta/ |
| twitter_url | string | ○ | X (Twitter) URL | https://twitter.com/karuta12346 |
| email | string | ○ | メールアドレス | poponta2020@gmail.com |

---

### 2.2 管理画面の拡張

既存の管理画面（admin/index.html）にサイドメニューを追加し、各セクションの編集画面を設ける。

#### 管理画面メニュー構成

```
管理画面
├── 活動報告（既存）
├── ヒーローセクション
├── サークル紹介
├── 百人一首・競技かるたとは
├── 活動内容
├── よくある質問
└── お問い合わせ
```

#### 各セクション共通の操作

| 操作 | 説明 |
|------|------|
| 表示 | 現在の設定値を表示 |
| 編集 | フォームから値を変更し保存 |

#### リスト形式セクション（百人一首カード・FAQ）の追加操作

| 操作 | 説明 |
|------|------|
| 追加 | 新しい項目を追加 |
| 削除 | 既存の項目を削除 |
| 並び替え | 上下ボタンで表示順を変更 |

---

## 3. データベース設計

### 3.1 設計方針

セクションの種類に応じて以下のテーブル構成を採用する：

1. **site_contents テーブル** - キー・バリュー形式（ヒーロー・サークル紹介・お問い合わせ用）
2. **karuta_cards テーブル** - 百人一首説明カード専用（追加・削除可能）
3. **activity_cards テーブル** - 活動内容カード専用（3枚固定）
4. **faq_items テーブル** - FAQリスト専用（追加・削除・並び替え可能）

### 3.2 テーブルスキーマ

#### site_contents テーブル

ヒーローセクション・サークル紹介・お問い合わせ等、1セクションに固定フィールドが数個あるものを管理する。

```sql
CREATE TABLE site_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key VARCHAR(50) NOT NULL,
  field_key VARCHAR(50) NOT NULL,
  field_value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_key, field_key)
);

CREATE TRIGGER site_contents_updated_at
  BEFORE UPDATE ON site_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE site_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON site_contents
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations" ON site_contents
  FOR ALL USING (true) WITH CHECK (true);
```

#### karuta_cards テーブル

```sql
CREATE TABLE karuta_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image TEXT DEFAULT '',
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER karuta_cards_updated_at
  BEFORE UPDATE ON karuta_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE karuta_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON karuta_cards
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations" ON karuta_cards
  FOR ALL USING (true) WITH CHECK (true);
```

#### activity_cards テーブル

```sql
CREATE TABLE activity_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon VARCHAR(10) DEFAULT '',
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER activity_cards_updated_at
  BEFORE UPDATE ON activity_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE activity_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON activity_cards
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations" ON activity_cards
  FOR ALL USING (true) WITH CHECK (true);
```

#### faq_items テーブル

```sql
CREATE TABLE faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER faq_items_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON faq_items
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations" ON faq_items
  FOR ALL USING (true) WITH CHECK (true);
```

### 3.3 初期データ投入SQL

```sql
-- ヒーローセクション
INSERT INTO site_contents (section_key, field_key, field_value) VALUES
  ('hero', 'subtitle', '札幌市で活動する<br>競技かるたサークルです'),
  ('hero', 'cta_primary_text', '体験参加申し込み'),
  ('hero', 'cta_primary_link', '#contact'),
  ('hero', 'cta_secondary_text', 'サークルについて'),
  ('hero', 'cta_secondary_link', '#about');

-- サークル紹介
INSERT INTO site_contents (section_key, field_key, field_value) VALUES
  ('about', 'intro_text', '札幌で競技かるたをしたい人達が集まるサークルです'),
  ('about', 'description', '<span class="highlight">高校生から社会人まで、</span>たくさんの人達が一緒に競技かるたを楽しんでいます。現在<span class="highlight">約20名程で</span>活動しています。'),
  ('about', 'image', '/images/rensyuu_huukei.jpeg');

-- お問い合わせ（SNS URL・メールのみ）
INSERT INTO site_contents (section_key, field_key, field_value) VALUES
  ('contact', 'line_url', 'https://line.me/ti/p/@721raufe'),
  ('contact', 'instagram_url', 'https://www.instagram.com/wasuramochi_karuta/'),
  ('contact', 'twitter_url', 'https://twitter.com/karuta12346'),
  ('contact', 'email', 'poponta2020@gmail.com');

-- 百人一首・競技かるたとは カード
INSERT INTO karuta_cards (title, image, description, sort_order) VALUES
  ('小倉百人一首', '/images/IMG_6720.jpeg', '平安時代から伝わる100首の和歌。美しい日本語の響きと深い情感を味わえる古典文学の宝庫です。', 1),
  ('競技かるた', '/images/tsukite.jpeg', '百人一首を使った競技スポーツ。瞬発力、記憶力、集中力が求められる「畳の上の格闘技」とも呼ばれます。', 2);

-- 活動内容カード（3枚固定）
INSERT INTO activity_cards (icon, title, content, sort_order) VALUES
  ('📍', '練習場所', '<p><strong>かでる2・7</strong><br>中央区北2条西7丁目<br>17:00-21:00</p><br><p><strong>東区民センター</strong><br>東区北11条東7丁目<br>18:00-22:00</p><br><p><strong>中央区民センター</strong><br>中央区南2条西10丁目<br>18:00-21:00</p><br><p>※2, 3試合でスケジュールを組んでいるので、途中参加・退出も可能です</p>', 1),
  ('📅', '活動頻度', '<p><strong>週2回</strong><br>（曜日は流動的）</p><br><p>メンバーの都合に合わせて柔軟にスケジュールを調整しています。</p>', 2),
  ('💰', '参加費用', '<p><strong>年会費：無料</strong></p><p><strong>高校生以下：完全無料</strong></p><p><strong>大学生以上：参加人数によって変動します。<br>社会人：大学生＝３：１の割合で和室使用料を按分します。</strong></p>', 3);

-- FAQ項目
INSERT INTO faq_items (question, answer, sort_order) VALUES
  ('百人一首を全く知らないのですが、参加できますか？', 'もちろんです！初心者大歓迎です。百人一首の基本的なルールから和歌の覚え方まで、メンバーが丁寧に教えます。まずは体験参加してみてください。', 1),
  ('どのくらいで上達できますか？', '個人差はありますが、週2回程度の参加で2-4ヶ月もあれば基本的な試合ができるようになります。1年程度でD-C級、2-3年でB-A級を目指せます。', 2),
  ('必要な道具はありますか？', '練習用の札はサークルで用意しているので、特に必要ありません。', 3),
  ('年齢制限はありますか？', '年齢制限はございません。現在のメンバーは高校生から社会人まで幅広い年齢層の方が参加されています。', 4),
  ('見学だけでも大丈夫ですか？', '見学だけでも大歓迎です！実際の練習風景を見ていただけば、雰囲気がよく分かると思います。見学の際は事前にご連絡いただければと思います。', 5);
```

---

## 4. 技術構成

### 4.1 既存技術スタックの継続利用

| レイヤー | サービス/技術 | 用途 |
|----------|---------------|------|
| フロントエンド | HTML/CSS/JavaScript（Vanilla） | 公開サイト・管理画面 |
| データベース | Supabase（PostgreSQL） | 全コンテンツデータの保存 |
| 画像ストレージ | Cloudinary | 画像のアップロード・配信 |
| ホスティング | Netlify | サイト配信 |

### 4.2 変更対象ファイル

```
wasuramochi-karuta-site/
├── index.html              # 改修：全セクションを動的表示に変更
├── js/
│   ├── config.js            # 変更なし
│   ├── supabase-client.js   # 改修：新テーブル用メソッド追加
│   ├── cloudinary-uploader.js # 変更なし
│   ├── utils.js             # 改修：各セクション描画関数追加
│   ├── reports.js           # 変更なし
│   ├── admin.js             # 改修：各セクション編集機能追加
│   └── site-loader.js       # 新規：トップページの全セクション動的読み込み
├── admin/
│   └── index.html           # 改修：サイドメニュー + 各セクション編集画面追加
├── css/
│   └── admin.css            # 改修：サイドメニュー・新フォーム用スタイル追加
└── style.css                # 変更なし
```

---

## 5. 管理画面 UI設計

### 5.1 画面構成

```
┌──────────────────────────────────────────────────┐
│ ヘッダー：わすらもち会 管理画面                      │
├───────────┬──────────────────────────────────────┤
│           │                                      │
│ サイドバー │  メインコンテンツ                      │
│           │                                      │
│ ・活動報告 │  （選択されたセクションの編集画面）      │
│ ・ヒーロー │                                      │
│ ・紹介    │                                      │
│ ・百人一首 │                                      │
│ ・活動内容 │                                      │
│ ・FAQ     │                                      │
│ ・連絡先  │                                      │
│           │                                      │
└───────────┴──────────────────────────────────────┘
```

### 5.2 各セクション編集画面

#### ヒーロー編集画面
- サブタイトル入力
- ボタン1テキスト / リンク入力
- ボタン2テキスト / リンク入力
- [保存] ボタン

#### サークル紹介編集画面
- 紹介文入力
- 説明文入力（テキストエリア）
- 画像アップロード（Cloudinary利用）
- [保存] ボタン

#### 百人一首・競技かるたとは 編集画面
- カード一覧表示
- [新規カード追加] ボタン
- 各カード：タイトル入力 / 画像アップロード / 説明文入力 / [編集] [削除] ボタン
- 並び替え（上下ボタン）

#### 活動内容編集画面（3枚固定）
- 3枚のカードを並べて表示
- 各カード：アイコン入力 / タイトル入力 / 本文入力（テキストエリア）
- [保存] ボタン
- ※追加・削除・並び替え不可

#### FAQ編集画面
- FAQ一覧表示
- [新規FAQ追加] ボタン
- 各項目：質問入力 / 回答入力（テキストエリア）/ [編集] [削除] ボタン
- 並び替え（上下ボタン）

#### お問い合わせ編集画面
- LINE URL入力
- Instagram URL入力
- X (Twitter) URL入力
- メールアドレス入力
- [保存] ボタン

---

## 6. 公開ページの動的表示

### 6.1 読み込みフロー

```
ページ読み込み
  │
  ├── 1. site_contents テーブルから全データ取得
  ├── 2. karuta_cards テーブルからデータ取得（sort_order順）
  ├── 3. activity_cards テーブルからデータ取得（sort_order順）
  ├── 4. faq_items テーブルからデータ取得（sort_order順）
  │
  ▼
各セクションに動的反映
  │
  ├── ヒーローセクション描画（サブタイトル・ボタン）
  ├── サークル紹介セクション描画（紹介文・説明文・画像）
  ├── 百人一首セクション描画（カード一覧）
  ├── 活動内容セクション描画（カード内容）
  ├── FAQ セクション描画（質問・回答一覧）
  └── お問い合わせセクション描画（SNS URL・メール）
```

### 6.2 フォールバック

データベースからの取得に失敗した場合、HTMLにハードコーディングされたデフォルト値を表示する（ユーザー体験の維持）。

---

## 7. セキュリティ

### 7.1 既存方針の踏襲
- 管理画面のパスワード認証は既存の仕組みを継続利用
- RLSで読み取りは全員許可、書き込みも全員許可（簡易認証のため）
- フロントエンド側でパスワード認証を行う（既存と同様）

### 7.2 注意事項
- `site_contents`の`field_value`や`activity_cards`の`content`にHTMLを含む場合があるため、公開ページでの表示時にはサニタイズ対象外とする（管理者が入力したHTMLをそのまま表示）

---

## 8. 移行計画

### 8.1 既存データの移行手順

1. Supabaseに新しいテーブル（site_contents, karuta_cards, activity_cards, faq_items）を作成
2. 初期データ投入SQLを実行し、現在のHTMLの内容をデータベースに登録
3. index.htmlを動的表示に切り替え
4. 管理画面に各セクションの編集機能を追加
5. 動作確認後、デプロイ

### 8.2 注意点
- 移行期間中、データベースに初期データが入っていない場合でもサイトが正常に表示されるよう、フォールバック機構を必ず実装する
- 既存の活動報告機能には影響を与えない

---

## 9. 今後の拡張性

本要件で対応しないが、将来的に検討可能な機能：

- [ ] リッチテキストエディタ（WYSIWYG）の導入
- [ ] コンテンツ変更履歴・ロールバック機能
- [ ] 複数管理者対応
- [ ] 下書き / 公開切り替え機能

---

## 10. 承認

| 役割 | 氏名 | 日付 | 署名 |
|------|------|------|------|
| 作成者 | - | 2026/02/10 | - |
| 承認者 | - | - | - |

---

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| 1.0 | 2026/02/10 | 初版作成 |
| 1.1 | 2026/02/10 | ユーザーとの認識合わせを反映 |
