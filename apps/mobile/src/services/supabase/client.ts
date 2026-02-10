import 'react-native-url-polyfill/auto';
import {AppState} from 'react-native';
import {createClient, processLock} from '@supabase/supabase-js';
import {MMKV} from 'react-native-mmkv';
import Config from 'react-native-config';

// ===========================
// MMKV Storage Adapter cho Supabase
// ===========================
const supabaseStorage = new MMKV({id: 'supabase-storage'});

const mmkvStorageAdapter = {
  getItem: (key: string) => {
    return supabaseStorage.getString(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    supabaseStorage.set(key, value);
  },
  removeItem: (key: string) => {
    supabaseStorage.delete(key);
  },
};

// ===========================
// Supabase Client cho React Native
// ===========================
const supabaseUrl = Config.SUPABASE_URL ?? '';
const supabaseAnonKey = Config.SUPABASE_ANON_KEY ?? '';

/**
 * Mục đích: Tạo Supabase client cho React Native (tương tự web-v2 nhưng dùng MMKV thay cookie)
 * Tham số đầu vào: không có
 * Tham số đầu ra: SupabaseClient
 * Khi nào sử dụng: Mọi nơi cần gọi Supabase API (auth, database, storage)
 *   - services/supabase/auth.ts: đăng nhập, đăng xuất
 *   - services/api/client.ts: lấy access token cho API calls
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Không cần cho React Native
    lock: processLock, // Tránh race condition khi nhiều process cùng refresh token
  },
});

// ===========================
// Auto-refresh token theo AppState
// ===========================
// Khi app ở foreground → liên tục refresh session token
// Khi app ở background → tắt refresh để tiết kiệm tài nguyên
// Tránh bị logout bất ngờ khi token hết hạn
AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
