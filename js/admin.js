// ==============================================
// わすらもち会 管理画面 - メインロジック
// ==============================================

class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentSection = null;
        this.editingReportId = null;
        this.uploadedImages = [];
        this.deleteCallback = null;

        this.init();
    }

    // ==============================================
    // 初期化
    // ==============================================

    init() {
        this.checkSession();
        this.setupEventListeners();
    }

    checkSession() {
        const session = localStorage.getItem('admin_session');
        if (session) {
            this.isLoggedIn = true;
            this.showHome();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // ログイン
        const loginForm = document.getElementById('login-form');
        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // ログアウト
        document.addEventListener('click', (e) => {
            if (e.target.matches('#logout-btn') || e.target.closest('#logout-btn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });

        // ホームカード
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.home-card');
            if (card) this.showSection(card.dataset.section);
        });

        // 戻るボタン
        document.addEventListener('click', (e) => {
            const backBtn = e.target.closest('[data-back]');
            if (backBtn) this.goBack();
        });

        // 活動報告：新規作成
        document.addEventListener('click', (e) => {
            if (e.target.matches('#create-new-btn') || e.target.closest('#create-new-btn')) {
                this.showReportForm();
            }
        });

        // 活動報告：編集
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.report-edit-btn');
            if (btn) this.showReportForm(btn.dataset.id);
        });

        // 活動報告：削除
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.report-delete-btn');
            if (btn) this.showDeleteModal('この活動報告を削除しますか？', () => this.deleteReport(btn.dataset.id));
        });

        // 活動報告：キャンセル
        document.addEventListener('click', (e) => {
            if (e.target.matches('#report-cancel-btn') || e.target.closest('#report-cancel-btn')) {
                document.getElementById('reports-list-view').style.display = 'block';
                document.getElementById('reports-edit-view').style.display = 'none';
            }
        });

        // 活動報告：保存
        const editForm = document.getElementById('edit-form');
        if (editForm) editForm.addEventListener('submit', (e) => this.handleReportSave(e));

        // 画像アップロード
        this.setupImageUpload();

        // 汎用削除モーダル
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-cancel') || e.target.closest('.modal-cancel')) {
                this.hideModal();
            }
            if (e.target.matches('.modal-confirm') || e.target.closest('.modal-confirm')) {
                if (this.deleteCallback) {
                    this.deleteCallback();
                    this.hideModal();
                }
            }
        });

        // ======== ヒーロー ========
        const heroForm = document.getElementById('hero-form');
        if (heroForm) heroForm.addEventListener('submit', (e) => this.saveHero(e));

        // ======== サークル紹介 ========
        const aboutForm = document.getElementById('about-form');
        if (aboutForm) aboutForm.addEventListener('submit', (e) => this.saveAbout(e));

        // サークル紹介：画像アップロード
        this.setupSingleImageUpload('about-image-upload', 'about-image-input', 'about-image-preview');

        // ======== 百人一首 ========
        document.addEventListener('click', (e) => {
            if (e.target.matches('#karuta-add-btn') || e.target.closest('#karuta-add-btn')) {
                this.showKarutaForm();
            }
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.karuta-edit-btn');
            if (btn) this.showKarutaForm(btn.dataset.id);
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.karuta-delete-btn');
            if (btn) this.showDeleteModal('このカードを削除しますか？', () => this.deleteKaruta(btn.dataset.id));
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.karuta-move-btn');
            if (btn) this.reorderKaruta(btn.dataset.id, btn.dataset.direction);
        });
        document.addEventListener('click', (e) => {
            if (e.target.matches('#karuta-cancel-btn') || e.target.closest('#karuta-cancel-btn')) {
                document.getElementById('karuta-list-view').style.display = 'block';
                document.getElementById('karuta-edit-view').style.display = 'none';
            }
        });
        const karutaForm = document.getElementById('karuta-form');
        if (karutaForm) karutaForm.addEventListener('submit', (e) => this.saveKaruta(e));
        this.setupSingleImageUpload('karuta-image-upload', 'karuta-image-input', 'karuta-image-preview');

        // ======== 活動内容 ========
        const activitiesForm = document.getElementById('activities-form');
        if (activitiesForm) activitiesForm.addEventListener('submit', (e) => this.saveActivities(e));

        // ======== FAQ ========
        document.addEventListener('click', (e) => {
            if (e.target.matches('#faq-add-btn') || e.target.closest('#faq-add-btn')) {
                this.showFaqForm();
            }
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-edit-btn');
            if (btn) this.showFaqForm(btn.dataset.id);
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-delete-btn');
            if (btn) this.showDeleteModal('このFAQを削除しますか？', () => this.deleteFaq(btn.dataset.id));
        });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-move-btn');
            if (btn) this.reorderFaq(btn.dataset.id, btn.dataset.direction);
        });
        document.addEventListener('click', (e) => {
            if (e.target.matches('#faq-cancel-btn') || e.target.closest('#faq-cancel-btn')) {
                document.getElementById('faq-list-view').style.display = 'block';
                document.getElementById('faq-edit-view').style.display = 'none';
            }
        });
        const faqForm = document.getElementById('faq-form');
        if (faqForm) faqForm.addEventListener('submit', (e) => this.saveFaq(e));

        // ======== お問い合わせ ========
        const contactForm = document.getElementById('contact-form');
        if (contactForm) contactForm.addEventListener('submit', (e) => this.saveContact(e));
    }

    // ==============================================
    // ログイン・ログアウト
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
            this.showHome();
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

    // ==============================================
    // ナビゲーション
    // ==============================================

    showLogin() {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }

    showHome() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('home-view').style.display = 'block';

        // 全セクション非表示
        document.querySelectorAll('.section-view').forEach(el => el.style.display = 'none');
        this.currentSection = null;
    }

    showSection(sectionName) {
        document.getElementById('home-view').style.display = 'none';
        document.querySelectorAll('.section-view').forEach(el => el.style.display = 'none');

        const sectionEl = document.getElementById(`section-${sectionName}`);
        if (sectionEl) {
            sectionEl.style.display = 'block';
            this.currentSection = sectionName;
            this.loadSectionData(sectionName);
        }
    }

    goBack() {
        this.showHome();
    }

    loadSectionData(section) {
        switch (section) {
            case 'reports': this.loadReportsList(); break;
            case 'hero': this.loadHeroForm(); break;
            case 'about': this.loadAboutForm(); break;
            case 'karuta': this.loadKarutaList(); break;
            case 'activities': this.loadActivitiesForm(); break;
            case 'faq': this.loadFaqList(); break;
            case 'contact': this.loadContactForm(); break;
        }
    }

    // ==============================================
    // 汎用: 削除モーダル
    // ==============================================

    showDeleteModal(text, callback) {
        document.getElementById('delete-modal-text').innerHTML = text + '<br>この操作は取り消せません。';
        this.deleteCallback = callback;
        document.getElementById('delete-modal').classList.add('show');
    }

    hideModal() {
        document.getElementById('delete-modal').classList.remove('show');
        this.deleteCallback = null;
    }

    // ==============================================
    // 汎用: アラート
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
        setTimeout(() => alert.remove(), 3000);
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==============================================
    // 活動報告
    // ==============================================

    async loadReportsList() {
        const container = document.getElementById('reports-list');
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';

        // 一覧ビューを表示、編集ビューを非表示
        document.getElementById('reports-list-view').style.display = 'block';
        document.getElementById('reports-edit-view').style.display = 'none';

        try {
            const { data: reports } = await supabaseClient.getReports(1, 100);

            if (!reports || reports.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>活動報告がありません</p></div>';
                return;
            }

            container.innerHTML = reports.map(report => `
                <div class="crud-card">
                    <div class="crud-card-body">
                        <div class="crud-card-thumbnail">
                            ${report.images && report.images.length > 0
                                ? `<img src="${report.images[0]}" alt="">`
                                : '<div class="no-image">No Image</div>'
                            }
                        </div>
                        <div class="crud-card-info">
                            <div class="card-title">${this.escapeHtml(report.title)}</div>
                            <div class="card-meta">${this.escapeHtml(report.date)}</div>
                            <div class="card-excerpt">${this.escapeHtml((report.description || '').substring(0, 60))}</div>
                        </div>
                    </div>
                    <div class="crud-card-actions">
                        <button class="edit-btn report-edit-btn" data-id="${report.id}">
                            <i class="fas fa-edit"></i> 編集
                        </button>
                        <button class="delete-btn report-delete-btn" data-id="${report.id}">
                            <i class="fas fa-trash"></i> 削除
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('活動報告の読み込みに失敗:', error);
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>データの読み込みに失敗しました</p></div>';
        }
    }

    async showReportForm(reportId = null) {
        document.getElementById('reports-list-view').style.display = 'none';
        document.getElementById('reports-edit-view').style.display = 'block';

        this.editingReportId = reportId;
        this.uploadedImages = [];

        document.getElementById('edit-form').reset();
        document.getElementById('uploaded-images').innerHTML = '';
        document.getElementById('report-form-title').textContent = reportId ? '活動報告を編集' : '新規活動報告';

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
                console.error('データの読み込みに失敗:', error);
                this.showAlert('データの読み込みに失敗しました', 'error');
            }
        }
    }

    async handleReportSave(e) {
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
            this.loadReportsList();
        } catch (error) {
            console.error('保存に失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    async deleteReport(id) {
        try {
            await supabaseClient.deleteReport(id);
            this.showAlert('活動報告を削除しました', 'success');
            this.loadReportsList();
        } catch (error) {
            console.error('削除に失敗:', error);
            this.showAlert('削除に失敗しました', 'error');
        }
    }

    // ==============================================
    // 画像アップロード（活動報告用・複数画像）
    // ==============================================

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
            this.handleImageFiles(e.dataTransfer.files);
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
        for (const file of Array.from(files)) {
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
                if (index !== -1) this.uploadedImages[index] = result.url;
                this.renderUploadedImages();
            } catch (error) {
                console.error('アップロードエラー:', error);
                const index = this.uploadedImages.findIndex(img => img.tempId === tempId);
                if (index !== -1) this.uploadedImages.splice(index, 1);
                this.renderUploadedImages();
                this.showAlert('画像のアップロードに失敗しました: ' + file.name, 'error');
            }
        }
    }

    updateUploadProgress(tempId, percent) {
        const bar = document.querySelector(`[data-temp-id="${tempId}"] .upload-progress-bar`);
        if (bar) bar.style.width = percent + '%';
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

    // ==============================================
    // 単一画像アップロード（サークル紹介/百人一首用）
    // ==============================================

    setupSingleImageUpload(areaId, inputId, previewId) {
        const area = document.getElementById(areaId);
        const input = document.getElementById(inputId);
        if (!area || !input) return;

        area.addEventListener('click', () => input.click());

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('drag-over');
        });
        area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('drag-over');
            if (e.dataTransfer.files[0]) this.uploadSingleImage(e.dataTransfer.files[0], previewId);
        });

        input.addEventListener('change', (e) => {
            if (e.target.files[0]) this.uploadSingleImage(e.target.files[0], previewId);
            input.value = '';
        });
    }

    async uploadSingleImage(file, previewId) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            this.showAlert('対応していないファイル形式です', 'error');
            return null;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            this.showAlert('ファイルサイズが大きすぎます', 'error');
            return null;
        }

        const preview = document.getElementById(previewId);
        preview.innerHTML = '<p style="color:#999;font-size:0.9rem;">アップロード中...</p>';

        try {
            const result = await cloudinaryUploader.uploadImage(file);
            preview.innerHTML = `<img src="${result.url}" alt="">`;
            preview.dataset.url = result.url;
            return result.url;
        } catch (error) {
            console.error('画像アップロード失敗:', error);
            preview.innerHTML = '';
            this.showAlert('画像のアップロードに失敗しました', 'error');
            return null;
        }
    }

    // ==============================================
    // ヒーロー
    // ==============================================

    async loadHeroForm() {
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
            console.error('ヒーローデータ読み込み失敗:', error);
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
            this.showAlert('保存しました', 'success');
        } catch (error) {
            console.error('保存失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // サークル紹介
    // ==============================================

    async loadAboutForm() {
        try {
            const data = await supabaseClient.getSiteContents('about');
            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            document.getElementById('about-intro-input').value = fields.intro || '';
            document.getElementById('about-description-input').value = fields.description || '';

            const preview = document.getElementById('about-image-preview');
            if (fields.image) {
                preview.innerHTML = `<img src="${fields.image}" alt="">`;
                preview.dataset.url = fields.image;
            } else {
                preview.innerHTML = '';
                preview.dataset.url = '';
            }
        } catch (error) {
            console.error('サークル紹介データ読み込み失敗:', error);
            this.showAlert('データの読み込みに失敗しました', 'error');
        }
    }

    async saveAbout(e) {
        e.preventDefault();
        try {
            const imageUrl = document.getElementById('about-image-preview').dataset.url || '';
            await supabaseClient.updateSiteContents('about', {
                intro: document.getElementById('about-intro-input').value,
                description: document.getElementById('about-description-input').value,
                image: imageUrl
            });
            this.showAlert('保存しました', 'success');
        } catch (error) {
            console.error('保存失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // 百人一首
    // ==============================================

    karutaItems = [];

    async loadKarutaList() {
        const container = document.getElementById('karuta-list');
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';

        document.getElementById('karuta-list-view').style.display = 'block';
        document.getElementById('karuta-edit-view').style.display = 'none';

        try {
            this.karutaItems = await supabaseClient.getKarutaCards();

            if (this.karutaItems.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-layer-group"></i><p>カードがありません</p></div>';
                return;
            }

            container.innerHTML = this.karutaItems.map((card, idx) => `
                <div class="crud-card">
                    <div class="crud-card-body">
                        <div class="crud-card-thumbnail">
                            ${card.image ? `<img src="${card.image}" alt="">` : '<div class="no-image">No Image</div>'}
                        </div>
                        <div class="crud-card-info">
                            <div class="card-title">${this.escapeHtml(card.title)}</div>
                            <div class="card-excerpt">${this.escapeHtml((card.description || '').substring(0, 50))}</div>
                        </div>
                    </div>
                    <div class="crud-card-actions">
                        ${idx > 0 ? `<button class="move-up-btn karuta-move-btn" data-id="${card.id}" data-direction="up"><i class="fas fa-arrow-up"></i></button>` : '<button disabled><i class="fas fa-arrow-up" style="opacity:0.2"></i></button>'}
                        ${idx < this.karutaItems.length - 1 ? `<button class="move-down-btn karuta-move-btn" data-id="${card.id}" data-direction="down"><i class="fas fa-arrow-down"></i></button>` : '<button disabled><i class="fas fa-arrow-down" style="opacity:0.2"></i></button>'}
                        <button class="edit-btn karuta-edit-btn" data-id="${card.id}"><i class="fas fa-edit"></i> 編集</button>
                        <button class="delete-btn karuta-delete-btn" data-id="${card.id}"><i class="fas fa-trash"></i> 削除</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('百人一首データ読み込み失敗:', error);
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>データの読み込みに失敗しました</p></div>';
        }
    }

    async showKarutaForm(id = null) {
        document.getElementById('karuta-list-view').style.display = 'none';
        document.getElementById('karuta-edit-view').style.display = 'block';

        document.getElementById('karuta-form').reset();
        document.getElementById('karuta-edit-id').value = id || '';
        document.getElementById('karuta-form-title').textContent = id ? 'カード編集' : 'カード追加';

        const preview = document.getElementById('karuta-image-preview');
        preview.innerHTML = '';
        preview.dataset.url = '';

        if (id) {
            const card = this.karutaItems.find(c => c.id === id);
            if (card) {
                document.getElementById('karuta-title-input').value = card.title;
                document.getElementById('karuta-description-input').value = card.description || '';
                if (card.image) {
                    preview.innerHTML = `<img src="${card.image}" alt="">`;
                    preview.dataset.url = card.image;
                }
            }
        }
    }

    async saveKaruta(e) {
        e.preventDefault();
        const id = document.getElementById('karuta-edit-id').value;
        const data = {
            title: document.getElementById('karuta-title-input').value,
            description: document.getElementById('karuta-description-input').value,
            image: document.getElementById('karuta-image-preview').dataset.url || ''
        };

        try {
            if (id) {
                await supabaseClient.updateKarutaCard(id, data);
                this.showAlert('カードを更新しました', 'success');
            } else {
                data.sort_order = Math.max(...this.karutaItems.map(c => c.sort_order || 0), 0) + 1;
                await supabaseClient.createKarutaCard(data);
                this.showAlert('カードを追加しました', 'success');
            }
            this.loadKarutaList();
        } catch (error) {
            console.error('保存失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    async deleteKaruta(id) {
        try {
            await supabaseClient.deleteKarutaCard(id);
            this.showAlert('カードを削除しました', 'success');
            this.loadKarutaList();
        } catch (error) {
            console.error('削除失敗:', error);
            this.showAlert('削除に失敗しました', 'error');
        }
    }

    async reorderKaruta(id, direction) {
        const idx = this.karutaItems.findIndex(c => c.id === id);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= this.karutaItems.length) return;

        const current = this.karutaItems[idx];
        const target = this.karutaItems[swapIdx];

        try {
            await Promise.all([
                supabaseClient.updateKarutaCard(current.id, { sort_order: target.sort_order }),
                supabaseClient.updateKarutaCard(target.id, { sort_order: current.sort_order })
            ]);
            this.loadKarutaList();
        } catch (error) {
            console.error('並び替え失敗:', error);
            this.showAlert('並び替えに失敗しました', 'error');
        }
    }

    // ==============================================
    // 活動内容
    // ==============================================

    activityItems = [];

    async loadActivitiesForm() {
        const container = document.getElementById('activities-cards-container');
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';

        try {
            this.activityItems = await supabaseClient.getActivityCards();

            container.innerHTML = this.activityItems.map((card, idx) => `
                <div class="activity-card-form" data-id="${card.id}">
                    <h4>カード ${idx + 1}</h4>
                    <div class="form-group">
                        <label>アイコン（絵文字）</label>
                        <input type="text" class="activity-icon-input" value="${this.escapeHtml(card.icon || '')}" placeholder="🏠">
                    </div>
                    <div class="form-group">
                        <label>タイトル</label>
                        <input type="text" class="activity-title-input" value="${this.escapeHtml(card.title || '')}">
                    </div>
                    <div class="form-group">
                        <label>本文</label>
                        <textarea class="activity-body-input" rows="3">${this.escapeHtml(card.content || '')}</textarea>
                        <p class="form-hint">HTMLタグが使えます</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('活動内容データ読み込み失敗:', error);
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>データの読み込みに失敗しました</p></div>';
        }
    }

    async saveActivities(e) {
        e.preventDefault();
        const forms = document.querySelectorAll('.activity-card-form');

        try {
            const updates = Array.from(forms).map(form => {
                const id = form.dataset.id;
                return supabaseClient.updateActivityCard(id, {
                    icon: form.querySelector('.activity-icon-input').value,
                    title: form.querySelector('.activity-title-input').value,
                    content: form.querySelector('.activity-body-input').value
                });
            });

            await Promise.all(updates);
            this.showAlert('保存しました', 'success');
        } catch (error) {
            console.error('保存失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    // ==============================================
    // FAQ
    // ==============================================

    faqItems = [];

    async loadFaqList() {
        const container = document.getElementById('faq-list-admin');
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></div>';

        document.getElementById('faq-list-view').style.display = 'block';
        document.getElementById('faq-edit-view').style.display = 'none';

        try {
            this.faqItems = await supabaseClient.getFaqItems();

            if (this.faqItems.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-question-circle"></i><p>FAQがありません</p></div>';
                return;
            }

            container.innerHTML = this.faqItems.map((item, idx) => `
                <div class="crud-card">
                    <div class="crud-card-body">
                        <div class="crud-card-info" style="width:100%">
                            <div class="card-title">Q. ${this.escapeHtml(item.question)}</div>
                            <div class="card-excerpt">A. ${this.escapeHtml((item.answer || '').substring(0, 60))}</div>
                        </div>
                    </div>
                    <div class="crud-card-actions">
                        ${idx > 0 ? `<button class="move-up-btn faq-move-btn" data-id="${item.id}" data-direction="up"><i class="fas fa-arrow-up"></i></button>` : '<button disabled><i class="fas fa-arrow-up" style="opacity:0.2"></i></button>'}
                        ${idx < this.faqItems.length - 1 ? `<button class="move-down-btn faq-move-btn" data-id="${item.id}" data-direction="down"><i class="fas fa-arrow-down"></i></button>` : '<button disabled><i class="fas fa-arrow-down" style="opacity:0.2"></i></button>'}
                        <button class="edit-btn faq-edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i> 編集</button>
                        <button class="delete-btn faq-delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i> 削除</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('FAQ読み込み失敗:', error);
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>データの読み込みに失敗しました</p></div>';
        }
    }

    async showFaqForm(id = null) {
        document.getElementById('faq-list-view').style.display = 'none';
        document.getElementById('faq-edit-view').style.display = 'block';

        document.getElementById('faq-form').reset();
        document.getElementById('faq-edit-id').value = id || '';
        document.getElementById('faq-form-title').textContent = id ? 'FAQ編集' : 'FAQ追加';

        if (id) {
            const item = this.faqItems.find(f => f.id === id);
            if (item) {
                document.getElementById('faq-question-input').value = item.question;
                document.getElementById('faq-answer-input').value = item.answer || '';
            }
        }
    }

    async saveFaq(e) {
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
                data.sort_order = Math.max(...this.faqItems.map(f => f.sort_order || 0), 0) + 1;
                await supabaseClient.createFaqItem(data);
                this.showAlert('FAQを追加しました', 'success');
            }
            this.loadFaqList();
        } catch (error) {
            console.error('保存失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    async deleteFaq(id) {
        try {
            await supabaseClient.deleteFaqItem(id);
            this.showAlert('FAQを削除しました', 'success');
            this.loadFaqList();
        } catch (error) {
            console.error('削除失敗:', error);
            this.showAlert('削除に失敗しました', 'error');
        }
    }

    async reorderFaq(id, direction) {
        const idx = this.faqItems.findIndex(f => f.id === id);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= this.faqItems.length) return;

        const current = this.faqItems[idx];
        const target = this.faqItems[swapIdx];

        try {
            await Promise.all([
                supabaseClient.updateFaqItem(current.id, { sort_order: target.sort_order }),
                supabaseClient.updateFaqItem(target.id, { sort_order: current.sort_order })
            ]);
            this.loadFaqList();
        } catch (error) {
            console.error('並び替え失敗:', error);
            this.showAlert('並び替えに失敗しました', 'error');
        }
    }

    // ==============================================
    // お問い合わせ
    // ==============================================

    async loadContactForm() {
        try {
            const data = await supabaseClient.getSiteContents('contact');
            const fields = {};
            data.forEach(row => { fields[row.field_key] = row.field_value; });

            document.getElementById('contact-line-input').value = fields.line_url || '';
            document.getElementById('contact-instagram-input').value = fields.instagram_url || '';
            document.getElementById('contact-twitter-input').value = fields.twitter_url || '';
            document.getElementById('contact-email-input').value = fields.email || '';
        } catch (error) {
            console.error('お問い合わせデータ読み込み失敗:', error);
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
            this.showAlert('保存しました', 'success');
        } catch (error) {
            console.error('保存失敗:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
