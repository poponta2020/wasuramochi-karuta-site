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
    // ==============================================
    // site_contents テーブル操作
    // ==============================================

    async getSiteContents(sectionKey) {
        try {
            let url = `${this.url}/rest/v1/site_contents?select=*`;
            if (sectionKey) {
                url += `&section_key=eq.${sectionKey}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('サイトコンテンツの取得に失敗しました:', error);
            throw error;
        }
    }

    async updateSiteContents(sectionKey, fields) {
        try {
            const rows = Object.entries(fields).map(([fieldKey, fieldValue]) => ({
                section_key: sectionKey,
                field_key: fieldKey,
                field_value: fieldValue
            }));
            const response = await fetch(
                `${this.url}/rest/v1/site_contents?on_conflict=section_key,field_key`,
                {
                    method: 'POST',
                    headers: {
                        ...this.headers,
                        'Prefer': 'return=representation,resolution=merge-duplicates'
                    },
                    body: JSON.stringify(rows)
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('サイトコンテンツの更新に失敗しました:', error);
            throw error;
        }
    }

    // ==============================================
    // karuta_cards テーブル操作
    // ==============================================

    async getKarutaCards() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/karuta_cards?select=*&order=sort_order.asc`,
                { method: 'GET', headers: this.headers }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('百人一首カードの取得に失敗しました:', error);
            throw error;
        }
    }

    async createKarutaCard(data) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/karuta_cards`,
                { method: 'POST', headers: this.headers, body: JSON.stringify(data) }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('百人一首カードの作成に失敗しました:', error);
            throw error;
        }
    }

    async updateKarutaCard(id, data) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/karuta_cards?id=eq.${id}`,
                { method: 'PATCH', headers: this.headers, body: JSON.stringify(data) }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('百人一首カードの更新に失敗しました:', error);
            throw error;
        }
    }

    async deleteKarutaCard(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/karuta_cards?id=eq.${id}`,
                { method: 'DELETE', headers: this.headers }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('百人一首カードの削除に失敗しました:', error);
            throw error;
        }
    }

    // ==============================================
    // activity_cards テーブル操作
    // ==============================================

    async getActivityCards() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/activity_cards?select=*&order=sort_order.asc`,
                { method: 'GET', headers: this.headers }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('活動内容カードの取得に失敗しました:', error);
            throw error;
        }
    }

    async updateActivityCard(id, data) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/activity_cards?id=eq.${id}`,
                { method: 'PATCH', headers: this.headers, body: JSON.stringify(data) }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('活動内容カードの更新に失敗しました:', error);
            throw error;
        }
    }

    // ==============================================
    // faq_items テーブル操作
    // ==============================================

    async getFaqItems() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/faq_items?select=*&order=sort_order.asc`,
                { method: 'GET', headers: this.headers }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('FAQの取得に失敗しました:', error);
            throw error;
        }
    }

    async createFaqItem(data) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/faq_items`,
                { method: 'POST', headers: this.headers, body: JSON.stringify(data) }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('FAQの作成に失敗しました:', error);
            throw error;
        }
    }

    async updateFaqItem(id, data) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/faq_items?id=eq.${id}`,
                { method: 'PATCH', headers: this.headers, body: JSON.stringify(data) }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error('FAQの更新に失敗しました:', error);
            throw error;
        }
    }

    async deleteFaqItem(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/faq_items?id=eq.${id}`,
                { method: 'DELETE', headers: this.headers }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('FAQの削除に失敗しました:', error);
            throw error;
        }
    }
}

// グローバルインスタンスを作成
const supabaseClient = new SupabaseClient();
