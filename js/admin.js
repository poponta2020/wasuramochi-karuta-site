// ==============================================
// わすらもち会 サイト管理システム - 管理画面ロジック
// ==============================================

/**
 * 管理画面のメインクラス
 */
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentView = 'login';
        this.currentSection = 'reports';
        this.editingReportId = null;
        this.uploadedImages = [];

        // 百人一首カード・FAQのデータキャッシュ
        this.karutaCards = [];
        this.faqItems = [];
        this.activityCards = [];

        // 画像アップロード用の一時URL
        this.aboutImageUrl = '';
        this.karutaImageUrl = '';

        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.checkSession();
        this.setupEventListeners();
        this.setupSidebar();
        this.setupCmsForms();
    }

    /**
     * セッション確認
     */
    checkSession() {
        const session = localStorage.getItem('admin_session');
        if (session) {
            this.isLoggedIn = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    // ==============================================
    // イベントリスナー設定
    // ==============================================

    setupEventListeners() {
        // ログインフォーム
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // 新規作成ボタン
        document.addEventListener('click', (e) => {
            if (e.target.matches('#create-new-btn') || e.target.closest('#create-new-btn')) {
                this.showEditForm();
            }
        });

        // 編集ボタン
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const reportId = editBtn.dataset.id;
                this.showEditForm(reportId);
            }
        });

        // 削除ボタン
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const reportId = deleteBtn.dataset.id;
                this.showDeleteConfirm(reportId);
            }
        });

        // ログアウトボタン
        document.addEventListener('click', (e) => {
            if (e.target.matches('#logout-btn') || e.target.closest('#logout-btn')) {
                this.handleLogout();
            }
        });

        // 編集フォーム送信
        const editForm = document.getElementById('edit-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleSave(e));
        }

        // キャンセルボタン
        document.addEventListener('click', (e) => {
            if (e.target.matches('#cancel-btn') || e.target.closest('#cancel-btn')) {
                this.showDashboard();
            }
        });

        // 画像アップロードエリア
        this.setupImageUpload();

        // モーダルの閉じるボタン
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-cancel') || e.target.closest('.modal-cancel')) {
                this.hideModal();
            }
            if (e.target.matches('.modal-confirm') || e.target.closest('.modal-confirm')) {
                this.confirmDelete();
            }
        });
    }

    // ==============================================
    // サイドバー・セクション切り替え
    // ==============================================

    setupSidebar() {
        // サイドバーナビゲーション
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            sidebarNav.addEventListener('click', (e) => {
                const link = e.target.closest('[data-section]');
                if (!link) return;
                e.preventDefault();

                const section = link.dataset.section;
                this.switchSection(section);

                // モバイルではサイドバーを閉じる
                this.closeSidebar();
            });
        }

        // モバイル用サイドバートグル
        const toggle = document.getElementById('sidebar-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleSidebar());
        }
    }

    switchSection(sectionName) {
        this.currentSection = sectionName;

        // サイドバーのアクティブ状態を更新
        document.querySelectorAll('.sidebar-nav a').forEach(a => {
            a.classList.toggle('active', a.dataset.section === sectionName);
        });

        // セクション表示切り替え
        document.querySelectorAll('.admin-section').forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });

        const target = document.getElementById(`section-${sectionName}`);
        if (target) {
            target.classList.add('active');
            target.style.display = 'block';
        }

        // セクションごとのデータロード
        switch (sectionName) {
            case 'reports':
                this.loadReportsList();
                break;
            case 'hero':
                this.loadHeroEdit();
                break;
            case 'about':
                this.loadAboutEdit();
                break;
            case 'karuta':
                this.loadKarutaEdit();
                break;
            case 'activities':
                this.loadActivitiesEdit();
                break;
            case 'faq':
                this.loadFaqEdit();
                break;
            case 'contact':
                this.loadContactEdit();
                break;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('admin-sidebar');
        sidebar.classList.toggle('open');

        // オーバーレイの制御
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => this.closeSidebar());
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('show', sidebar.classList.contains('open'));
    }

    closeSidebar() {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar) sidebar.classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
    }

    // ==============================================
    // CMS フォームイベント設定
    // ==============================================

    setupCmsForms() {
        // ヒーローフォーム
        const heroForm = document.getElementById('hero-form');
        if (heroForm) heroForm.addEventListener('submit', (e) => this.saveHero(e));

        // サークル紹介フォーム
        const aboutForm = document.getElementById('about-form');
        if (aboutForm) aboutForm.addEventListener('submit', (e) => this.saveAbout(e));

        // サークル紹介画像アップロード
        this.setupSingleImageUpload('about-image-upload', 'about-image-input', 'about-image-preview', (url) => {
            this.aboutImageUrl = url;
        });

        // 百人一首カード
        const karutaAddBtn = document.getElementById('karuta-add-btn');
        if (karutaAddBtn) karutaAddBtn.addEventListener('click', () => this.showKarutaForm());

        const karutaForm = document.getElementById('karuta-form');
        if (karutaForm) karutaForm.addEventListener('submit', (e) => this.saveKarutaCard(e));

        const karutaCancelBtn = document.getElementById('karuta-cancel-btn');
        if (karutaCancelBtn) karutaCancelBtn.addEventListener('click', () => this.hideKarutaForm());

        this.setupSingleImageUpload('karuta-image-upload', 'karuta-image-input', 'karuta-image-preview', (url) => {
            this.karutaImageUrl = url;
        });

        // 百人一首カードの編集・削除・並び替えボタン（イベント委任）
        const karutaList = document.getElementById('karuta-list');
        if (karutaList) {
            karutaList.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = btn.dataset.id;
                if (btn.classList.contains('karuta-edit-btn')) this.showKarutaForm(id);
                if (btn.classList.contains('karuta-delete-btn')) this.deleteKarutaCard(id);
                if (btn.classList.contains('karuta-move-up')) this.moveKarutaCard(id, 'up');
                if (btn.classList.contains('karuta-move-down')) this.moveKarutaCard(id, 'down');
            });
        }

        // 活動内容フォーム
        const activitiesForm = document.getElementById('activities-form');
        if (activitiesForm) activitiesForm.addEventListener('submit', (e) => this.saveActivities(e));

        // FAQカード
        const faqAddBtn = document.getElementById('faq-add-btn');
        if (faqAddBtn) faqAddBtn.addEventListener('click', () => this.showFaqForm());

        const faqForm = document.getElementById('faq-form');
        if (faqForm) faqForm.addEventListener('submit', (e) => this.saveFaqItem(e));

        const faqCancelBtn = document.getElementById('faq-cancel-btn');
        if (faqCancelBtn) faqCancelBtn.addEventListener('click', () => this.hideFaqForm());

        // FAQの編集・削除・並び替えボタン（イベント委任）
        const faqListAdmin = document.getElementById('faq-list-admin');
        if (faqListAdmin) {
            faqListAdmin.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const id = btn.dataset.id;
                if (btn.classList.contains('faq-edit-btn')) this.showFaqForm(id);
                if (btn.classList.contains('faq-delete-btn')) this.deleteFaqItem(id);
                if (btn.classList.contains('faq-move-up')) this.moveFaqItem(id, 'up');
                if (btn.classList.contains('faq-move-down')) this.moveFaqItem(id, 'down');
            });
        }

        // お問い合わせフォーム
        const contactForm = document.getElementById('contact-form');
        if (contactForm) contactForm.addEventListener('submit', (e) => this.saveContact(e));
    }

    /**
     * 単一画像アップロードの汎用セットアップ
     */
    setupSingleImageUpload(uploadAreaId, inputId, previewId, onSuccess) {
        const uploadArea = document.getElementById(uploadAreaId);
        const fileInput = document.getElementById(inputId);
        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                this.handleSingleImageUpload(e.dataTransfer.files[0], previewId, onSuccess);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleSingleImageUpload(e.target.files[0], previewId, onSuccess);
            }
            fileInput.value = '';
        });
    }

    async handleSingleImageUpload(file, previewId, onSuccess) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            this.showAlert('対応していないファイル形式です', 'error');
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            this.showAlert('ファイルサイズが大きすぎます', 'error');
            return;
        }

        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = '<p>アップロード中...</p>';
        }

        try {
            const result = await cloudinaryUploader.uploadImage(file);
            if (preview) {
                preview.innerHTML = `<img src="${result.url}" alt="プレビュー">`;
            }
            onSuccess(result.url);
            this.showAlert('画像をアップロードしました', 'success');
        } catch (error) {
            console.error('画像アップロードエラー:', error);
            if (preview) preview.innerHTML = '';
            this.showAlert('画像のアップロードに失敗しました', 'error');
        }
    }

    // ==============================================
    // ヒーロー編集
    // ==============================================

    async loadHeroEdit() {
        try {
            const data = await supabaseClient.getSiteContents('hero');
            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            document.getElementById('hero-subtitle-input').value = fields.subtitle || '';
            document.getElementById('hero-cta-primary-text').value = fields.cta_primary_text || '';
            document.getElementById('hero-cta-primary-link').value = fields.cta_primary_link || '';
            document.getElementById('hero-cta-secondary-text').value = fields.cta_secondary_text || '';
            document.getElementById('hero-cta-secondary-link').value = fields.cta_secondary_link || '';
        } catch (error) {
            console.error('ヒーローデータの読み込みに失敗:', error);
            this.showAlert('データの読み込みに失敗しました', 'error');
        }
    }

    async saveHero(e) {
        e.preventDefault();
        try {
            await supabaseClient.updateSiteContents('hero', {
                subtitle: document.getElementById('hero-subtitle-input').value,
                cta_primary_text: document.getElementById('hero-cta-primary-text').value,
                cta_primary_link: document.getElementById('hero-cta-primary-link').value,
                cta_secondary_text: document.getElementById('hero-cta-secondary-text').value,
                cta_secondary_link: document.getElementById('hero-cta-secondary-link').value
            });
            this.showAlert('ヒーローセクションを保存しました', 'success');
        } catch (error) {
            console.error('保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // サークル紹介編集
    // ==============================================

    async loadAboutEdit() {
        try {
            const data = await supabaseClient.getSiteContents('about');
            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            document.getElementById('about-intro-input').value = fields.intro_text || '';
            document.getElementById('about-description-input').value = fields.description || '';

            this.aboutImageUrl = fields.image || '';
            const preview = document.getElementById('about-image-preview');
            if (preview && this.aboutImageUrl) {
                preview.innerHTML = `<img src="${this.aboutImageUrl}" alt="プレビュー">`;
            }
        } catch (error) {
            console.error('サークル紹介データの読み込みに失敗:', error);
            this.showAlert('データの読み込みに失敗しました', 'error');
        }
    }

    async saveAbout(e) {
        e.preventDefault();
        try {
            await supabaseClient.updateSiteContents('about', {
                intro_text: document.getElementById('about-intro-input').value,
                description: document.getElementById('about-description-input').value,
                image: this.aboutImageUrl
            });
            this.showAlert('サークル紹介を保存しました', 'success');
        } catch (error) {
            console.error('保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // 百人一首カード管理
    // ==============================================

    async loadKarutaEdit() {
        const list = document.getElementById('karuta-list');
        list.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';
        this.hideKarutaForm();

        try {
            this.karutaCards = await supabaseClient.getKarutaCards();
            this.renderKarutaList();
        } catch (error) {
            console.error('百人一首カードの読み込みに失敗:', error);
            list.innerHTML = '<div class="empty-state"><p>データの読み込みに失敗しました</p></div>';
        }
    }

    renderKarutaList() {
        const list = document.getElementById('karuta-list');
        if (this.karutaCards.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>カードがありません</p></div>';
            return;
        }

        list.innerHTML = this.karutaCards.map((card, index) => `
            <div class="card-list-item">
                ${card.image ? `<img src="${this.escapeHtml(card.image)}" alt="" class="card-list-thumbnail">` : ''}
                <div class="card-list-info">
                    <h4>${this.escapeHtml(card.title)}</h4>
                    <p>${this.escapeHtml(card.description)}</p>
                </div>
                <div class="card-list-actions">
                    <button type="button" class="btn-move karuta-move-up" data-id="${card.id}" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button type="button" class="btn-move karuta-move-down" data-id="${card.id}" ${index === this.karutaCards.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary karuta-edit-btn" data-id="${card.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger karuta-delete-btn" data-id="${card.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showKarutaForm(id = null) {
        const container = document.getElementById('karuta-form-container');
        container.style.display = 'block';
        document.getElementById('karuta-form').reset();
        document.getElementById('karuta-image-preview').innerHTML = '';
        this.karutaImageUrl = '';

        if (id) {
            const card = this.karutaCards.find(c => c.id === id);
            if (card) {
                document.getElementById('karuta-edit-id').value = id;
                document.getElementById('karuta-title-input').value = card.title;
                document.getElementById('karuta-description-input').value = card.description;
                this.karutaImageUrl = card.image || '';
                if (this.karutaImageUrl) {
                    document.getElementById('karuta-image-preview').innerHTML = `<img src="${this.karutaImageUrl}" alt="プレビュー">`;
                }
                document.getElementById('karuta-form-title').innerHTML = '<i class="fas fa-edit"></i> カード編集';
            }
        } else {
            document.getElementById('karuta-edit-id').value = '';
            document.getElementById('karuta-form-title').innerHTML = '<i class="fas fa-plus"></i> カード追加';
        }

        container.scrollIntoView({ behavior: 'smooth' });
    }

    hideKarutaForm() {
        document.getElementById('karuta-form-container').style.display = 'none';
    }

    async saveKarutaCard(e) {
        e.preventDefault();
        const id = document.getElementById('karuta-edit-id').value;
        const data = {
            title: document.getElementById('karuta-title-input').value,
            description: document.getElementById('karuta-description-input').value,
            image: this.karutaImageUrl
        };

        try {
            if (id) {
                await supabaseClient.updateKarutaCard(id, data);
                this.showAlert('カードを更新しました', 'success');
            } else {
                const maxOrder = this.karutaCards.reduce((max, c) => Math.max(max, c.sort_order), 0);
                data.sort_order = maxOrder + 1;
                await supabaseClient.createKarutaCard(data);
                this.showAlert('カードを追加しました', 'success');
            }
            this.loadKarutaEdit();
        } catch (error) {
            console.error('カードの保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    async deleteKarutaCard(id) {
        if (!confirm('このカードを削除しますか？')) return;
        try {
            await supabaseClient.deleteKarutaCard(id);
            this.showAlert('カードを削除しました', 'success');
            this.loadKarutaEdit();
        } catch (error) {
            console.error('削除に失敗:', error);
            this.showAlert('削除に失敗しました', 'error');
        }
    }

    async moveKarutaCard(id, direction) {
        const index = this.karutaCards.findIndex(c => c.id === id);
        if (index === -1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= this.karutaCards.length) return;

        const current = this.karutaCards[index];
        const swap = this.karutaCards[swapIndex];

        try {
            await Promise.all([
                supabaseClient.updateKarutaCard(current.id, { sort_order: swap.sort_order }),
                supabaseClient.updateKarutaCard(swap.id, { sort_order: current.sort_order })
            ]);
            this.loadKarutaEdit();
        } catch (error) {
            console.error('並び替えに失敗:', error);
            this.showAlert('並び替えに失敗しました', 'error');
        }
    }

    // ==============================================
    // 活動内容編集
    // ==============================================

    async loadActivitiesEdit() {
        const container = document.getElementById('activities-cards-container');
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';

        try {
            this.activityCards = await supabaseClient.getActivityCards();
            container.innerHTML = this.activityCards.map((card, index) => `
                <div class="activity-card-form">
                    <h3>${this.escapeHtml(card.icon)} ${this.escapeHtml(card.title)}</h3>
                    <input type="hidden" class="activity-id" value="${card.id}">
                    <div class="form-group">
                        <label>アイコン（絵文字）</label>
                        <input type="text" class="activity-icon" value="${this.escapeHtml(card.icon)}" placeholder="例: 📍">
                    </div>
                    <div class="form-group">
                        <label>タイトル</label>
                        <input type="text" class="activity-title" value="${this.escapeHtml(card.title)}" placeholder="例: 練習場所">
                    </div>
                    <div class="form-group">
                        <label>本文（HTML対応）</label>
                        <textarea class="activity-content" rows="6">${this.escapeHtml(card.content)}</textarea>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('活動内容の読み込みに失敗:', error);
            container.innerHTML = '<div class="empty-state"><p>データの読み込みに失敗しました</p></div>';
        }
    }

    async saveActivities(e) {
        e.preventDefault();
        const forms = document.querySelectorAll('.activity-card-form');

        try {
            const promises = Array.from(forms).map(form => {
                const id = form.querySelector('.activity-id').value;
                return supabaseClient.updateActivityCard(id, {
                    icon: form.querySelector('.activity-icon').value,
                    title: form.querySelector('.activity-title').value,
                    content: form.querySelector('.activity-content').value
                });
            });

            await Promise.all(promises);
            this.showAlert('活動内容を保存しました', 'success');
        } catch (error) {
            console.error('保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // FAQ管理
    // ==============================================

    async loadFaqEdit() {
        const list = document.getElementById('faq-list-admin');
        list.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';
        this.hideFaqForm();

        try {
            this.faqItems = await supabaseClient.getFaqItems();
            this.renderFaqList();
        } catch (error) {
            console.error('FAQの読み込みに失敗:', error);
            list.innerHTML = '<div class="empty-state"><p>データの読み込みに失敗しました</p></div>';
        }
    }

    renderFaqList() {
        const list = document.getElementById('faq-list-admin');
        if (this.faqItems.length === 0) {
            list.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>FAQがありません</p></div>';
            return;
        }

        list.innerHTML = this.faqItems.map((item, index) => `
            <div class="card-list-item">
                <div class="card-list-info">
                    <h4>${this.escapeHtml(item.question)}</h4>
                    <p>${this.escapeHtml(item.answer)}</p>
                </div>
                <div class="card-list-actions">
                    <button type="button" class="btn-move faq-move-up" data-id="${item.id}" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button type="button" class="btn-move faq-move-down" data-id="${item.id}" ${index === this.faqItems.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary faq-edit-btn" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-danger faq-delete-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showFaqForm(id = null) {
        const container = document.getElementById('faq-form-container');
        container.style.display = 'block';
        document.getElementById('faq-form').reset();

        if (id) {
            const item = this.faqItems.find(f => f.id === id);
            if (item) {
                document.getElementById('faq-edit-id').value = id;
                document.getElementById('faq-question-input').value = item.question;
                document.getElementById('faq-answer-input').value = item.answer;
                document.getElementById('faq-form-title').innerHTML = '<i class="fas fa-edit"></i> FAQ編集';
            }
        } else {
            document.getElementById('faq-edit-id').value = '';
            document.getElementById('faq-form-title').innerHTML = '<i class="fas fa-plus"></i> FAQ追加';
        }

        container.scrollIntoView({ behavior: 'smooth' });
    }

    hideFaqForm() {
        document.getElementById('faq-form-container').style.display = 'none';
    }

    async saveFaqItem(e) {
        e.preventDefault();
        const id = document.getElementById('faq-edit-id').value;
        const data = {
            question: document.getElementById('faq-question-input').value,
            answer: document.getElementById('faq-answer-input').value
        };

        try {
            if (id) {
                await supabaseClient.updateFaqItem(id, data);
                this.showAlert('FAQを更新しました', 'success');
            } else {
                const maxOrder = this.faqItems.reduce((max, f) => Math.max(max, f.sort_order), 0);
                data.sort_order = maxOrder + 1;
                await supabaseClient.createFaqItem(data);
                this.showAlert('FAQを追加しました', 'success');
            }
            this.loadFaqEdit();
        } catch (error) {
            console.error('FAQの保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    async deleteFaqItem(id) {
        if (!confirm('このFAQを削除しますか？')) return;
        try {
            await supabaseClient.deleteFaqItem(id);
            this.showAlert('FAQを削除しました', 'success');
            this.loadFaqEdit();
        } catch (error) {
            console.error('削除に失敗:', error);
            this.showAlert('削除に失敗しました', 'error');
        }
    }

    async moveFaqItem(id, direction) {
        const index = this.faqItems.findIndex(f => f.id === id);
        if (index === -1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= this.faqItems.length) return;

        const current = this.faqItems[index];
        const swap = this.faqItems[swapIndex];

        try {
            await Promise.all([
                supabaseClient.updateFaqItem(current.id, { sort_order: swap.sort_order }),
                supabaseClient.updateFaqItem(swap.id, { sort_order: current.sort_order })
            ]);
            this.loadFaqEdit();
        } catch (error) {
            console.error('並び替えに失敗:', error);
            this.showAlert('並び替えに失敗しました', 'error');
        }
    }

    // ==============================================
    // お問い合わせ編集
    // ==============================================

    async loadContactEdit() {
        try {
            const data = await supabaseClient.getSiteContents('contact');
            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            document.getElementById('contact-line-input').value = fields.line_url || '';
            document.getElementById('contact-instagram-input').value = fields.instagram_url || '';
            document.getElementById('contact-twitter-input').value = fields.twitter_url || '';
            document.getElementById('contact-email-input').value = fields.email || '';
        } catch (error) {
            console.error('お問い合わせデータの読み込みに失敗:', error);
            this.showAlert('データの読み込みに失敗しました', 'error');
        }
    }

    async saveContact(e) {
        e.preventDefault();
        try {
            await supabaseClient.updateSiteContents('contact', {
                line_url: document.getElementById('contact-line-input').value,
                instagram_url: document.getElementById('contact-instagram-input').value,
                twitter_url: document.getElementById('contact-twitter-input').value,
                email: document.getElementById('contact-email-input').value
            });
            this.showAlert('お問い合わせ情報を保存しました', 'success');
        } catch (error) {
            console.error('保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // 既存：ログイン・活動報告機能（変更なし）
    // ==============================================

    handleLogin(e) {
        e.preventDefault();
        const passwordInput = document.getElementById('password');
        const errorElement = document.getElementById('login-error');
        const password = passwordInput.value;

        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_session', Date.now().toString());
            this.isLoggedIn = true;
            errorElement.classList.remove('show');
            this.showDashboard();
        } else {
            errorElement.classList.add('show');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    handleLogout() {
        localStorage.removeItem('admin_session');
        this.isLoggedIn = false;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }

    async showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';

        // 活動報告セクションをデフォルト表示
        this.switchSection('reports');
    }

    async loadReportsList() {
        const container = document.getElementById('reports-table-body');
        container.innerHTML = '<tr><td colspan="5" class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></td></tr>';

        // 活動報告のビュー状態をリセット
        document.getElementById('dashboard-view').style.display = 'block';
        document.getElementById('edit-view').style.display = 'none';

        try {
            const { data: reports } = await supabaseClient.getReports(1, 100);

            if (!reports || reports.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <i class="fas fa-folder-open"></i>
                            <p>活動報告がありません</p>
                        </td>
                    </tr>
                `;
                return;
            }

            container.innerHTML = reports.map(report => `
                <tr>
                    <td>
                        ${report.images && report.images.length > 0
                            ? `<img src="${report.images[0]}" alt="" class="thumbnail">`
                            : '<div class="no-image">No Image</div>'
                        }
                    </td>
                    <td>${this.escapeHtml(report.date)}</td>
                    <td>${this.escapeHtml(report.title)}</td>
                    <td>${this.escapeHtml((report.description || '').substring(0, 50))}${(report.description || '').length > 50 ? '...' : ''}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary edit-btn" data-id="${report.id}">
                            <i class="fas fa-edit"></i> 編集
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${report.id}">
                            <i class="fas fa-trash"></i> 削除
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('活動報告の読み込みに失敗しました:', error);
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>データの読み込みに失敗しました</p>
                    </td>
                </tr>
            `;
        }
    }

    async showEditForm(reportId = null) {
        document.getElementById('dashboard-view').style.display = 'none';
        document.getElementById('edit-view').style.display = 'block';

        this.currentView = 'edit';
        this.editingReportId = reportId;
        this.uploadedImages = [];

        document.getElementById('edit-form').reset();
        document.getElementById('uploaded-images').innerHTML = '';
        document.getElementById('form-title').textContent = reportId ? '活動報告を編集' : '新規活動報告';

        if (reportId) {
            try {
                const report = await supabaseClient.getReportById(reportId);
                if (report) {
                    document.getElementById('report-date').value = report.date;
                    document.getElementById('report-title').value = report.title;
                    document.getElementById('report-description').value = report.description || '';

                    if (report.images && report.images.length > 0) {
                        this.uploadedImages = [...report.images];
                        this.renderUploadedImages();
                    }
                }
            } catch (error) {
                console.error('データの読み込みに失敗しました:', error);
                this.showAlert('データの読み込みに失敗しました', 'error');
            }
        }
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('image-input');

        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            this.handleImageFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
            fileInput.value = '';
        });

        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.removeImage(index);
            }
        });
    }

    async handleImageFiles(files) {
        const filesArray = Array.from(files);

        for (const file of filesArray) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                this.showAlert('対応していないファイル形式です: ' + file.name, 'error');
                continue;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                this.showAlert('ファイルサイズが大きすぎます: ' + file.name, 'error');
                continue;
            }

            const tempId = 'temp-' + Date.now() + '-' + Math.random();
            const previewUrl = URL.createObjectURL(file);
            this.uploadedImages.push({ tempId, previewUrl, uploading: true });
            this.renderUploadedImages();

            try {
                const result = await cloudinaryUploader.uploadImage(file, (percent) => {
                    this.updateUploadProgress(tempId, percent);
                });

                const index = this.uploadedImages.findIndex(img => img.tempId === tempId);
                if (index !== -1) {
                    this.uploadedImages[index] = result.url;
                }
                this.renderUploadedImages();

            } catch (error) {
                console.error('アップロードエラー:', error);
                const index = this.uploadedImages.findIndex(img => img.tempId === tempId);
                if (index !== -1) {
                    this.uploadedImages.splice(index, 1);
                }
                this.renderUploadedImages();
                this.showAlert('画像のアップロードに失敗しました: ' + file.name, 'error');
            }
        }
    }

    updateUploadProgress(tempId, percent) {
        const progressBar = document.querySelector(`[data-temp-id="${tempId}"] .upload-progress-bar`);
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }

    renderUploadedImages() {
        const container = document.getElementById('uploaded-images');
        if (!container) return;

        container.innerHTML = this.uploadedImages.map((img, index) => {
            if (typeof img === 'string') {
                return `
                    <div class="uploaded-image-item">
                        <img src="${img}" alt="">
                        <button type="button" class="remove-btn" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            } else {
                return `
                    <div class="uploaded-image-item" data-temp-id="${img.tempId}">
                        <img src="${img.previewUrl}" alt="">
                        <div class="upload-progress">
                            <div class="upload-progress-bar" style="width: 0%"></div>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.renderUploadedImages();
    }

    async handleSave(e) {
        e.preventDefault();

        const date = document.getElementById('report-date').value;
        const title = document.getElementById('report-title').value;
        const description = document.getElementById('report-description').value;

        if (!date || !title) {
            this.showAlert('日付とタイトルは必須です', 'error');
            return;
        }

        if (this.uploadedImages.some(img => typeof img !== 'string')) {
            this.showAlert('画像のアップロードが完了するまでお待ちください', 'info');
            return;
        }

        const reportData = {
            date,
            title,
            description,
            images: this.uploadedImages.filter(img => typeof img === 'string')
        };

        try {
            if (this.editingReportId) {
                await supabaseClient.updateReport(this.editingReportId, reportData);
                this.showAlert('活動報告を更新しました', 'success');
            } else {
                await supabaseClient.createReport(reportData);
                this.showAlert('活動報告を作成しました', 'success');
            }

            // 活動報告一覧に戻る
            this.loadReportsList();

        } catch (error) {
            console.error('保存に失敗しました:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    showDeleteConfirm(reportId) {
        this.deletingReportId = reportId;
        document.getElementById('delete-modal').classList.add('show');
    }

    hideModal() {
        document.getElementById('delete-modal').classList.remove('show');
        this.deletingReportId = null;
    }

    async confirmDelete() {
        if (!this.deletingReportId) return;

        try {
            await supabaseClient.deleteReport(this.deletingReportId);
            this.hideModal();
            this.showAlert('活動報告を削除しました', 'success');
            this.loadReportsList();

        } catch (error) {
            console.error('削除に失敗しました:', error);
            this.showAlert('削除に失敗しました', 'error');
        }
    }

    // ==============================================
    // ユーティリティ
    // ==============================================

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;

        alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
