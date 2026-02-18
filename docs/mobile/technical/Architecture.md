# 🏗️ Technical Architecture - Mobile

> **Scope:** React Native CLI Architecture

---

## 1. Overview

Kiến trúc kỹ thuật cho mobile app StudyLanguage, tối ưu cho offline-first và cross-platform.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    UI       │  │    State     │  │     Services     │   │
│  │  (Screens)  │←→│  (Zustand)   │←→│  (API, Storage)  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
├────────────────────────────┼────────────────────────────────┤
│                     Native Modules                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Audio  │  │ Storage │  │Sensors  │  │  Notif  │        │
│  │(Native) │  │(SQLite) │  │(Motion) │  │ (Push)  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │   NestJS     │  │   OpenAI     │      │
│  │  (Auth, DB)  │  │   (API)      │  │   (AI)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

### 3.1 Folder Structure

```
apps/mobile/
├── src/                        # Source code
│   ├── screens/                # Screen components
│   │   ├── tabs/               # Tab screens
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── HistoryScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   ├── auth/               # Auth flow
│   │   │   ├── LoginScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── listening/          # Listening module
│   │   │   ├── ConfigScreen.tsx
│   │   │   └── PlayerScreen.tsx
│   │   ├── speaking/           # Speaking module
│   │   │   ├── SetupScreen.tsx
│   │   │   └── PracticeScreen.tsx
│   │   └── reading/            # Reading module
│   │       ├── ConfigScreen.tsx
│   │       └── ArticleScreen.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── layouts/            # Layout components
│   │   │   ├── SafeAreaLayout.tsx
│   │   │   └── TabLayout.tsx
│   │   └── modules/            # Feature-specific components
│   │       ├── listening/
│   │       ├── speaking/
│   │       └── reading/
│   ├── navigation/             # React Navigation config
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── MainTabs.tsx
│   │   └── stacks/
│   │       ├── ListeningStack.tsx
│   │       ├── SpeakingStack.tsx
│   │       └── ReadingStack.tsx
│   ├── hooks/                  # Custom hooks
│   │   ├── useAudio.ts
│   │   ├── useRecording.ts
│   │   ├── useOffline.ts
│   │   └── ...
│   ├── services/               # API & external services
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── listening.ts
│   │   │   ├── speaking.ts
│   │   │   └── ...
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── auth.ts
│   │   └── storage/
│   │       ├── secure.ts
│   │       ├── async.ts
│   │       └── sqlite.ts
│   ├── store/                  # Zustand stores
│   │   ├── auth.ts
│   │   ├── settings.ts
│   │   ├── listening.ts
│   │   └── ...
│   ├── utils/                  # Utilities
│   │   ├── helpers.ts
│   │   └── constants.ts
│   └── types/                  # TypeScript types
│       └── ...
├── assets/                     # Static assets
│   ├── images/
│   └── fonts/
├── ios/                        # iOS native project
├── android/                    # Android native project
├── react-native.config.js      # RN CLI config
├── .env                        # Environment variables
├── tailwind.config.js          # NativeWind config
└── package.json
```

---

## 4. Navigation

### 4.1 Navigation Structure

```
Root Navigator (Stack)
├── Auth Stack
│   ├── Onboarding
│   └── Login
│
└── Main Tab Navigator
    ├── Dashboard Tab
    │   └── Dashboard Stack
    │       ├── Dashboard Screen
    │       └── Detail screens
    │
    ├── Listening Tab
    │   └── Listening Stack
    │       ├── Config
    │       └── Player
    │
    ├── Reading Tab
    │   └── Reading Stack
    │       ├── Config
    │       └── Article
    │
    ├── Speaking Tab
    │   └── Speaking Stack
    │       ├── Setup / Topic Selection
    │       └── Practice
    │
    ├── History Tab
    │   └── History Stack
    │       ├── Timeline
    │       └── Detail
    │
    └── Settings Tab
        └── Settings Stack
            ├── Settings
            ├── Appearance
            ├── Notifications
            ├── Audio
            ├── Storage
            ├── Privacy
            └── About
```

### 4.2 React Navigation Configuration

