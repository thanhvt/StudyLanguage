/**
 * Unit test cho authService
 *
 * Mục đích: Test service layer auth (Google Sign-In, logout, session)
 * Ref test cases:
 *   - MOB-AUTH-MVP-HP-004: Login Google thành công
 *   - MOB-AUTH-MVP-ERR-001: User hủy Google OAuth
 *   - MOB-AUTH-MVP-HP-009: Token refresh tự động
 *   - MOB-AUTH-MVP-HP-010: Logout thành công
 */
import {authService} from '@/services/supabase/auth';
import {supabase} from '@/services/supabase/client';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    // MOB-AUTH-MVP-HP-004: Login Google thành công
    it('gọi supabase.signInWithIdToken đúng provider và token', async () => {
      const mockData = {
        user: {id: 'user-1', email: 'test@gmail.com'},
        session: {access_token: 'at', refresh_token: 'rt'},
      };

      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValueOnce({
        data: mockData,
        error: null,
      });

      const result = await authService.signInWithGoogle('mock-id-token');

      expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
        provider: 'google',
        token: 'mock-id-token',
      });
      expect(result.user.email).toBe('test@gmail.com');
      expect(result.session.access_token).toBe('at');
    });

    // MOB-AUTH-MVP-ERR-003: Google server error → throw
    it('throw error khi Supabase trả lỗi', async () => {
      (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: {message: 'Invalid token'},
      });

      await expect(
        authService.signInWithGoogle('bad-token'),
      ).rejects.toEqual({message: 'Invalid token'});
    });
  });

  describe('signOut', () => {
    // MOB-AUTH-MVP-HP-010: Logout thành công
    it('gọi supabase.auth.signOut()', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    // MOB-AUTH-MVP-ERR-005: Logout lỗi → throw
    it('throw error khi signOut lỗi', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: {message: 'Network error'},
      });

      await expect(authService.signOut()).rejects.toEqual({
        message: 'Network error',
      });
    });
  });

  describe('getSession', () => {
    // MOB-AUTH-MVP-HP-008: Auto re-login - lấy session lưu trữ
    it('trả về session khi đã login', async () => {
      const mockSession = {access_token: 'at', user: {id: 'user-1'}};

      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: {session: mockSession},
      });

      const session = await authService.getSession();

      expect(session).toEqual(mockSession);
    });

    it('trả về null khi chưa login', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: {session: null},
      });

      const session = await authService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('getUser', () => {
    it('trả về user info khi đã login', async () => {
      const mockUser = {id: 'user-1', email: 'test@gmail.com'};

      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: {user: mockUser},
      });

      const user = await authService.getUser();

      expect(user?.email).toBe('test@gmail.com');
    });
  });

  describe('onAuthStateChange', () => {
    // MOB-AUTH-MVP-HP-009: Token refresh tự động trigger callback
    it('đăng ký listener auth state change', () => {
      const callback = jest.fn();
      authService.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});
