# 実装計画書：公開サイトデザインリニューアル

**作成日**: 2026年2月12日
**対応する要件定義書**: requirements-design-renewal.md v1.0

---

## 進捗サマリー

| フェーズ | 内容 | ステータス |
|---------|------|:----------:|
| 1 | 基本レイアウト変更 | [ ] 未着手 |
| 2 | タイポグラフィ変更 | [ ] 未着手 |
| 3 | 配色・アクセントカラー追加 | [ ] 未着手 |
| 4 | 細部の調整 | [ ] 未着手 |
| 5 | レスポンシブ確認 | [ ] 未着手 |

---

## フェーズ1: 基本レイアウト変更

### タスク一覧
- [ ] 1-1. CSS変数の追加（アクセントカラー）
- [ ] 1-2. セクションpadding/margin調整
- [ ] 1-3. コンテンツ最大幅の縮小（1200px → 900px）
- [ ] 1-4. ナビゲーションバーの透明化（backdrop-filter使用）

### 作業内容

#### 1-1. CSS変数の追加

`style.css` の `:root` セレクターに以下のアクセントカラーを追加：

```css
:root {
  /* 既存のメインカラー（緑）は維持 */
  --primary-green: #2d5016;
  --secondary-green: #4a7c59;
  --light-green: #6fb07a;
  --accent-green: #95c99b;

  /* 新規追加：アクセントカラー */
  --accent-beige: #f5f1e8;
  --accent-purple: #e8e4f3;
  --accent-blue: #e3f2fd;
  --accent-yellow: #fff9e6;

  /* ベースカラー */
  --white: #ffffff;
  --light-gray: #f5f5f5;
  --gray: #888888;
  --dark: #2d3436;
}
```

#### 1-2. セクションpadding/margin調整

**現在のセクションpadding:**
```css
.section {
  padding: 60px 20px; /* モバイル */
}

@media (min-width: 768px) {
  .section {
    padding: 80px 40px; /* デスクトップ */
  }
}
```

**変更後:**
```css
.section {
  padding: 80px 24px; /* モバイル */
}

@media (min-width: 768px) {
  .section {
    padding: 100px 32px; /* タブレット */
  }
}

@media (min-width: 1024px) {
  .section {
    padding: 120px 48px; /* デスクトップ */
  }
}
```

#### 1-3. コンテンツ最大幅の縮小

各セクションで使用されているコンテナの最大幅を統一して縮小：

```css
/* 全セクション共通のコンテナ最大幅 */
.about-content,
.explanation-grid,
.activities-grid,
.events-grid,
.faq-list,
.contact-methods {
  max-width: 900px;
  margin: 0 auto;
}
```

#### 1-4. ナビゲーションバーの透明化

**現在:**
```css
.navbar.show {
  background: var(--primary-green);
}
```

**変更後:**
```css
.navbar.show {
  background: rgba(45, 80, 22, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
```

**フォールバック対応:**
- `backdrop-filter`をサポートしていないブラウザでも透明背景が維持されるよう、`rgba`を使用

---

## フェーズ2: タイポグラフィ変更

### タスク一覧
- [ ] 2-1. 本文フォントサイズの拡大
- [ ] 2-2. 見出しフォントサイズの拡大
- [ ] 2-3. 行間・文字間の調整
- [ ] 2-4. ボタン・ナビゲーションのフォントサイズ調整

### 作業内容

#### 2-1. 本文フォントサイズの拡大

```css
body {
  font-size: 1.125rem; /* 18px（現在は16px） */
  line-height: 1.8; /* 現在は1.6 */
}
```

#### 2-2. 見出しフォントサイズの拡大

```css
h2 {
  font-size: 2.5rem; /* 現在は2rem */
  letter-spacing: 0.05em; /* 追加 */
  line-height: 1.4;
}

h3 {
  font-size: 1.75rem; /* 現在は1.5rem */
  letter-spacing: 0.03em; /* 追加 */
  line-height: 1.5;
}
```

#### 2-3. セクション別のテキスト調整

**サークル紹介:**
```css
.intro-text {
  font-size: 1.25rem; /* 拡大 */
  line-height: 1.8;
}

.about-content p {
  font-size: 1.125rem;
  line-height: 2.0; /* ゆったりと */
}
```

**FAQ:**
```css
.faq-question span:first-child {
  font-size: 1.125rem; /* 読みやすく */
  line-height: 1.7;
}

.faq-answer p {
  font-size: 1.0625rem; /* 17px */
  line-height: 1.9;
}
```

#### 2-4. ボタン・ナビゲーション

```css
.nav-menu a {
  font-size: 1.125rem; /* 現在は1rem */
}

.btn {
  font-size: 1.125rem; /* 現在は1rem */
  padding: 14px 28px; /* 少し大きく */
}
```

