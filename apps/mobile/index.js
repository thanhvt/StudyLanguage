import 'react-native-url-polyfill/auto';
import { AppRegistry, LogBox } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';
import { playbackService } from './src/services/audio/trackPlayer';

// Tắt warning NativeWind CssInterop - đây là bug đã biết của NativeWind 4.x
// Xem: https://github.com/marklawlor/nativewind/issues
LogBox.ignoreLogs([
  /Cannot update a component.*CssInterop/,
]);

AppRegistry.registerComponent(appName, () => App);

// Đăng ký playback service cho Track Player (xử lý notification controls)
TrackPlayer.registerPlaybackService(() => playbackService);
