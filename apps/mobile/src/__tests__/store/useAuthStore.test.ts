/**
 * Unit test cho useAuthStore (Zustand)
 *
 * Mục đích: Test trạng thái auth store - login, logout, session management
 * Ref test cases:
 *   - MOB-AUTH-MVP-HP-007: Token lưu đúng
 *   - MOB-AUTH-MVP-HP-008: Auto re-login (session persist)
 *   - MOB-AUTH-MVP-HP-010: Logout thành công
 */
import {useAuthStore} from '@/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset về mặc định
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
      isInitialized: false,
    });
  });

  // MOB-AUTH-MVP-HP-007: Token/session lưu vào store
  it('setSession lưu session vào store', () => {
    const mockSession = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {id: 'user-1', email: 'test@test.com'},
    } as any;

    useAuthStore.getState().setSession(mockSession);

    expect(useAuthStore.getState().session).toBe(mockSession);
  });

  // MOB-AUTH-MVP-HP-004: Login => setUser
  it('setUser lưu user info vào store', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@gmail.com',
      user_metadata: {full_name: 'Thành'},
    } as any;

    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().user).toBe(mockUser);
    expect(useAuthStore.getState().user?.email).toBe('test@gmail.com');
  });

  // MOB-AUTH-MVP-HP-010: Logout xóa token + user
  it('reset xóa session và user', () => {
    // Setup: đã login
    useAuthStore.setState({
      session: {access_token: 'token'} as any,
      user: {id: 'user-1'} as any,
      isInitialized: true,
    });

    // Logout
    useAuthStore.getState().reset();

    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  // MOB-AUTH-MVP-HP-008: setInitialized flag cho auto-login flow
  it('setInitialized đặt isInitialized = true và isLoading = false', () => {
    expect(useAuthStore.getState().isInitialized).toBe(false);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setInitialized();

    expect(useAuthStore.getState().isInitialized).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  // MOB-AUTH-MVP-EC-002: Trạng thái mặc định khi app fresh start
  it('trạng thái mặc định đúng khi khởi tạo', () => {
    const state = useAuthStore.getState();

    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.isInitialized).toBe(false);
  });

  // setIsLoading
  it('setIsLoading cập nhật trạng thái loading', () => {
    useAuthStore.getState().setIsLoading(false);

    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
