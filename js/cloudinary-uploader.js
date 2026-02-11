// ==============================================
// わすらもち会 活動報告システム - Cloudinary画像アップローダー
// ==============================================

/**
 * Cloudinaryへの画像アップロードを管理するクラス
 */
class CloudinaryUploader {
    constructor() {
        this.cloudName = CLOUDINARY_CLOUD_NAME;
        this.uploadPreset = CLOUDINARY_UPLOAD_PRESET;
        this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    }

    /**
     * 画像をCloudinaryにアップロード
     * @param {File} file - アップロードするファイル
     * @param {Function} onProgress - 進捗コールバック (0-100)
     * @returns {Promise<{url: string, publicId: string}>}
     */
    async uploadImage(file, onProgress = null) {
        // ファイルサイズチェック
        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error(`ファイルサイズが大きすぎます。${MAX_IMAGE_SIZE / 1024 / 1024}MB以下にしてください。`);
        }

        // ファイル形式チェック
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error('対応していないファイル形式です。JPG, PNG, GIF, WebPのみアップロード可能です。');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', 'wasuramochi-reports');

        try {
            return await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // 進捗イベント
                if (onProgress) {
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            onProgress(percent);
                        }
                    });
                }

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            url: response.secure_url,
                            publicId: response.public_id
                        });
                    } else {
                        let errorMessage = 'アップロードに失敗しました。';
                        try {
                            const errorResponse = JSON.parse(xhr.responseText);
                            console.error('Cloudinary error response:', errorResponse);
                            errorMessage += ` (${xhr.status}: ${errorResponse.error?.message || xhr.responseText})`;
                        } catch (e) {
                            console.error('Cloudinary raw response:', xhr.status, xhr.responseText);
                        }
                        reject(new Error(errorMessage));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('ネットワークエラーが発生しました。'));
                });

                xhr.open('POST', this.uploadUrl);
                xhr.send(formData);
            });
        } catch (error) {
            console.error('画像アップロードエラー:', error);
            throw error;
        }
    }

    /**
     * 複数の画像を順次アップロード
     * @param {FileList|Array<File>} files - アップロードするファイル群
     * @param {Function} onFileProgress - 各ファイルの進捗コールバック (fileIndex, percent)
     * @param {Function} onFileComplete - 各ファイル完了時コールバック (fileIndex, result)
     * @returns {Promise<Array<{url: string, publicId: string}>>}
     */
    async uploadMultipleImages(files, onFileProgress = null, onFileComplete = null) {
        const results = [];
        const filesArray = Array.from(files);

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            try {
                const result = await this.uploadImage(
                    file,
                    onFileProgress ? (percent) => onFileProgress(i, percent) : null
                );
                results.push(result);
                if (onFileComplete) {
                    onFileComplete(i, result);
                }
            } catch (error) {
                console.error(`ファイル ${i + 1} のアップロードに失敗:`, error);
                throw error;
            }
        }

        return results;
    }

    /**
     * 画像URLに変換パラメータを追加（リサイズ・最適化）
     * @param {string} url - 元のCloudinary URL
     * @param {Object} options - 変換オプション
     * @returns {string}
     */
    getOptimizedUrl(url, options = {}) {
        const {
            width = 800,
            quality = 'auto',
            format = 'auto'
        } = options;

        // Cloudinary URLの変換パラメータを挿入
        const transformations = `w_${width},q_${quality},f_${format}`;
        return url.replace('/upload/', `/upload/${transformations}/`);
    }

    /**
     * サムネイルURLを生成
     * @param {string} url - 元のCloudinary URL
     * @returns {string}
     */
    getThumbnailUrl(url) {
        return this.getOptimizedUrl(url, { width: 200, quality: 'auto' });
    }
}

// グローバルインスタンスを作成
const cloudinaryUploader = new CloudinaryUploader();
