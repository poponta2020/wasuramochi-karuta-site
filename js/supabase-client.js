// ==============================================
// わすらもち会 活動報告システム - Supabaseクライアント
// ==============================================

/**
 * Supabase REST APIを使用したデータベース操作クラス
 */
class SupabaseClient {
    constructor() {
        this.url = SUPABASE_URL;
        this.key = SUPABASE_ANON_KEY;
        this.headers = {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    /**
     * 活動報告一覧を取得（ページネーション対応）
     * @param {number} page - ページ番号（1から開始）
     * @param {number} limit - 1ページあたりの件数
     * @returns {Promise<{data: Array, count: number}>}
     */
    async getReports(page = 1, limit = REPORTS_PER_PAGE) {
        const offset = (page - 1) * limit;

        try {
            // データ取得
            const response = await fetch(
                `${this.url}/rest/v1/reports?select=*&order=date.desc,created_at.desc&offset=${offset}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        ...this.headers,
                        'Prefer': 'count=exact'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const count = parseInt(response.headers.get('content-range')?.split('/')[1] || '0');

            return { data, count };
        } catch (error) {
            console.error('活動報告の取得に失敗しました:', error);
            throw error;
        }
    }

    /**
     * 単一の活動報告を取得
     * @param {string} id - 活動報告ID
     * @returns {Promise<Object>}
     */
    async getReportById(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/reports?id=eq.${id}&select=*`,
                {
                    method: 'GET',
                    headers: this.headers
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('活動報告の取得に失敗しました:', error);
            throw error;
        }
    }

    /**
     * 活動報告を作成
     * @param {Object} reportData - 活動報告データ
     * @returns {Promise<Object>}
     */
    async createReport(reportData) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/reports`,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({
                        date: reportData.date,
                        title: reportData.title,
                        description: reportData.description || '',
                        images: reportData.images || []
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data[0];
        } catch (error) {
            console.error('活動報告の作成に失敗しました:', error);
            throw error;
        }
    }

    /**
     * 活動報告を更新
     * @param {string} id - 活動報告ID
     * @param {Object} reportData - 更新データ
     * @returns {Promise<Object>}
     */
    async updateReport(id, reportData) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/reports?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: this.headers,
                    body: JSON.stringify({
                        date: reportData.date,
                        title: reportData.title,
                        description: reportData.description || '',
                        images: reportData.images || []
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data[0];
        } catch (error) {
            console.error('活動報告の更新に失敗しました:', error);
            throw error;
        }
    }

    /**
     * 活動報告を削除
     * @param {string} id - 活動報告ID
     * @returns {Promise<boolean>}
     */
    async deleteReport(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/reports?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: this.headers
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('活動報告の削除に失敗しました:', error);
            throw error;
        }
    }

    /**
     * 活動報告の総件数を取得
     * @returns {Promise<number>}
     */
    async getReportsCount() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/reports?select=id`,
                {
                    method: 'GET',
                    headers: {
                        ...this.headers,
                        'Prefer': 'count=exact'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const count = parseInt(response.headers.get('content-range')?.split('/')[1] || '0');
            return count;
        } catch (error) {
            console.error('件数の取得に失敗しました:', error);
            throw error;
        }
    }
}

// グローバルインスタンスを作成
const supabaseClient = new SupabaseClient();
