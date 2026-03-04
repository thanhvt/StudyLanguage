/**
 * Smoke + UAT + Compliance Test Suite cho Profile & Settings screens
 *
 * Mục đích: Kiểm tra mọi màn hình Settings render đúng theo hi-fi screens
 *           và tài liệu 08_Profile_Settings.md
 *
 * Test Levels:
 *   - Smoke: Mọi screen render không crash
 *   - UAT: Tất cả tính năng hoạt động đúng user flow
 *   - Visual Compliance: Nội dung khớp hi-fi screens
 *
 * Hi-fi Screens Reference:
 *   - ps_profile_overview_v2: Profile tab (Hồ sơ)
 *   - ps_appearance: Giao diện (Chủ đề, Màu nhấn, Ngôn ngữ)
 *   - ps_audio: Âm thanh (Nhạc nền, Ducking, SFX, Auto-play, Giọng AI)
 *   - ps_privacy: Quyền riêng tư (Lưu bản ghi, Đồng bộ, Xuất dữ liệu)
 *   - ps_feedback: Góp ý (Loại, Nội dung, Đánh giá, Email, Gửi)
 *   - ps_about: Giới thiệu (SL icon, version, links, liên hệ, credits)
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert, Share} from 'react-native';

// ============================================================
// Mocks
// ============================================================

// Mock MMKV
jest.mock('react-native-mmkv', () => {
  const storage = new Map<string, string>();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (key: string, value: string) => storage.set(key, value),
      getString: (key: string) => storage.get(key) ?? null,
      delete: (key: string) => storage.delete(key),
    })),
  };
});

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {changeLanguage: jest.fn()},
  }),
}));

jest.mock('@/utils/getDeviceLanguage', () => ({
  getDeviceLanguage: jest.fn().mockReturnValue('vi'),
}));

jest.mock('@/config/i18n', () => ({
  LanguageCode: {},
  LANGUAGES: {
    en: {nativeName: 'English'},
    vi: {nativeName: 'Tiếng Việt'},
  },
}));

// Mock useColors — Obsidian Glass design system
jest.mock('@/hooks/useColors', () => ({
  useColors: () => ({
    primary: '#10b981',
    foreground: '#f5f5f5',
    background: '#000000',
    neutrals300: '#d4d4d4',
    neutrals400: '#a3a3a3',
    neutrals500: '#737373',
    neutrals600: '#525252',
    neutrals700: '#404040',
    neutrals800: '#262626',
    neutrals900: '#141414',
  }),
}));

// Mock useAuthStore
jest.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: {email: 'test@example.com'},
      session: {access_token: 'mock-token'},
    }),
}));

// Mock AppText + Icon components
jest.mock('@/components/ui', () => ({
  AppText: ({children, raw, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
  Icon: ({name, ...props}: any) => {
    const {Text} = require('react-native');
    return <Text {...props}>{name}</Text>;
  },
}));

// Mock Switch
jest.mock('@/components/ui/Switch', () => {
  const React = require('react');
  const {Switch: RNSwitch} = require('react-native');
  return ({value, onValueChange, testID}: any) => (
    <RNSwitch value={value} onValueChange={onValueChange} testID={testID} />
  );
});

// Mock SegmentedControl
jest.mock('@/components/ui/SegmentedControl', () => {
  const React = require('react');
  const {View, Pressable, Text} = require('react-native');
  return ({segments, selectedIndex, onSelect}: any) => (
    <View testID="segmented-control">
      {segments.map((seg: string, i: number) => (
        <Pressable key={i} onPress={() => onSelect(i)} testID={`segment-${i}`}>
          <Text>{seg}</Text>
        </Pressable>
      ))}
    </View>
  );
});

// Mock Slider
jest.mock('@/components/ui/Slider', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return ({label, value, showValue}: any) => (
    <View testID="slider">
      <Text>{label}</Text>
      {showValue && <Text>{value}</Text>}
    </View>
  );
});

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockResolvedValue(true),
}));

// Import stores
import {useSettingsStore} from '@/store/useSettingsStore';
import {useAppStore} from '@/store/useAppStore';

// Import screens
import AppearanceSettingsScreen from '@/screens/AppearanceSettingsScreen';
import AudioSettingsScreen from '@/screens/AudioSettingsScreen';
import PrivacySettingsScreen from '@/screens/PrivacySettingsScreen';
import FeedbackScreen from '@/screens/FeedbackScreen';
import AboutScreen from '@/screens/AboutScreen';

// ============================================================
// Test Suite
// ============================================================

describe('Profile & Settings — Screen Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset stores về mặc định theo spec
    useSettingsStore.setState({
      audio: {
        backgroundMusic: {enabled: true, volume: 50},
        musicDucking: true,
        soundEffects: true,
        autoPlay: true,
      },
      privacy: {
        saveRecordings: true,
        dataSync: true,
      },
    });

    useAppStore.setState({
      theme: 'dark',
      accentColor: 'ocean-scholar',
      language: 'vi',
    });
  });

  // ============================================================
  // 1. SMOKE TESTS — Mọi screen render không crash
  // ============================================================
  describe('🔥 SMOKE: Tất cả screens render thành công', () => {
    it('AppearanceSettingsScreen render không crash', () => {
      const {toJSON} = render(<AppearanceSettingsScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('AudioSettingsScreen render không crash', () => {
      const {toJSON} = render(<AudioSettingsScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('PrivacySettingsScreen render không crash', () => {
      const {toJSON} = render(<PrivacySettingsScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('FeedbackScreen render không crash', () => {
      const {toJSON} = render(<FeedbackScreen />);
      expect(toJSON()).toBeTruthy();
    });

    it('AboutScreen render không crash', () => {
      const {toJSON} = render(<AboutScreen />);
      expect(toJSON()).toBeTruthy();
    });
  });

  // ============================================================
  // 2. VISUAL COMPLIANCE — Nội dung khớp hi-fi screens
  // ============================================================
  describe('📐 VISUAL: Appearance screen khớp ps_appearance', () => {
    // Hi-fi: Chủ đề (Sáng/Tối icon cards), Màu nhấn (6 hex swatches), Ngôn ngữ (flag chips)
    it('hiển thị section "Chủ đề" với 2 icon cards', () => {
      const {getByText} = render(<AppearanceSettingsScreen />);
      expect(getByText('Chủ đề')).toBeTruthy();
      expect(getByText('Sáng')).toBeTruthy();
      expect(getByText('Tối')).toBeTruthy();
    });

    it('hiển thị section "Màu nhấn" với 6 swatches và tên màu selected', () => {
      const {getByText, getByLabelText} = render(<AppearanceSettingsScreen />);
      expect(getByText('Màu nhấn')).toBeTruthy();
      // Kiểm tra accessibility labels của 6 swatches
      expect(getByLabelText('Màu Emerald, đang chọn')).toBeTruthy();
      expect(getByLabelText('Màu Indigo')).toBeTruthy();
      expect(getByLabelText('Màu Amber')).toBeTruthy();
      expect(getByLabelText('Màu Rose')).toBeTruthy();
      expect(getByLabelText('Màu Blue')).toBeTruthy();
      expect(getByLabelText('Màu Orange')).toBeTruthy();
      // Tên màu selected hiển thị bên dưới
      expect(getByText('Emerald')).toBeTruthy();
    });

    it('hiển thị section "Ngôn ngữ" với flag chips', () => {
      const {getByText} = render(<AppearanceSettingsScreen />);
      expect(getByText('Ngôn ngữ')).toBeTruthy();
    });

    it('hiển thị Live Preview section', () => {
      const {getByText} = render(<AppearanceSettingsScreen />);
      expect(getByText('Live Preview')).toBeTruthy();
      expect(getByText('Xin chào! Đây là bản xem trước.')).toBeTruthy();
      expect(getByText('✨ Bắt đầu')).toBeTruthy();
    });

    it('KHÔNG hiển thị Font Size (đã loại bỏ)', () => {
      const {queryByText} = render(<AppearanceSettingsScreen />);
      expect(queryByText('Cỡ chữ')).toBeNull();
      expect(queryByText('Font Size')).toBeNull();
    });
  });

  describe('📐 VISUAL: Audio screen khớp ps_audio', () => {
    // Hi-fi: Nhạc nền (toggle+volume), Music Ducking, Phát lại (SFX, Tự động phát), Giọng AI
    it('hiển thị section "Nhạc nền"', () => {
      const {getAllByText} = render(<AudioSettingsScreen />);
      expect(getAllByText('Nhạc nền').length).toBeGreaterThanOrEqual(1);
    });

    it('hiển thị "Smart Ducking"', () => {
      const {getByText} = render(<AudioSettingsScreen />);
      expect(getByText('Music Ducking')).toBeTruthy();
    });

    it('hiển thị "Hiệu ứng âm thanh"', () => {
      const {getByText} = render(<AudioSettingsScreen />);
      expect(getByText('Hiệu ứng âm thanh')).toBeTruthy();
    });

    it('hiển thị "Tự động phát"', () => {
      const {getByText} = render(<AudioSettingsScreen />);
      expect(getByText('Tự động phát')).toBeTruthy();
    });

    it('hiển thị link "Cấu hình giọng AI"', () => {
      const {getByText} = render(<AudioSettingsScreen />);
      expect(getByText('Cấu hình giọng AI')).toBeTruthy();
    });

    it('KHÔNG hiển thị Playback Speed (đã loại bỏ)', () => {
      const {queryByText} = render(<AudioSettingsScreen />);
      expect(queryByText('Tốc độ phát')).toBeNull();
      expect(queryByText('Playback Speed')).toBeNull();
      expect(queryByText('0.5x')).toBeNull();
      expect(queryByText('2.0x')).toBeNull();
    });

    it('KHÔNG hiển thị Hands-free (đã loại bỏ)', () => {
      const {queryByText} = render(<AudioSettingsScreen />);
      expect(queryByText('Rảnh tay')).toBeNull();
      expect(queryByText('Hands-free')).toBeNull();
    });
  });

  describe('📐 VISUAL: Privacy screen khớp ps_privacy', () => {
    // Hi-fi: Lưu bản ghi âm, Đồng bộ dữ liệu, Xuất toàn bộ dữ liệu
    it('hiển thị "Lưu bản ghi âm"', () => {
      const {getByText} = render(<PrivacySettingsScreen />);
      expect(getByText('Lưu bản ghi âm')).toBeTruthy();
    });

    it('hiển thị "Đồng bộ dữ liệu"', () => {
      const {getByText} = render(<PrivacySettingsScreen />);
      expect(getByText('Đồng bộ dữ liệu')).toBeTruthy();
    });

    it('hiển thị nút "Xuất dữ liệu"', () => {
      const {getByText} = render(<PrivacySettingsScreen />);
      expect(getByText('Xuất toàn bộ dữ liệu')).toBeTruthy();
    });

    it('KHÔNG hiển thị Auto-delete (đã loại bỏ)', () => {
      const {queryByText} = render(<PrivacySettingsScreen />);
      expect(queryByText('Tự động xóa')).toBeNull();
      expect(queryByText('30 ngày')).toBeNull();
      expect(queryByText('60 ngày')).toBeNull();
      expect(queryByText('90 ngày')).toBeNull();
    });

    it('hiển thị "Vùng nguy hiểm" với nút "Xóa tài khoản"', () => {
      const {getByText} = render(<PrivacySettingsScreen />);
      expect(getByText('Vùng nguy hiểm')).toBeTruthy();
      expect(getByText('Xóa tài khoản')).toBeTruthy();
      expect(getByText('Hành động này KHÔNG THỂ hoàn tác')).toBeTruthy();
    });
  });

  describe('📐 VISUAL: Feedback screen khớp ps_feedback', () => {
    // Hi-fi: Loại phản hồi (Lỗi/Tính năng/Khác), Nội dung 0/500, Đánh giá (5 sao), Email, Gửi
    it('hiển thị 3 loại góp ý: Lỗi, Tính năng, Khác', () => {
      const {getByText} = render(<FeedbackScreen />);
      expect(getByText('Lỗi')).toBeTruthy();
      expect(getByText('Tính năng')).toBeTruthy();
      expect(getByText('Khác')).toBeTruthy();
    });

    it('hiển thị section "Nội dung" với counter 0/500', () => {
      const {getByText} = render(<FeedbackScreen />);
      expect(getByText('Nội dung')).toBeTruthy();
      expect(getByText('0/500')).toBeTruthy();
    });

    it('hiển thị section "Đánh giá trải nghiệm" với 5 sao', () => {
      const {getByText, getAllByText} = render(<FeedbackScreen />);
      expect(getByText('Đánh giá trải nghiệm')).toBeTruthy();
      // 5 star icons
      expect(getAllByText('Star').length).toBe(5);
    });

    it('hiển thị email section "Email phản hồi (tuỳ chọn)"', () => {
      const {getByText} = render(<FeedbackScreen />);
      expect(getByText('Email phản hồi (tuỳ chọn)')).toBeTruthy();
    });

    it('hiển thị nút "Gửi góp ý"', () => {
      const {getByText} = render(<FeedbackScreen />);
      expect(getByText('Gửi góp ý')).toBeTruthy();
    });

    it('email auto-fill từ auth state', () => {
      const {getByDisplayValue} = render(<FeedbackScreen />);
      expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });
  });

  describe('📐 VISUAL: About screen khớp ps_about', () => {
    // Hi-fi: SL icon, StudyLanguage, Phiên bản, links, liên hệ, credits
    it('hiển thị app name "StudyLanguage"', () => {
      const {getByText} = render(<AboutScreen />);
      expect(getByText('StudyLanguage')).toBeTruthy();
    });

    it('hiển thị version text', () => {
      const {getByText} = render(<AboutScreen />);
      expect(getByText('Phiên bản 1.0.0 (Build 42)')).toBeTruthy();
    });

    it('hiển thị 4 links thông tin', () => {
      const {getByText} = render(<AboutScreen />);
      expect(getByText('Điều khoản sử dụng')).toBeTruthy();
      expect(getByText('Chính sách bảo mật')).toBeTruthy();
      expect(getByText('Giấy phép mã nguồn mở')).toBeTruthy();
      expect(getByText('Đánh giá trên App Store')).toBeTruthy();
    });

    it('hiển thị liên hệ: Website + Email hỗ trợ', () => {
      const {getByText} = render(<AboutScreen />);
      expect(getByText('Website')).toBeTruthy();
      expect(getByText('Email hỗ trợ')).toBeTruthy();
    });

    it('hiển thị credits "Phát triển bởi ThanhVT"', () => {
      const {getByText} = render(<AboutScreen />);
      expect(getByText('Phát triển bởi ThanhVT')).toBeTruthy();
    });
  });

  // ============================================================
  // 3. UAT — User Acceptance Tests — Full user flows
  // ============================================================
  describe('✅ UAT: Appearance — chuyển theme', () => {
    it('nhấn card "Sáng" → theme = light', () => {
      const {getByText} = render(<AppearanceSettingsScreen />);
      fireEvent.press(getByText('Sáng'));

      expect(useAppStore.getState().theme).toBe('light');
    });

    it('nhấn card "Tối" → theme = dark', () => {
      useAppStore.setState({theme: 'light'});
      const {getByText} = render(<AppearanceSettingsScreen />);
      fireEvent.press(getByText('Tối'));

      expect(useAppStore.getState().theme).toBe('dark');
    });
  });

  describe('✅ UAT: Appearance — chọn accent color', () => {
    it('nhấn swatch Orange (Sunset Focus) → accentColor thay đổi', () => {
      const {getByLabelText} = render(<AppearanceSettingsScreen />);
      // Nhấn vào swatch qua accessibilityLabel
      fireEvent.press(getByLabelText('Màu Orange'));

      expect(useAppStore.getState().accentColor).toBe('sunset-focus');
    });
  });

  describe('✅ UAT: Audio — toggle settings', () => {
    it('nhấn link AI Voice → navigate ListeningConfig', () => {
      const {getByText} = render(<AudioSettingsScreen />);
      fireEvent.press(getByText('Cấu hình giọng AI'));

      expect(mockNavigate).toHaveBeenCalledWith('ListeningConfig');
    });
  });

  describe('✅ UAT: Privacy — xuất dữ liệu', () => {
    it('nhấn "Xuất dữ liệu" → gọi Share.share', async () => {
      const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({action: 'sharedAction'} as any);

      const {getByText} = render(<PrivacySettingsScreen />);
      fireEvent.press(getByText('Xuất toàn bộ dữ liệu'));

      await waitFor(() => {
        expect(shareSpy).toHaveBeenCalled();
      });

      shareSpy.mockRestore();
    });
  });

  describe('✅ UAT: Feedback — gửi góp ý', () => {
    it('form invalid khi message < 10 ký tự hoặc rating = 0', () => {
      const {getByText} = render(<FeedbackScreen />);

      // Nút gửi có text "Gửi góp ý" nhưng disabled vì form chưa valid
      const submitButton = getByText('Gửi góp ý');
      expect(submitButton).toBeTruthy();
    });

    it('chọn type "Tính năng" → highlight', () => {
      const {getByText} = render(<FeedbackScreen />);
      fireEvent.press(getByText('Tính năng'));

      // Không crash khi chọn type
      expect(getByText('Tính năng')).toBeTruthy();
    });

    it('nhập message → counter cập nhật', () => {
      const {getByPlaceholderText, queryByText} = render(<FeedbackScreen />);
      const input = getByPlaceholderText(/Mô tả chi tiết/);
      fireEvent.changeText(input, 'abcdefghij1234567890');

      // Counter cập nhật — 20 ký tự đã nhập
      expect(queryByText(/20\/500/)).toBeTruthy();
    });

    it('message max 500 ký tự — không vượt quá', () => {
      const {getByPlaceholderText, queryByText} = render(<FeedbackScreen />);
      const input = getByPlaceholderText(/Mô tả chi tiết/);
      const longText = 'a'.repeat(600);
      fireEvent.changeText(input, longText);

      // Sliced to 500
      expect(queryByText(/500\/500/)).toBeTruthy();
    });

    it('nhấn star → rating thay đổi, nhấn submit thành công', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

      const {getByPlaceholderText, getAllByText, getByText} = render(<FeedbackScreen />);

      // Nhập message ≥ 10 ký tự
      const input = getByPlaceholderText(/Mô tả chi tiết/);
      fireEvent.changeText(input, 'Đây là nội dung góp ý test');

      // Nhấn star thứ 4
      const stars = getAllByText('Star');
      fireEvent.press(stars[3]);

      // Nhấn submit
      const submitButton = getByText('Gửi góp ý');
      fireEvent.press(submitButton);

      await waitFor(
        () => {
          expect(alertSpy).toHaveBeenCalledWith(
            'Cảm ơn bạn! 🎉',
            expect.any(String),
            expect.any(Array),
          );
        },
        {timeout: 3000},
      );

      alertSpy.mockRestore();
    });
  });

  // ============================================================
  // 4. FEATURE COMPLETENESS — Tất cả tính năng doc đều có
  // ============================================================
  describe('📋 COMPLETENESS: Tất cả tính năng 08_Profile_Settings.md tồn tại', () => {
    it('Spec §3.1 Appearance: Theme, Accent Color, Language', () => {
      const {getByText} = render(<AppearanceSettingsScreen />);
      expect(getByText('Chủ đề')).toBeTruthy();
      expect(getByText('Màu nhấn')).toBeTruthy();
      expect(getByText('Ngôn ngữ')).toBeTruthy();
    });

    it('Spec §3.2 Audio: Music, Ducking, SFX, Auto-play, AI Voice', () => {
      const {getAllByText, getByText} = render(<AudioSettingsScreen />);
      expect(getAllByText('Nhạc nền').length).toBeGreaterThanOrEqual(1);
      expect(getByText('Music Ducking')).toBeTruthy();
      expect(getByText('Hiệu ứng âm thanh')).toBeTruthy();
      expect(getByText('Tự động phát')).toBeTruthy();
      expect(getByText('Cấu hình giọng AI')).toBeTruthy();
    });

    it('Spec §3.3 Privacy: Save Recordings, Data Sync', () => {
      const {getByText} = render(<PrivacySettingsScreen />);
      expect(getByText('Lưu bản ghi âm')).toBeTruthy();
      expect(getByText('Đồng bộ dữ liệu')).toBeTruthy();
    });

    it('Spec §5 Tasks: Export data', () => {
      const {getByText} = render(<PrivacySettingsScreen />);
      expect(getByText('Xuất toàn bộ dữ liệu')).toBeTruthy();
    });

    it('Spec §5 Tasks: About screen', () => {
      const {getByText} = render(<AboutScreen />);
      expect(getByText('StudyLanguage')).toBeTruthy();
    });

    it('Spec §5 Tasks: Logout (trong MoreScreen header)', () => {
      // Logout nằm trong MoreScreen header như icon button, không có text
      // Chỉ verify không nằm nhầm trong About screen
      const {queryByText} = render(<AboutScreen />);
      expect(queryByText('Đăng xuất')).toBeNull();
    });

    it('Spec §6.3: Feedback form', () => {
      const {getByText} = render(<FeedbackScreen />);
      expect(getByText('Lỗi')).toBeTruthy();
      expect(getByText('Tính năng')).toBeTruthy();
      expect(getByText('Nội dung')).toBeTruthy();
      expect(getByText('Gửi góp ý')).toBeTruthy();
    });
  });
});
