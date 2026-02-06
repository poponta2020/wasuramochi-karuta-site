// ==============================================
// わすらもち会 活動報告システム - 共通ユーティリティ
// ==============================================

/**
 * イベントカードのHTMLを生成
 * @param {Object} report - 活動報告データ
 * @param {number} index - インデックス（カルーセル用）
 * @returns {string}
 */
function createEventCard(report, index) {
    const eventId = `event-${report.id || index}`;
    const images = report.images || [];

    // 画像スライドHTML生成
    const slidesHtml = images.length > 0
        ? images.map((img, i) => `
            <div class="event-slide">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(report.title)} - 画像${i + 1}" loading="lazy">
            </div>
        `).join('')
        : `
            <div class="event-slide">
                <div class="no-image-placeholder">
                    <span>No Image</span>
                </div>
            </div>
        `;

    // ドットHTML生成
    const dotsHtml = images.length > 1
        ? images.map((_, i) => `
            <button class="event-carousel-dot${i === 0 ? ' active' : ''}" data-slide="${i}"></button>
        `).join('')
        : '';

    return `
        <div class="event-card">
            <div class="event-header">
                <div class="event-date">${escapeHtml(report.date)}</div>
                <h3>${escapeHtml(report.title)}</h3>
                <p>${escapeHtml(report.description || '')}</p>
            </div>
            <div class="event-carousel" data-event="${eventId}">
                <div class="event-carousel-track">
                    ${slidesHtml}
                </div>
                ${images.length > 1 ? `
                    <button class="event-carousel-btn event-carousel-btn-prev" data-target="${eventId}">‹</button>
                    <button class="event-carousel-btn event-carousel-btn-next" data-target="${eventId}">›</button>
                ` : ''}
                ${dotsHtml ? `
                    <div class="event-carousel-dots">
                        ${dotsHtml}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * HTMLエスケープ
 * @param {string} str - エスケープする文字列
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * カルーセルを初期化
 * @param {HTMLElement} container - カルーセルのコンテナ要素
 */
function initCarousel(container) {
    const track = container.querySelector('.event-carousel-track');
    const slides = container.querySelectorAll('.event-slide');
    const prevBtn = container.querySelector('.event-carousel-btn-prev');
    const nextBtn = container.querySelector('.event-carousel-btn-next');
    const dots = container.querySelectorAll('.event-carousel-dot');

    if (slides.length <= 1) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateCarousel(slideIndex) {
        const translateX = -slideIndex * 100;
        track.style.transform = `translateX(${translateX}%)`;

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === slideIndex);
        });

        currentSlide = slideIndex;
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        updateCarousel(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel(prevIndex);
    }

    // ボタンイベント
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // ドットイベント
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => updateCarousel(index));
    });

    // タッチ/スワイプサポート
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });
}

/**
 * 全てのカルーセルを初期化
 */
function initAllCarousels() {
    const carousels = document.querySelectorAll('.event-carousel');
    carousels.forEach(carousel => initCarousel(carousel));
}

/**
 * ページネーションHTMLを生成
 * @param {number} currentPage - 現在のページ
 * @param {number} totalPages - 総ページ数
 * @param {string} baseUrl - ベースURL（?page=を除く）
 * @returns {string}
 */
function createPagination(currentPage, totalPages, baseUrl = '') {
    if (totalPages <= 1) return '';

    let html = '<div class="pagination">';

    // 前へボタン
    if (currentPage > 1) {
        html += `<a href="${baseUrl}?page=${currentPage - 1}" class="pagination-btn pagination-prev">← 前へ</a>`;
    } else {
        html += '<span class="pagination-btn pagination-prev disabled">← 前へ</span>';
    }

    // ページ番号
    html += '<div class="pagination-numbers">';

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<a href="${baseUrl}?page=1" class="pagination-number">1</a>`;
        if (startPage > 2) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<span class="pagination-number active">${i}</span>`;
        } else {
            html += `<a href="${baseUrl}?page=${i}" class="pagination-number">${i}</a>`;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
        html += `<a href="${baseUrl}?page=${totalPages}" class="pagination-number">${totalPages}</a>`;
    }

    html += '</div>';

    // 次へボタン
    if (currentPage < totalPages) {
        html += `<a href="${baseUrl}?page=${currentPage + 1}" class="pagination-btn pagination-next">次へ →</a>`;
    } else {
        html += '<span class="pagination-btn pagination-next disabled">次へ →</span>';
    }

    html += '</div>';

    return html;
}

/**
 * URLパラメータを取得
 * @param {string} name - パラメータ名
 * @returns {string|null}
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * ローディング表示を追加
 * @param {HTMLElement} container - コンテナ要素
 */
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>読み込み中...</p>
        </div>
    `;
}

/**
 * エラー表示を追加
 * @param {HTMLElement} container - コンテナ要素
 * @param {string} message - エラーメッセージ
 */
function showError(container, message = 'データの取得に失敗しました。') {
    container.innerHTML = `
        <div class="error-message">
            <p>${escapeHtml(message)}</p>
            <button onclick="location.reload()" class="btn btn-secondary">再読み込み</button>
        </div>
    `;
}

/**
 * 「データがありません」表示
 * @param {HTMLElement} container - コンテナ要素
 */
function showEmpty(container) {
    container.innerHTML = `
        <div class="empty-message">
            <p>活動報告はまだありません。</p>
        </div>
    `;
}
