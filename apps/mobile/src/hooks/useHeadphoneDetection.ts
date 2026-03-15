import {useEffect, useState, useCallback, useRef} from 'react';
import {NativeEventEmitter, NativeModules, Platform, DeviceEventEmitter} from 'react-native';

// =======================
// Types
// =======================

type ConnectionType = 'wired' | 'bluetooth' | 'none';

interface HeadphoneDetectionResult {
  /** Tai nghe có đang kết nối không */
  isConnected: boolean;
  /** Loại kết nối: wired, bluetooth, none */
  connectionType: ConnectionType;
}

// =======================
// Hook
// =======================

/**
 * Mục đích: Phát hiện tai nghe có đang kết nối hay không (wired / bluetooth)
 * Tham số đầu vào: không có
 * Tham số đầu ra: HeadphoneDetectionResult { isConnected, connectionType }
 * Khi nào sử dụng:
 *   - ShadowingConfigScreen: hiển thị HeadphoneStatusCard
 *   - ShadowingSessionScreen: quyết định bật AEC / volume ducking
 *   - HeadphoneWarningModal: hiện khi chưa kết nối
 */
export function useHeadphoneDetection(): HeadphoneDetectionResult {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const listenerRef = useRef<any>(null);
  const androidListenerRef = useRef<any>(null);
  /** Polling interval ref cho Android fallback */
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Mục đích: Kiểm tra trạng thái tai nghe ban đầu
   * Tham số đầu vào: không
   * Tham số đầu ra: void (cập nhật state)
   * Khi nào sử dụng: Hook mount lần đầu
   */
  const checkInitialState = useCallback(async () => {
    try {
      // Thử dùng react-native-device-info nếu có
      const DeviceInfo = require('react-native-device-info');
      if (DeviceInfo?.isHeadphonesConnectedSync) {
        const connected = DeviceInfo.isHeadphonesConnectedSync();
        setIsConnected(connected);
        setConnectionType(connected ? 'wired' : 'none');
        console.log(`🎧 [Headphone] Trạng thái ban đầu: ${connected ? 'Đã kết nối' : 'Chưa kết nối'}`);
        return;
      }
    } catch {
      // react-native-device-info chưa được cài
      console.log('⚠️ [Headphone] react-native-device-info không khả dụng, dùng fallback');
    }

    // Fallback: mặc định không có headphone
    setIsConnected(false);
    setConnectionType('none');
  }, []);

  /**
   * Mục đích: Lắng nghe sự kiện thay đổi route audio (cắm/rút tai nghe)
   * Tham số đầu vào: không
   * Tham số đầu ra: cleanup function
   * Khi nào sử dụng: Hook mount → subscribe event, unmount → unsubscribe
   */
  const subscribeToEvents = useCallback(() => {
    try {
      if (Platform.OS === 'ios') {
        // iOS: dùng AudioSession route change notification
        const {AudioSession} = NativeModules;
        if (AudioSession) {
          const emitter = new NativeEventEmitter(AudioSession);
          listenerRef.current = emitter.addListener(
            'AudioRouteChange',
            (event: {reason: string; outputs: {type: string}[]}) => {
              const hasHeadphone = event.outputs?.some(
                o =>
                  o.type === 'Headphones' ||
                  o.type === 'BluetoothA2DPOutput' ||
                  o.type === 'BluetoothHFP' ||
                  o.type === 'BluetoothLE',
              );
              const btOutput = event.outputs?.find(
                o =>
                  o.type === 'BluetoothA2DPOutput' ||
                  o.type === 'BluetoothHFP' ||
                  o.type === 'BluetoothLE',
              );

              setIsConnected(!!hasHeadphone);
              setConnectionType(
                hasHeadphone
                  ? btOutput
                    ? 'bluetooth'
                    : 'wired'
                  : 'none',
              );
              console.log(`🎧 [Headphone] Route thay đổi: ${hasHeadphone ? 'Kết nối' : 'Ngắt kết nối'}`);
            },
          );
        }
      } else if (Platform.OS === 'android') {
        // ===== ANDROID HEADPHONE DETECTION =====

        // Cách 1: Subscribe native AudioManager events qua NativeModules
        const {AudioManagerModule} = NativeModules;
        if (AudioManagerModule?.addHeadsetListener) {
          // Native module có sẵn → dùng event listener trực tiếp
          const emitter = new NativeEventEmitter(AudioManagerModule);
          androidListenerRef.current = emitter.addListener(
            'HeadsetStateChanged',
            (event: {state: number; type: string}) => {
              const connected = event.state === 1;
              const isBluetooth = event.type === 'bluetooth';
              setIsConnected(connected);
              setConnectionType(connected ? (isBluetooth ? 'bluetooth' : 'wired') : 'none');
              console.log(`🎧 [Headphone] Android event: ${connected ? 'Kết nối' : 'Ngắt'} (${event.type})`);
            },
          );
          console.log('🎧 [Headphone] Android native listener đã subscribe');
        } else {
          // ===== Cách 2: Fallback — Polling react-native-device-info mỗi 2s =====
          console.log('⚠️ [Headphone] Android: không có native module, dùng polling fallback');
          try {
            const DeviceInfo = require('react-native-device-info');
            if (DeviceInfo?.isHeadphonesConnected) {
              pollingRef.current = setInterval(async () => {
                try {
                  const connected = await DeviceInfo.isHeadphonesConnected();
                  setIsConnected(prev => {
                    if (prev !== connected) {
                      console.log(`🎧 [Headphone] Android polling: ${connected ? 'Kết nối' : 'Ngắt'}`);
                      setConnectionType(connected ? 'wired' : 'none');
                    }
                    return connected;
                  });
                } catch {
                  // Im lặng — tránh spam log
                }
              }, 2000);
            }
          } catch {
            console.log('⚠️ [Headphone] Android: react-native-device-info không khả dụng cho polling');
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ [Headphone] Không thể subscribe events:', err);
    }
  }, []);

  useEffect(() => {
    checkInitialState();
    subscribeToEvents();

    return () => {
      // Cleanup iOS listener
      if (listenerRef.current?.remove) {
        listenerRef.current.remove();
      }
      // Cleanup Android listener
      if (androidListenerRef.current?.remove) {
        androidListenerRef.current.remove();
      }
      // Cleanup Android polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [checkInitialState, subscribeToEvents]);

  return {isConnected, connectionType};
}
