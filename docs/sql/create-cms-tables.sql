-- =============================================================
-- サイト全体CMS化 テーブル作成 + 初期データ投入SQL
-- 作成日: 2026-02-11
-- Supabase SQL Editor で実行してください
-- =============================================================

-- -------------------------------------------------------------
-- 1. update_updated_at 関数（未作成の場合のみ）
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------
-- 2. テーブル作成
-- -------------------------------------------------------------

-- 2-1. site_contents テーブル（キー・バリュー形式）
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

-- 2-2. karuta_cards テーブル（百人一首カード）
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

-- 2-3. activity_cards テーブル（活動内容カード）
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

-- 2-4. faq_items テーブル（FAQ）
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

-- -------------------------------------------------------------
-- 3. 初期データ投入
-- -------------------------------------------------------------

-- 3-1. ヒーローセクション
INSERT INTO site_contents (section_key, field_key, field_value) VALUES
  ('hero', 'subtitle', '札幌市で活動する<br>競技かるたサークルです'),
  ('hero', 'cta_primary_text', '体験参加申し込み'),
  ('hero', 'cta_primary_link', '#contact'),
  ('hero', 'cta_secondary_text', 'サークルについて'),
  ('hero', 'cta_secondary_link', '#about');

-- 3-2. サークル紹介
INSERT INTO site_contents (section_key, field_key, field_value) VALUES
  ('about', 'intro_text', '札幌で競技かるたをしたい人達が集まるサークルです'),
  ('about', 'description', '<span class="highlight">高校生から社会人まで、</span>たくさんの人達が一緒に競技かるたを楽しんでいます。現在<span class="highlight">約20名程で</span>活動しています。'),
  ('about', 'image', '/images/rensyuu_huukei.jpeg');

-- 3-3. お問い合わせ（SNS URL・メール）
INSERT INTO site_contents (section_key, field_key, field_value) VALUES
  ('contact', 'line_url', 'https://line.me/ti/p/@721raufe'),
  ('contact', 'instagram_url', 'https://www.instagram.com/wasuramochi_karuta/'),
  ('contact', 'twitter_url', 'https://twitter.com/karuta12346'),
  ('contact', 'email', 'poponta2020@gmail.com');

-- 3-4. 百人一首・競技かるたとは カード
INSERT INTO karuta_cards (title, image, description, sort_order) VALUES
  ('小倉百人一首', '/images/IMG_6720.jpeg', '平安時代から伝わる100首の和歌。美しい日本語の響きと深い情感を味わえる古典文学の宝庫です。', 1),
  ('競技かるた', '/images/tsukite.jpeg', '百人一首を使った競技スポーツ。瞬発力、記憶力、集中力が求められる「畳の上の格闘技」とも呼ばれます。', 2);

-- 3-5. 活動内容カード（3枚固定）
INSERT INTO activity_cards (icon, title, content, sort_order) VALUES
  ('📍', '練習場所', '<p><strong>かでる2・7</strong><br>中央区北2条西7丁目<br>17:00-21:00</p><br><p><strong>東区民センター</strong><br>東区北11条東7丁目<br>18:00-22:00</p><br><p><strong>中央区民センター</strong><br>中央区南2条西10丁目<br>18:00-21:00</p><br><p>※2, 3試合でスケジュールを組んでいるので、途中参加・退出も可能です</p>', 1),
  ('📅', '活動頻度', '<p><strong>週2回</strong><br>（曜日は流動的）</p><br><p>メンバーの都合に合わせて柔軟にスケジュールを調整しています。</p>', 2),
  ('💰', '参加費用', '<p><strong>年会費：無料</strong></p><p><strong>高校生以下：完全無料</strong></p><p><strong>大学生以上：参加人数によって変動します。<br>社会人：大学生＝３：１の割合で和室使用料を按分します。</strong></p>', 3);

-- 3-6. FAQ項目
INSERT INTO faq_items (question, answer, sort_order) VALUES
  ('百人一首を全く知らないのですが、参加できますか？', 'もちろんです！初心者大歓迎です。百人一首の基本的なルールから和歌の覚え方まで、メンバーが丁寧に教えます。まずは体験参加してみてください。', 1),
  ('どのくらいで上達できますか？', '個人差はありますが、週2回程度の参加で2-4ヶ月もあれば基本的な試合ができるようになります。1年程度でD-C級、2-3年でB-A級を目指せます。', 2),
  ('必要な道具はありますか？', '練習用の札はサークルで用意しているので、特に必要ありません。', 3),
  ('年齢制限はありますか？', '年齢制限はございません。現在のメンバーは高校生から社会人まで幅広い年齢層の方が参加されています。', 4),
  ('見学だけでも大丈夫ですか？', '見学だけでも大歓迎です！実際の練習風景を見ていただけば、雰囲気がよく分かると思います。見学の際は事前にご連絡いただければと思います。', 5);

-- =============================================================
-- 実行完了
-- =============================================================
