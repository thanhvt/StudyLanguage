// ================================
// Jest Setup - Mock các native modules
// ================================

// Mock utils and config
jest.mock('@/utils/getDeviceLanguage', () => ({
  getDeviceLanguage: jest.fn().mockReturnValue('en'),
}));

jest.mock('@/config/i18n', () => ({
  LanguageCode: {},
}));

jest.mock('react-native-localize', () => ({
  getLocales: jest.fn().mockReturnValue([{languageCode: 'en', countryCode: 'US'}]),
  findBestLanguageTag: jest.fn().mockReturnValue({languageTag: 'en', isRTL: false}),
}));

// Mock nativewind (tránh JSX parsing error từ react-native-css-interop)
jest.mock('nativewind', () => ({
  colorScheme: {
    set: jest.fn(),
    get: jest.fn().mockReturnValue('light'),
  },
  vars: jest.fn(),
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
}));

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => ({
  cssInterop: jest.fn(),
  remapProps: jest.fn(),
}));

// Mock react-native-config
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  API_URL: 'http://localhost:3001/api',
  GOOGLE_WEB_CLIENT_ID: 'test-google-client-id',
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock react-native-track-player
jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn().mockResolvedValue(true),
    updateOptions: jest.fn(),
    setRepeatMode: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    reset: jest.fn(),
    add: jest.fn(),
    setRate: jest.fn(),
    seekTo: jest.fn(),
    skipToNext: jest.fn(),
    skipToPrevious: jest.fn(),
    registerPlaybackService: jest.fn(),
    addEventListener: jest.fn(),
  },
  usePlaybackState: jest.fn().mockReturnValue({state: undefined}),
  State: {Playing: 'playing', Paused: 'paused', None: 'none'},
  Event: {RemotePause: 'remote-pause', RemotePlay: 'remote-play', RemoteNext: 'remote-next', RemotePrevious: 'remote-previous', RemoteSeek: 'remote-seek'},
  Capability: {Play: 0, Pause: 1, SkipToNext: 2, SkipToPrevious: 3, SeekTo: 4},
  RepeatMode: {Off: 0, Track: 1, Queue: 2},
  AppKilledPlaybackBehavior: {StopPlaybackAndRemoveNotification: 0},
}));

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({data: {idToken: 'mock-id-token'}}),
    signOut: jest.fn(),
    revokeAccess: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithIdToken: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({data: {subscription: {unsubscribe: jest.fn()}}})),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
  })),
  processLock: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: any) => children,
  SafeAreaView: ({children}: any) => children,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