```typescript
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { useAuthStore } from '@/store/auth';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session } = useAuthStore();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// src/navigation/MainTabs.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard', tabBarIcon: HomeIcon }}
      />
      <Tab.Screen
        name="Listening"
        component={ListeningScreen}
        options={{ title: 'Listening', tabBarIcon: HeadphonesIcon }}
      />
      <Tab.Screen
        name="Reading"
        component={ReadingScreen}
        options={{ title: 'Reading', tabBarIcon: BookOpenIcon }}
      />
      <Tab.Screen
        name="Speaking"
        component={SpeakingScreen}
        options={{ title: 'Speaking', tabBarIcon: MicIcon }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History', tabBarIcon: ClockIcon }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', tabBarIcon: SettingsIcon }}
      />
    </Tab.Navigator>
  );
}
```

---

## 5. State Management

### 5.1 State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     State Management                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐       ┌──────────────┐                    │
│  │  TanStack    │       │   Zustand    │                    │
│  │   Query      │       │   Stores     │                    │
│  │              │       │              │                    │
│  │ • Server data│       │ • UI state   │                    │
│  │ • API cache  │       │ • Settings   │                    │
│  │ • Mutations  │       │ • Auth       │                    │
│  │ • Sync       │       │ • Modes      │                    │
│  └──────────────┘       └──────────────┘                    │
│         │                      │                             │
│         └──────────┬───────────┘                             │
│                    │                                         │
│         ┌──────────▼───────────┐                             │
│         │   AsyncStorage       │                             │
│         │   SecureStore        │                             │
│         │   SQLite             │                             │
│         └──────────────────────┘                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Zustand Store Example

```typescript
// store/auth.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 5.3 TanStack Query Example

```typescript
// hooks/useListening.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { listeningAPI } from '@/services/api/listening';

export function useListeningSessions() {
  return useQuery({
    queryKey: ['listening', 'sessions'],
    queryFn: listeningAPI.getSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGenerateListening() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: listeningAPI.generate,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['listening', 'sessions']);
    },
  });
}
```

---

## 6. Data Layer

### 6.1 Storage Strategy

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Auth tokens | SecureStore | Encrypted |
| User preferences | AsyncStorage | Quick access |
| Downloaded lessons | SQLite + FileSystem | Offline |
| Session history | SQLite | Offline query |
| Cache | React Query | Memory + persist |

### 6.2 SQLite Schema

```sql
-- Downloaded lessons
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,  -- 'listening', 'reading'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_path TEXT,
  duration INTEGER,
  created_at TEXT,
  downloaded_at TEXT
);

-- Vocabulary
CREATE TABLE vocabulary (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  pronunciation TEXT,
  meaning TEXT NOT NULL,
  examples TEXT,  -- JSON array
  level INTEGER DEFAULT 1,
  next_review TEXT,
  source TEXT,
  created_at TEXT
);

-- Session history (offline cache)
CREATE TABLE history (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL,  -- JSON
  score REAL,
  duration INTEGER,
  created_at TEXT,
  synced INTEGER DEFAULT 0
);
```

### 6.3 Offline Sync

```typescript
// services/sync.ts
class SyncService {
  async syncPendingData() {
    const pendingHistory = await db.getUnsyncedHistory();
    
    for (const item of pendingHistory) {
      try {
        await api.syncHistory(item);
        await db.markSynced(item.id);
      } catch (error) {
        console.log('Sync failed, will retry later');
      }
    }
  }
  
  // Called when app comes online
  async onNetworkRestore() {
    await this.syncPendingData();
    await this.downloadNewContent();
  }
}
```

---

## 7. API Integration

### 7.1 API Client

```typescript
// services/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const apiClient = axios.create({
  baseURL: Config.API_URL, // react-native-config
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const { session } = useAuthStore.getState();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      await refreshToken();
      return apiClient.request(error.config);
    }
    throw error;
  }
);

