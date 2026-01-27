# 🏗️ Technical Architecture - Mobile

> **Scope:** React Native + Expo Architecture

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
│  │ (Expo)  │  │(SQLite) │  │(Motion) │  │ (Push)  │        │
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
├── app/                        # Expo Router pages
│   ├── (tabs)/                 # Tab navigation
│   │   ├── index.tsx           # Home
│   │   ├── history.tsx         # History
│   │   ├── vocabulary.tsx      # Vocabulary
│   │   └── profile.tsx         # Profile
│   ├── (auth)/                 # Auth flow
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── listening/              # Listening module
│   │   ├── index.tsx           # Config
│   │   └── [id].tsx            # Player
│   ├── speaking/               # Speaking module
│   │   ├── index.tsx           # Setup
│   │   └── practice.tsx        # Practice
│   ├── reading/                # Reading module
│   │   ├── index.tsx           # Config
│   │   └── [id].tsx            # Article
│   └── writing/                # Writing module
│       ├── index.tsx           # Input
│       └── review.tsx          # Corrections
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layouts/                # Layout components
│   │   ├── SafeAreaLayout.tsx
│   │   └── TabLayout.tsx
│   └── modules/                # Feature-specific components
│       ├── listening/
│       ├── speaking/
│       ├── reading/
│       └── writing/
├── hooks/                      # Custom hooks
│   ├── useAudio.ts
│   ├── useRecording.ts
│   ├── useOffline.ts
│   └── ...
├── services/                   # API & external services
│   ├── api/
│   │   ├── client.ts
│   │   ├── listening.ts
│   │   ├── speaking.ts
│   │   └── ...
│   ├── supabase/
│   │   ├── client.ts
│   │   └── auth.ts
│   └── storage/
│       ├── secure.ts
│       ├── async.ts
│       └── sqlite.ts
├── store/                      # Zustand stores
│   ├── auth.ts
│   ├── settings.ts
│   ├── listening.ts
│   └── ...
├── utils/                      # Utilities
│   ├── helpers.ts
│   └── constants.ts
├── types/                      # TypeScript types
│   └── ...
├── assets/                     # Static assets
│   ├── images/
│   └── fonts/
├── app.json                    # Expo config
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
    ├── Home Tab
    │   └── Home Stack
    │       ├── Home Screen
    │       ├── Listening Stack
    │       │   ├── Config
    │       │   └── Player
    │       ├── Speaking Stack
    │       │   ├── Setup
    │       │   └── Practice
    │       ├── Reading Stack
    │       │   ├── Config
    │       │   └── Article
    │       └── Writing Stack
    │           ├── Input
    │           └── Review
    │
    ├── History Tab
    │   └── History Stack
    │       ├── Timeline
    │       └── Detail
    │
    ├── Vocabulary Tab
    │   └── Vocabulary Stack
    │       ├── Word List
    │       ├── Flashcard Review
    │       └── Word Detail
    │
    └── Profile Tab
        └── Profile Stack
            ├── Profile
            └── Settings
                ├── Appearance
                ├── Notifications
                ├── Audio
                ├── Storage
                └── Privacy
```

### 4.2 Expo Router Configuration

```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: HomeIcon }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarIcon: HistoryIcon }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{ title: 'Vocabulary', tabBarIcon: BookIcon }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: UserIcon }}
      />
    </Tabs>
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
  baseURL: process.env.EXPO_PUBLIC_API_URL,
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
│  │                   Expo AV                             │   │
│  │  ┌──────────────┐    ┌──────────────┐                │   │
│  │  │  Audio.Sound │    │Audio.Recording│               │   │
│  │  │  (Playback)  │    │  (Record)     │               │   │
│  │  └──────────────┘    └──────────────┘                │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Audio Session Config                    │   │
│  │  • Background mode                                    │   │
│  │  • Interruption handling                             │   │
│  │  • Audio focus                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Audio Hook

```typescript
// hooks/useAudio.ts
import { Audio } from 'expo-av';

export function useAudio() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  
  const load = async (uri: string) => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      (status) => setStatus(status)
    );
    setSound(sound);
  };
  
  const play = () => sound?.playAsync();
  const pause = () => sound?.pauseAsync();
  const seek = (position: number) => sound?.setPositionAsync(position);
  const setRate = (rate: number) => sound?.setRateAsync(rate, true);
  
  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);
  
  return { load, play, pause, seek, setRate, status };
}
```

### 8.3 Recording Hook

```typescript
// hooks/useRecording.ts
import { Audio } from 'expo-av';

export function useRecording() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const start = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    setRecording(recording);
    setIsRecording(true);
  };
  
  const stop = async () => {
    if (!recording) return null;
    
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setIsRecording(false);
    
    return uri;
  };
  
  return { start, stop, isRecording };
}
```

---

## 9. Background Services

### 9.1 Background Audio

```typescript
// app.json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    },
    "android": {
      "foregroundService": {
        "name": "Audio Player",
        "icon": "./assets/icon.png"
      }
    }
  }
}
```

### 9.2 Background Sync

```typescript
// services/backgroundSync.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SYNC_TASK = 'background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await syncService.syncPendingData();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

---

## 10. Security

### 10.1 Secure Storage

```typescript
// services/storage/secure.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  set: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  
  get: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  
  delete: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};
```

### 10.2 Security Checklist

| Item | Implementation |
|------|---------------|
| Tokens | SecureStore (encrypted) |
| API calls | HTTPS only |
| Sensitive logs | Disabled in production |
| SSL Pinning | Expo Plugin |
| Biometric | expo-local-authentication |

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
| Analytics | Expo Analytics |

---

## 12. Related Documents

- [00_Mobile_Overview.md](../00_Mobile_Overview.md) - Project overview
- [Roadmap.md](Roadmap.md) - Implementation timeline
- [UI_Design_System.md](../design/UI_Design_System.md) - Design system
