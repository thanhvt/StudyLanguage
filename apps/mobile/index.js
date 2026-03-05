import 'react-native-url-polyfill/auto';
import { AppRegistry, LogBox } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';
import { playbackService } from './src/services/audio/trackPlayer';

// Tắt warning không ảnh hưởng đến app
// - CssInterop: bug đã biết của NativeWind 4.x
// - getSleepTimerProgress: react-native-track-player khai báo JS method nhưng native iOS chưa có
// - method signature: native module bridge warning về missing Objective-C methods
// - Lock: Supabase auto-refresh tick thử acquire lock ngay lập tức (by design)
LogBox.ignoreLogs([
  /Cannot update a component.*CssInterop/,
  /getSleepTimerProgress/,
  /method signature/,
  /can not be found in the Objec/,
  /TrackPlayerModule/,
  /Lock.*acquisition timed out/,
  'Lock "lock:',
]);

AppRegistry.registerComponent(appName, () => App);

// Đăng ký playback service cho Track Player (xử lý notification controls)
TrackPlayer.registerPlaybackService(() => playbackService);