---

## フェーズ3: 配色・アクセントカラー追加

### タスク一覧
- [ ] 3-1. セクション別背景色の適用
- [ ] 3-2. カードデザインの微調整（影・角丸）
- [ ] 3-3. ボタンのスタイル調整

### 作業内容

#### 3-1. セクション別背景色の適用

各セクションに交互に背景色を適用して視覚的に区別：

```css
/* デフォルトは白背景 */
.section {
  background: var(--white);
}

/* セクション別アクセント背景 */
.section.about {
  background: var(--accent-beige);
}

.section.karuta-explanation {
  background: var(--accent-purple);
}

.section.activities {
  background: var(--accent-blue);
}

.section.reports {
  background: var(--white); /* 既存の緑を活かす */
}

.section.faq {
  background: var(--accent-yellow);
}

.section.contact {
  background: var(--white); /* CTA強調のため白背景 */
}
```

#### 3-2. カードデザインの微調整

**影を柔らかく:**
```css
.event-card,
.explanation-card,
.activity-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); /* 現在は0.1 */
  border-radius: 16px; /* 現在は8〜12px */
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-card:hover,
.explanation-card:hover,
.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
```

**画像の角丸:**
```css
.about-image img,
.explanation-image img {
  border-radius: 16px; /* 現在は8px */
}
```

#### 3-3. ボタンのスタイル調整

```css
.btn-primary {
  padding: 14px 28px; /* 少し大きく */
  border-radius: 12px; /* 現在は8px */
  box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
}

.btn-secondary {
  padding: 14px 28px;
  border-radius: 12px;
}
```

---

## フェーズ4: 細部の調整

### タスク一覧
- [ ] 4-1. ヒーローセクションの微調整
- [ ] 4-2. FAQアコーディオンのスタイル調整
- [ ] 4-3. お問い合わせボタンのスタイル調整
- [ ] 4-4. フッターのスタイル調整

### 作業内容

#### 4-1. ヒーローセクションの微調整

```css
.hero .subtitle {
  font-size: 1.4rem; /* 現在は1.2rem */
  line-height: 1.8;
  letter-spacing: 0.03em;
}

.cta-buttons {
  gap: 20px; /* ボタン間の余白を増やす */
  margin-top: 40px; /* 上部余白も増やす */
}
```

#### 4-2. FAQアコーディオンのスタイル調整

```css
.faq-item {
  background: var(--white);
  border-radius: 12px; /* 柔らかく */
  margin-bottom: 16px; /* 余白を増やす */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.faq-question {
  padding: 20px 24px; /* 余白を増やす */
}

.faq-answer {
  padding: 0 24px 20px 24px;
}
```

#### 4-3. お問い合わせボタンのスタイル調整

```css
.contact-btn {
  padding: 16px 24px; /* 少し大きく */
  font-size: 1.0625rem; /* 17px */
  border-radius: 12px;
  gap: 12px; /* アイコンとテキストの間隔 */
}
```

#### 4-4. フッターのスタイル調整

```css
.footer {
  padding: 40px 24px; /* 余白を増やす */
  font-size: 0.9375rem; /* 15px */
  line-height: 1.8;
}
```

---

## フェーズ5: レスポンシブ確認

### タスク一覧
- [ ] 5-1. モバイル（〜767px）での表示確認
- [ ] 5-2. タブレット（768px〜1023px）での表示確認
- [ ] 5-3. デスクトップ（1024px〜）での表示確認
- [ ] 5-4. 各ブレークポイントでの余白・フォントサイズ調整

### 確認項目

#### 5-1. モバイル確認項目
- [ ] ナビゲーションのハンバーガーメニューが正常に動作するか
- [ ] セクション間の余白が適切か（詰まりすぎていないか）
- [ ] フォントサイズが読みやすいか（小さすぎないか）
- [ ] ボタンがタップしやすいサイズか
- [ ] 画像が適切に表示されるか
- [ ] カードレイアウトが崩れていないか

#### 5-2. タブレット確認項目
- [ ] 2カラムレイアウトが適切に機能するか
- [ ] 余白が十分にとれているか
- [ ] ナビゲーションの表示が適切か
- [ ] カードグリッドが適切に配置されているか

#### 5-3. デスクトップ確認項目
- [ ] コンテンツ最大幅（900px）が機能しているか
- [ ] 左右の余白が十分にあるか
- [ ] ナビゲーションの透明効果が適用されているか
- [ ] ホバーエフェクトが適切に機能するか
- [ ] すべてのセクションでデザインが統一されているか

#### 5-4. レスポンシブブレークポイント設定

