// ==============================================
// わすらもち会 活動報告システム - 設定ファイル
// ==============================================

// Supabase設定
// Settings → API から取得してください
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Cloudinary設定
// Dashboard から取得してください
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'wasuramochi-unsigned';

// 管理画面パスワード
// 本番環境では安全な値に変更してください
const ADMIN_PASSWORD = 'wasuramochi2024';

// 表示設定
const REPORTS_PER_PAGE = 6;        // 一覧ページの1ページあたりの表示件数
const TOP_PAGE_REPORTS_COUNT = 3;  // トップページに表示する件数

// 画像設定
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