export { apiClient };
```

### 7.2 API Services

```typescript
// services/api/listening.ts
export const listeningAPI = {
  generate: async (config: ListeningConfig) => {
    const { data } = await apiClient.post('/listening/generate', config);
    return data;
  },
  
  getSessions: async () => {
    const { data } = await apiClient.get('/listening/sessions');
    return data;
  },
  
  getSession: async (id: string) => {
    const { data } = await apiClient.get(`/listening/sessions/${id}`);
    return data;
  },
};
```

---

## 8. Audio System

### 8.1 Audio Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Audio System                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            react-native-track-player                  │   │
│  │  ┌──────────────┐    ┌──────────────┐                │   │
│  │  │   Playback   │    │  Queue Mgmt  │                │   │
│  │  │ (Background) │    │  (Playlist)  │                │   │
│  │  └──────────────┘    └──────────────┘                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      react-native-audio-recorder-player               │   │
│  │  ┌──────────────┐                                     │   │
│  │  │  Recording   │ (Speaking module)                   │   │
│  │  └──────────────┘                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Native Audio Services                   │   │
│  │  • iOS: AVAudioSession (background mode)              │   │
│  │  • Android: MediaSession + Foreground Service         │   │
│  │  • Lock screen controls (built-in with Track Player)  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Audio Hook (Track Player)

```typescript
// hooks/useAudio.ts
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player';

/**
 * Mục đích: Quản lý audio playback qua Track Player
 * Tham số đầu vào: không có
 * Tham số đầu ra: { load, play, pause, seek, setRate, progress, isPlaying }
 * Khi nào sử dụng: Listening module, Reading TTS playback
 */
export function useAudio() {
  const progress = useProgress();
  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;
  
  const load = async (uri: string, title: string) => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: uri,
      url: uri,
      title,
    });
  };
  
  const play = () => TrackPlayer.play();
  const pause = () => TrackPlayer.pause();
  const seek = (position: number) => TrackPlayer.seekTo(position);
  const setRate = (rate: number) => TrackPlayer.setRate(rate);
  
  return { load, play, pause, seek, setRate, progress, isPlaying };
}
```

### 8.3 Recording Hook

```typescript
// hooks/useRecording.ts
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform } from 'react-native';

const audioRecorderPlayer = new AudioRecorderPlayer();

/**
 * Mục đích: Quản lý audio recording
 * Tham số đầu vào: không có
 * Tham số đầu ra: { start, stop, isRecording, duration, metering }
 * Khi nào sử dụng: Speaking module (hold-to-record)
 */
export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [metering, setMetering] = useState(0);
  
  const start = async () => {
    // Yêu cầu quyền trên Android
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
    }
    
    const path = Platform.select({
      ios: 'recording.m4a',
      android: `${Date.now()}.mp4`,
    });
    
    await audioRecorderPlayer.startRecorder(path, {
      // Cấu hình chất lượng cao
      SampleRate: 44100,
      Channels: 1,
      AudioEncoding: 'aac',
    });
    
    audioRecorderPlayer.addRecordBackListener((e) => {
      setDuration(e.currentPosition);
      setMetering(e.currentMetering ?? 0);
    });
    
    setIsRecording(true);
  };
  
  const stop = async () => {
    const uri = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    setDuration(0);
    return uri;
  };
  
  return { start, stop, isRecording, duration, metering };
}
```

### 8.4 Audio Focus & Interruption Hook

```typescript
// hooks/useAudioFocus.ts
import TrackPlayer, { Event, AppKilledPlaybackBehavior } from 'react-native-track-player';

/**
 * Mục đích: Xử lý audio focus và interruption (cuộc gọi, app khác, tai nghe)
 * Tham số đầu vào: không có
 * Tham số đầu ra: void (tự động xử lý pause/resume/duck)
 * Khi nào sử dụng: Gọi 1 lần khi khởi tạo audio service
 */

// Cấu hình Track Player với audio focus
export async function setupTrackPlayer() {
  await TrackPlayer.setupPlayer();
  
  await TrackPlayer.updateOptions({
    // Cho phép phát khi app ở background
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
    },
    
    // Controls hiển thị trên lock screen / notification
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_SEEK_TO,
    ],
    
    // Controls trên compact notification (Android)
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
    ],
  });
}

