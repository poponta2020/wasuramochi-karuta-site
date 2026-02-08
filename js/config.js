// ==============================================
// わすらもち会 活動報告システム - 設定ファイル
// ==============================================

// Supabase設定
// Settings → API から取得してください
const SUPABASE_URL = 'https://dzjuvzrcdmfurtnctpac.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6anV2enJjZG1mdXJ0bmN0cGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODcxMDUsImV4cCI6MjA4NjA2MzEwNX0.OR-6MMRj6_m1Az32qcGmG57JIUW52wGflng4MCPu2_wY';

// Cloudinary設定
// Dashboard から取得してください
const CLOUDINARY_CLOUD_NAME = 'djewlevxs';
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
