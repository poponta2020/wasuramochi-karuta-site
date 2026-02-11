// ==============================================
// わすらもち会 活動報告システム - 活動報告表示ロジック
// ==============================================

/**
 * トップページ用：最新の活動報告を表示
 */
async function loadTopPageReports() {
    const container = document.getElementById('reports-container');
    if (!container) return;

    showLoading(container);

    try {
        const { data: reports } = await supabaseClient.getReports(1, TOP_PAGE_REPORTS_COUNT);

        if (!reports || reports.length === 0) {
            showEmpty(container);
            return;
        }

        // イベントカードを生成
        const cardsHtml = reports.map((report, index) => createEventCard(report, index)).join('');
        container.innerHTML = cardsHtml;

        // カルーセルを初期化
        initAllCarousels();

    } catch (error) {
        console.error('活動報告の読み込みに失敗しました:', error);
        showError(container);
    }
}

/**
 * 一覧ページ用：ページネーション付きで活動報告を表示
 */
async function loadReportsPage() {
    const container = document.getElementById('reports-list-container');
    const paginationContainer = document.getElementById('pagination-container');

    if (!container) return;

    // URLからページ番号を取得
    const currentPage = parseInt(getUrlParam('page')) || 1;

    showLoading(container);

    try {
        const { data: reports, count } = await supabaseClient.getReports(currentPage, REPORTS_PER_PAGE);

        if (!reports || reports.length === 0) {
            if (currentPage === 1) {
                showEmpty(container);
            } else {
                // ページが存在しない場合は1ページ目にリダイレクト
                window.location.href = '/reports.html';
            }
            return;
        }

        // イベントカードを生成
        const cardsHtml = reports.map((report, index) => createEventCard(report, index)).join('');
        container.innerHTML = cardsHtml;

        // カルーセルを初期化
        initAllCarousels();

        // ページネーションを生成
        if (paginationContainer) {
            const totalPages = Math.ceil(count / REPORTS_PER_PAGE);
            paginationContainer.innerHTML = createPagination(currentPage, totalPages, '/reports.html');
        }

    } catch (error) {
        console.error('活動報告の読み込みに失敗しました:', error);
        showError(container);
    }
}

/**
 * ページ種別を判定して適切な読み込み処理を実行
 */
function initReports() {
    // トップページの場合
    if (document.getElementById('reports-container')) {
        loadTopPageReports();
    }

    // 一覧ページの場合
    if (document.getElementById('reports-list-container')) {
        loadReportsPage();
    }
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', initReports);