// Xử lý audio interruption (cuộc gọi, app khác)
export function useAudioFocus() {
  const wasPlayingBeforeInterruption = useRef(false);
  
  useEffect(() => {
    // Lắng nghe sự kiện audio focus thay đổi
    const focusListener = TrackPlayer.addEventListener(
      Event.RemoteDuck,
      async ({ paused, permanent }) => {
        if (permanent) {
          // Mất focus vĩnh viễn (app khác chiếm audio)
          // → Pause, không tự resume
          await TrackPlayer.pause();
          console.log('[AudioFocus] Mất focus vĩnh viễn, tạm dừng');
          return;
        }
        
        if (paused) {
          // Tạm mất focus (cuộc gọi, Siri, notification)
          // → Lưu trạng thái + Pause
          const state = await TrackPlayer.getPlaybackState();
          wasPlayingBeforeInterruption.current = state.state === State.Playing;
          await TrackPlayer.pause();
          console.log('[AudioFocus] Tạm mất focus, đã pause');
        } else {
          // Lấy lại focus (cuộc gọi kết thúc, app khác dừng)
          // → Resume nếu trước đó đang phát
          if (wasPlayingBeforeInterruption.current) {
            await TrackPlayer.play();
            console.log('[AudioFocus] Đã lấy lại focus, tự động phát lại');
          }
        }
      }
    );
    
    return () => focusListener.remove();
  }, []);
}
```

#### Cấu hình Native (bắt buộc)

```typescript
// iOS: ios/StudyLanguage/Info.plist
// Thêm key để cho phép background audio:
// <key>UIBackgroundModes</key>
// <array><string>audio</string></array>

// Android: android/app/src/main/AndroidManifest.xml
// Thêm permissions cho foreground service:
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
// <uses-permission android:name="android.permission.WAKE_LOCK" />

// Track Player service: android/app/src/main/java/.../TrackPlayerService.java
// (Tự động tạo bởi react-native-track-player khi link)
```

---

## 9. Background Services

### 9.1 Background Audio

```typescript
// ios/StudyLanguage/Info.plist (cần thêm)
// <key>UIBackgroundModes</key>
// <array><string>audio</string></array>

// android/app/src/main/AndroidManifest.xml (cần thêm)
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
// <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

// Track Player tự xử lý foreground service trên Android
// và background audio session trên iOS
```

### 9.2 Background Sync

```typescript
// services/backgroundSync.ts
import BackgroundFetch from 'react-native-background-fetch';

const BACKGROUND_SYNC_TASK = 'background-sync';

/**
 * Mục đích: Đăng ký background sync task
 * Tham số đầu vào: không có
 * Tham số đầu ra: void
 * Khi nào sử dụng: Gọi 1 lần khi app khởi động
 */
export async function registerBackgroundSync() {
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // phút
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
    },
    async (taskId) => {
      // Đồng bộ dữ liệu chờ
      console.log('[BackgroundFetch] Bắt đầu đồng bộ:', taskId);
      await syncService.syncPendingData();
      BackgroundFetch.finish(taskId);
    },
    async (taskId) => {
      // Timeout handler
      console.log('[BackgroundFetch] Hết thời gian:', taskId);
      BackgroundFetch.finish(taskId);
    }
  );
}
```

---

## 10. Security

### 10.1 Secure Storage

```typescript
// services/storage/secure.ts
import * as Keychain from 'react-native-keychain';

/**
 * Mục đích: Lưu trữ bảo mật (tokens, credentials)
 * Tham số đầu vào: key, value (string)
 * Tham số đầu ra: string | null
 * Khi nào sử dụng: Auth tokens, refresh tokens
 */
export const secureStorage = {
  set: async (key: string, value: string) => {
    await Keychain.setGenericPassword(key, value, { service: key });
  },
  
  get: async (key: string) => {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  },
  
  delete: async (key: string) => {
    await Keychain.resetGenericPassword({ service: key });
  },
};
```

### 10.2 Security Checklist

| Item | Implementation |
|------|---------------|
| Tokens | react-native-keychain (iOS Keychain / Android Keystore) |
| API calls | HTTPS only |
| Sensitive logs | Disabled in production |
| SSL Pinning | react-native-ssl-pinning |

---

## 11. Performance

### 11.1 Optimizations

| Area | Technique |
|------|-----------|
| Lists | FlatList + React.memo |
| Images | Progressive loading |
| Bundle | Code splitting |
| Start time | Lazy loading |
| Memory | Cleanup on unmount |

### 11.2 Monitoring

| Metric | Tool |
|--------|------|
| Crashes | Sentry |
| Performance | Firebase Performance |
| Analytics | Firebase Analytics |

---

## 12. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [Roadmap.md](Roadmap.md) - Implementation timeline
- [UI_Design_System.md](../design/UI_Design_System.md) - Design system
