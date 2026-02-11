// ==============================================
// わすらもち会 公開ページ - 動的コンテンツ読み込み
// ==============================================

/**
 * サイトコンテンツをDBから読み込み、DOMを更新する
 */
class SiteLoader {
    constructor() {
        this.siteContents = {};
    }

    /**
     * 全セクションの読み込みを開始
     */
    async load() {
        try {
            // 全データを並列取得
            const [siteContentsRaw, karutaCards, activityCards, faqItems] = await Promise.all([
                supabaseClient.getSiteContents(),
                supabaseClient.getKarutaCards(),
                supabaseClient.getActivityCards(),
                supabaseClient.getFaqItems()
            ]);

            // site_contentsをセクション別に振り分け
            this.siteContents = {};
            siteContentsRaw.forEach(row => {
                if (!this.siteContents[row.section_key]) {
                    this.siteContents[row.section_key] = {};
                }
                this.siteContents[row.section_key][row.field_key] = row.field_value;
            });

            // 各セクションを更新（個別にtry-catchで囲む）
            this.loadHeroSection();
            this.loadAboutSection();
            this.loadKarutaSection(karutaCards);
            this.loadActivitiesSection(activityCards);
            this.loadFaqSection(faqItems);
            this.loadContactSection();

        } catch (error) {
            console.error('サイトコンテンツの読み込みに失敗しました:', error);
            // フォールバック: HTMLのデフォルト値をそのまま表示
        }
    }

    /**
     * ヒーローセクションを更新
     */
    loadHeroSection() {
        try {
            const hero = this.siteContents['hero'];
            if (!hero) return;

            const subtitle = document.getElementById('hero-subtitle');
            if (subtitle && hero.subtitle) {
                subtitle.innerHTML = hero.subtitle;
            }

            const ctaPrimary = document.getElementById('hero-cta-primary');
            if (ctaPrimary) {
                if (hero.cta_primary_text) ctaPrimary.textContent = hero.cta_primary_text;
                if (hero.cta_primary_link) ctaPrimary.href = hero.cta_primary_link;
            }

            const ctaSecondary = document.getElementById('hero-cta-secondary');
            if (ctaSecondary) {
                if (hero.cta_secondary_text) ctaSecondary.textContent = hero.cta_secondary_text;
                if (hero.cta_secondary_link) ctaSecondary.href = hero.cta_secondary_link;
            }
        } catch (error) {
            console.error('ヒーローセクションの更新に失敗:', error);
        }
    }

    /**
     * サークル紹介セクションを更新
     */
    loadAboutSection() {
        try {
            const about = this.siteContents['about'];
            if (!about) return;

            const intro = document.getElementById('about-intro');
            if (intro && about.intro_text) {
                intro.textContent = about.intro_text;
            }

            const description = document.getElementById('about-description');
            if (description && about.description) {
                description.innerHTML = about.description;
            }

            const image = document.getElementById('about-image');
            if (image && about.image) {
                image.src = about.image;
            }
        } catch (error) {
            console.error('サークル紹介セクションの更新に失敗:', error);
        }
    }

    /**
     * 百人一首セクションを更新
     */
    loadKarutaSection(cards) {
        try {
            if (!cards || cards.length === 0) return;

            const grid = document.getElementById('karuta-grid');
            if (!grid) return;

            grid.innerHTML = cards.map(card => `
                <div class="explanation-card">
                    <h3>${this.escapeHtml(card.title)}</h3>
                    ${card.image ? `
                    <div class="explanation-image">
                        <img src="${this.escapeHtml(card.image)}" alt="${this.escapeHtml(card.title)}">
                    </div>
                    ` : ''}
                    <p>${this.escapeHtml(card.description)}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('百人一首セクションの更新に失敗:', error);
        }
    }

    /**
     * 活動内容セクションを更新
     */
    loadActivitiesSection(cards) {
        try {
            if (!cards || cards.length === 0) return;

            const grid = document.getElementById('activities-grid');
            if (!grid) return;

            grid.innerHTML = cards.map(card => `
                <div class="activity-card">
                    <h3>${this.escapeHtml(card.icon)} ${this.escapeHtml(card.title)}</h3>
                    ${card.content}
                </div>
            `).join('');
        } catch (error) {
            console.error('活動内容セクションの更新に失敗:', error);
        }
    }

    /**
     * FAQセクションを更新
     */
    loadFaqSection(items) {
        try {
            if (!items || items.length === 0) return;

            const list = document.getElementById('faq-list');
            if (!list) return;

            list.innerHTML = items.map(item => `
                <div class="faq-item">
                    <div class="faq-question">
                        <span>${this.escapeHtml(item.question)}</span>
                        <span>+</span>
                    </div>
                    <div class="faq-answer">
                        <p>${this.escapeHtml(item.answer)}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('FAQセクションの更新に失敗:', error);
        }
    }

    /**
     * お問い合わせセクションを更新
     */
    loadContactSection() {
        try {
            const contact = this.siteContents['contact'];
            if (!contact) return;

            const line = document.getElementById('contact-line');
            if (line && contact.line_url) {
                line.href = contact.line_url;
            }

            const instagram = document.getElementById('contact-instagram');
            if (instagram && contact.instagram_url) {
                instagram.href = contact.instagram_url;
            }

            const twitter = document.getElementById('contact-twitter');
            if (twitter && contact.twitter_url) {
                twitter.href = contact.twitter_url;
            }

            const email = document.getElementById('contact-email');
            if (email && contact.email) {
                email.href = `mailto:${contact.email}`;
            }
        } catch (error) {
            console.error('お問い合わせセクションの更新に失敗:', error);
        }
    }

    /**
     * HTMLエスケープ
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    const siteLoader = new SiteLoader();
    siteLoader.load();
});
