import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';
import { playbackService } from './src/services/audio/trackPlayer';

AppRegistry.registerComponent(appName, () => App);

// Đăng ký playback service cho Track Player (xử lý notification controls)
TrackPlayer.registerPlaybackService(() => playbackService);
