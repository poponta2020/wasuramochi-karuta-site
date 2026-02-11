// ==============================================
// わすらもち会 活動報告システム - 管理画面ロジック
// ==============================================

/**
 * 管理画面のメインクラス
 */
class AdminPanel {
    constructor() {
        this.isLoggedIn = false;
        this.currentView = 'login';
        this.editingReportId = null;
        this.uploadedImages = [];

        this.init();
    }

    /**
     * 初期化
     */
    init() {
        // セッションチェック
        this.checkSession();

        // イベントリスナー設定
        this.setupEventListeners();
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

    /**
     * イベントリスナー設定
     */
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

    /**
     * ログイン処理
     */
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

    /**
     * ログアウト処理
     */
    handleLogout() {
        localStorage.removeItem('admin_session');
        this.isLoggedIn = false;
        this.showLogin();
    }

    /**
     * ログイン画面表示
     */
    showLogin() {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('admin-section').style.display = 'none';
    }

    /**
     * ダッシュボード表示
     */
    async showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        document.getElementById('dashboard-view').style.display = 'block';
        document.getElementById('edit-view').style.display = 'none';

        this.currentView = 'dashboard';
        await this.loadReportsList();
    }

    /**
     * 活動報告一覧を読み込み
     */
    async loadReportsList() {
        const container = document.getElementById('reports-table-body');
        container.innerHTML = '<tr><td colspan="5" class="loading"><div class="loading-spinner"></div><p>読み込み中...</p></td></tr>';

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

    /**
     * 編集フォーム表示
     */
    async showEditForm(reportId = null) {
        document.getElementById('dashboard-view').style.display = 'none';
        document.getElementById('edit-view').style.display = 'block';

        this.currentView = 'edit';
        this.editingReportId = reportId;
        this.uploadedImages = [];

        // フォームリセット
        document.getElementById('edit-form').reset();
        document.getElementById('uploaded-images').innerHTML = '';

        // タイトル更新
        document.getElementById('form-title').textContent = reportId ? '活動報告を編集' : '新規活動報告';

        if (reportId) {
            // 既存データを読み込み
            try {
                const report = await supabaseClient.getReportById(reportId);
                if (report) {
                    document.getElementById('report-date').value = report.date;
                    document.getElementById('report-title').value = report.title;
                    document.getElementById('report-description').value = report.description || '';

                    // 画像を設定
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

    /**
     * 画像アップロード設定
     */
    setupImageUpload() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('image-input');

        if (!uploadArea || !fileInput) return;

        // クリックでファイル選択
        uploadArea.addEventListener('click', () => fileInput.click());

        // ドラッグ&ドロップ
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

        // ファイル選択
        fileInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
            fileInput.value = '';
        });

        // 画像削除
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.removeImage(index);
            }
        });
    }

    /**
     * 画像ファイル処理
     */
    async handleImageFiles(files) {
        const filesArray = Array.from(files);

        for (const file of filesArray) {
            // バリデーション
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                this.showAlert('対応していないファイル形式です: ' + file.name, 'error');
                continue;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                this.showAlert('ファイルサイズが大きすぎます: ' + file.name, 'error');
                continue;
            }

            // プレビュー表示（アップロード中）
            const tempId = 'temp-' + Date.now() + '-' + Math.random();
            const previewUrl = URL.createObjectURL(file);
            this.uploadedImages.push({ tempId, previewUrl, uploading: true });
            this.renderUploadedImages();

            try {
                // Cloudinaryにアップロード
                const result = await cloudinaryUploader.uploadImage(file, (percent) => {
                    this.updateUploadProgress(tempId, percent);
                });

                // 成功したらURLを更新
                const index = this.uploadedImages.findIndex(img => img.tempId === tempId);
                if (index !== -1) {
                    this.uploadedImages[index] = result.url;
                }
                this.renderUploadedImages();

            } catch (error) {
                console.error('アップロードエラー:', error);
                // 失敗したら削除
                const index = this.uploadedImages.findIndex(img => img.tempId === tempId);
                if (index !== -1) {
                    this.uploadedImages.splice(index, 1);
                }
                this.renderUploadedImages();
                this.showAlert('画像のアップロードに失敗しました: ' + file.name, 'error');
            }
        }
    }

    /**
     * アップロード進捗更新
     */
    updateUploadProgress(tempId, percent) {
        const progressBar = document.querySelector(`[data-temp-id="${tempId}"] .upload-progress-bar`);
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    }

    /**
     * アップロード済み画像を描画
     */
    renderUploadedImages() {
        const container = document.getElementById('uploaded-images');
        if (!container) return;

        container.innerHTML = this.uploadedImages.map((img, index) => {
            if (typeof img === 'string') {
                // アップロード済みURL
                return `
                    <div class="uploaded-image-item">
                        <img src="${img}" alt="">
                        <button type="button" class="remove-btn" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            } else {
                // アップロード中
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

    /**
     * 画像削除
     */
    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.renderUploadedImages();
    }

    /**
     * 保存処理
     */
    async handleSave(e) {
        e.preventDefault();

        const date = document.getElementById('report-date').value;
        const title = document.getElementById('report-title').value;
        const description = document.getElementById('report-description').value;

        // バリデーション
        if (!date || !title) {
            this.showAlert('日付とタイトルは必須です', 'error');
            return;
        }

        // アップロード中の画像がある場合は待機
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

            this.showDashboard();

        } catch (error) {
            console.error('保存に失敗しました:', error);
            this.showAlert('保存に失敗しました', 'error');
        }
    }

    /**
     * 削除確認モーダル表示
     */
    showDeleteConfirm(reportId) {
        this.deletingReportId = reportId;
        document.getElementById('delete-modal').classList.add('show');
    }

    /**
     * モーダル非表示
     */
    hideModal() {
        document.getElementById('delete-modal').classList.remove('show');
        this.deletingReportId = null;
    }

    /**
     * 削除実行
     */
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

    /**
     * アラート表示
     */
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

        // 3秒後に自動削除
        setTimeout(() => {
            alert.remove();
        }, 3000);
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

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