```css
/* モバイル: デフォルト（〜767px） */
.section {
  padding: 80px 24px;
}

h2 {
  font-size: 2rem; /* モバイルでは少し小さく */
}

/* タブレット: 768px〜 */
@media (min-width: 768px) {
  .section {
    padding: 100px 32px;
  }

  h2 {
    font-size: 2.25rem;
  }

  .explanation-grid,
  .activities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* デスクトップ: 1024px〜 */
@media (min-width: 1024px) {
  .section {
    padding: 120px 48px;
  }

  h2 {
    font-size: 2.5rem;
  }

  .explanation-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .activities-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## ファイル変更サマリー

| ファイル | 種別 | 変更内容 |
|---------|------|---------|
| `style.css` | 改修 | デザイン全面刷新（CSS変数追加、余白調整、フォントサイズ変更、配色追加） |
| `index.html` | 微調整 | セクションにクラス追加（背景色用）のみ |

---

## 実装順序と依存関係

```
フェーズ1（基本レイアウト）
    ↓
フェーズ2（タイポグラフィ）
    ↓
フェーズ3（配色・アクセントカラー）
    ↓
フェーズ4（細部調整）
    ↓
フェーズ5（レスポンシブ確認）
```

すべて順次実装。各フェーズ完了後、ブラウザで確認しながら進める。

---

## 実装時の注意事項

### CSS変更の方針
1. **既存のスタイルを上書き**する形で実装
2. **削除せず追加・上書き**を基本とする（フォールバック確保）
3. **レスポンシブデザインは必ず維持**する

### JavaScript機能への影響
- HTML構造はほぼ変更しないため、既存のJavaScript機能に影響なし
- 確認すべき機能：
  - ナビゲーションのスクロール表示
  - ハンバーガーメニュー
  - FAQアコーディオン
  - カルーセル（活動報告）
  - スムーススクロール

### ブラウザ対応
- `backdrop-filter`: Safari 9+, Chrome 76+, Firefox 103+
- フォールバック: `backdrop-filter`未対応でも`rgba`背景で代替表示

### CMS機能との互換性
- `site-loader.js`で動的に読み込まれるコンテンツにも新デザインが適用される
- 管理画面からの編集内容が新デザインで正しく表示されることを確認

---

## デザイン変更後の確認項目

| # | 確認内容 | 確認方法 |
|---|---------|---------|
| 1 | セクション間の余白が適切に増えているか | 目視確認 |
| 2 | フォントサイズが拡大され読みやすくなったか | 本文・見出しを確認 |
| 3 | コンテンツ最大幅が900pxに制限されているか | DevToolsで測定 |
| 4 | ナビゲーションが透明化され、ぼかし効果が適用されているか | スクロールして確認 |
| 5 | セクション別背景色が適用されているか | 全セクションを目視 |
| 6 | カードの影・角丸が柔らかくなっているか | カード要素を確認 |
| 7 | ホバーエフェクトが適切に機能するか | デスクトップで確認 |
| 8 | モバイルで快適に閲覧できるか | スマートフォンで確認 |
| 9 | タブレットで快適に閲覧できるか | タブレットまたはDevToolsで確認 |
| 10 | デスクトップで余白が適切か | 大画面で確認 |
| 11 | 既存のJavaScript機能が正常に動作するか | 各機能を操作 |
| 12 | CMS機能（動的読み込み）が正常に動作するか | 管理画面で編集→公開ページ確認 |
| 13 | 活動報告カルーセルが正常に動作するか | カルーセル操作 |
| 14 | FAQアコーディオンが正常に動作するか | FAQ開閉テスト |

---

## パフォーマンス考慮事項

### CSS最適化
- 不要なスタイルは削除しない（互換性維持）
- 新しいスタイルのみ追加・上書き
- メディアクエリを適切に使用

### 画像最適化
- 既存の画像はそのまま使用
- 新しく追加する場合はWebP形式を推奨

### アニメーション
- `transition`を適切に使用
- 60fps維持を目指す
- `will-change`は必要最小限に

---

## 今後の拡張性

本実装で対応しないが、将来的に検討可能な機能：

- [ ] ダークモード対応（CSS変数を活用）
- [ ] アニメーションライブラリの導入（Intersection Observer API使用）
- [ ] フォントサイズ切り替え機能（アクセシビリティ向上）
- [ ] カスタムカーソル（和風デザイン強化）

---

## 承認

| 役割 | 氏名 | 日付 | 署名 |
|------|------|------|------|
| 作成者 | Claude Sonnet 4.5 | 2026/02/12 | - |
| 承認者 | - | - | - |

---

## 改訂履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| 1.0 | 2026/02/12 | 初版作成 |
