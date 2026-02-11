// ==============================================
// わすらもち会 公開ページ - 動的コンテンツローダー
// ==============================================

class SiteLoader {
    constructor() {
        this.client = supabaseClient;
        this.loadAll();
    }

    async loadAll() {
        // 各セクションを並列で読み込み（失敗してもHTMLデフォルト値を表示）
        await Promise.allSettled([
            this.loadHeroSection(),
            this.loadAboutSection(),
            this.loadKarutaSection(),
            this.loadActivitiesSection(),
            this.loadFaqSection(),
            this.loadContactSection()
        ]);
    }

    async loadHeroSection() {
        try {
            const data = await this.client.getSiteContents('hero');
            if (!data || data.length === 0) return;

            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            const subtitle = document.getElementById('hero-subtitle');
            if (subtitle && fields.subtitle) subtitle.innerHTML = fields.subtitle;

            const ctaPrimary = document.getElementById('hero-cta-primary');
            if (ctaPrimary) {
                if (fields.cta_primary_text) ctaPrimary.textContent = fields.cta_primary_text;
                if (fields.cta_primary_link) ctaPrimary.href = fields.cta_primary_link;
            }

            const ctaSecondary = document.getElementById('hero-cta-secondary');
            if (ctaSecondary) {
                if (fields.cta_secondary_text) ctaSecondary.textContent = fields.cta_secondary_text;
                if (fields.cta_secondary_link) ctaSecondary.href = fields.cta_secondary_link;
            }
        } catch (error) {
            console.warn('ヒーローセクション読み込みスキップ:', error);
        }
    }

    async loadAboutSection() {
        try {
            const data = await this.client.getSiteContents('about');
            if (!data || data.length === 0) return;

            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            const intro = document.getElementById('about-intro');
            if (intro && fields.intro) intro.textContent = fields.intro;

            const description = document.getElementById('about-description');
            if (description && fields.description) description.innerHTML = fields.description;

            const image = document.getElementById('about-image');
            if (image && fields.image) image.src = fields.image;
        } catch (error) {
            console.warn('サークル紹介セクション読み込みスキップ:', error);
        }
    }

    async loadKarutaSection() {
        try {
            const cards = await this.client.getKarutaCards();
            if (!cards || cards.length === 0) return;

            const grid = document.getElementById('karuta-grid');
            if (!grid) return;

            grid.innerHTML = cards.map(card => `
                <div class="explanation-card">
                    <h3>${this.escapeHtml(card.title)}</h3>
                    ${card.image ? `<div class="explanation-image"><img src="${card.image}" alt="${this.escapeHtml(card.title)}"></div>` : ''}
                    <p>${this.escapeHtml(card.description)}</p>
                </div>
            `).join('');
        } catch (error) {
            console.warn('百人一首セクション読み込みスキップ:', error);
        }
    }

    async loadActivitiesSection() {
        try {
            const cards = await this.client.getActivityCards();
            if (!cards || cards.length === 0) return;

            const grid = document.getElementById('activities-grid');
            if (!grid) return;

            grid.innerHTML = cards.map(card => `
                <div class="activity-card">
                    <h3>${this.escapeHtml(card.icon || '')} ${this.escapeHtml(card.title)}</h3>
                    <p>${card.body || ''}</p>
                </div>
            `).join('');
        } catch (error) {
            console.warn('活動内容セクション読み込みスキップ:', error);
        }
    }

    async loadFaqSection() {
        try {
            const items = await this.client.getFaqItems();
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
            console.warn('FAQセクション読み込みスキップ:', error);
        }
    }

    async loadContactSection() {
        try {
            const data = await this.client.getSiteContents('contact');
            if (!data || data.length === 0) return;

            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            const line = document.getElementById('contact-line');
            if (line && fields.line_url) line.href = fields.line_url;

            const instagram = document.getElementById('contact-instagram');
            if (instagram && fields.instagram_url) instagram.href = fields.instagram_url;

            const twitter = document.getElementById('contact-twitter');
            if (twitter && fields.twitter_url) twitter.href = fields.twitter_url;

            const email = document.getElementById('contact-email');
            if (email && fields.email) email.href = `mailto:${fields.email}`;
        } catch (error) {
            console.warn('お問い合わせセクション読み込みスキップ:', error);
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', () => {
    new SiteLoader();
});
