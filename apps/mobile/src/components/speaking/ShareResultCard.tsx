import React, {useRef, useState} from 'react';
import {View, TouchableOpacity, Platform, Alert} from 'react-native';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {calculateGrade} from '@/services/api/speaking';

// ============================================
// TYPES
// ============================================

interface ShareResultCardProps {
  /** Điểm tổng 0-100 */
  score: number;
  /** Câu luyện tập */
  sentence: string;
  /** Chủ đề */
  topic?: string;
  /** Mode (practice / conversation / shadowing / tongue-twister) */
  mode?: string;
  /** Streak ngày */
  streak?: number;
  /** Sub-scores */
  pronunciation?: number;
  fluency?: number;
  pace?: number;
  /** Ngày */
  date?: string;
}

/** Social share options — 6 icons theo mockup */
const SHARE_OPTIONS_ROW1 = [
  {id: 'facebook', label: 'Facebook', emoji: '📘'},
  {id: 'instagram', label: 'IG Story', emoji: '📸'},
  {id: 'messenger', label: 'Messenger', emoji: '💬'},
];

const SHARE_OPTIONS_ROW2 = [
  {id: 'copy', label: 'Copy Image', emoji: '📋'},
  {id: 'save', label: 'Save to Photos', emoji: '💾'},
  {id: 'more', label: 'More options', emoji: '⋯'},
];

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mục đích: Card kết quả chia sẻ — gradient background, score ring, QR, social share
 * Tham số đầu vào: ShareResultCardProps (score, sentence, topic, mode, streak, sub-scores)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: FeedbackScreen → nhấn "Chia sẻ kết quả" → hiển thị card
 */
export default function ShareResultCard({
  score,
  sentence,
  topic = 'General',
  mode = 'practice',
  streak = 0,
  pronunciation = 0,
  fluency = 0,
  pace = 0,
  date,
}: ShareResultCardProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const grade = calculateGrade(score);
  const scoreColor = score >= 90 ? '#22C55E' : score >= 70 ? '#F59E0B' : '#EF4444';
  const displayDate = date ?? new Date().toLocaleDateString('vi-VN');

  /**
   * Mục đích: Capture card → image → share/save theo action
   * Tham số đầu vào: action (social platform ID)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút social share
   */
  const handleShare = async (action: string) => {
    haptic.medium();
    setIsSharing(true);

    try {
      // Capture card thành image
      const uri = await viewShotRef.current?.capture?.();

      if (!uri) {
        console.error('❌ [Share] Không thể capture card');
        Alert.alert('Lỗi', 'Không thể tạo ảnh card. Vui lòng thử lại.');
        setIsSharing(false);
        return;
      }

      console.log('📸 [Share] Đã capture card:', uri);
      const shareMessage = `🎤 Tôi đạt ${score} điểm (${grade}) trên StudyLanguage Speaking! #StudyLanguage #Speaking`;
      const fileUri = Platform.OS === 'ios' ? uri : `file://${uri}`;

      switch (action) {
        case 'facebook':
        case 'instagram':
        case 'messenger':
          // Phát qua social app cụ thể — dùng Share.shareSingle nếu có
          try {
            const socialMap = {
              facebook: Share.Social.FACEBOOK,
              instagram: Share.Social.INSTAGRAM_STORIES,
              messenger: Share.Social.MESSENGER,
            } as const;
            await Share.shareSingle({
              url: fileUri,
              social: socialMap[action as keyof typeof socialMap],
              type: 'image/png',
            });
          } catch {
            // Fallback về native share sheet nếu app không có
            await Share.open({url: fileUri, type: 'image/png'}).catch(() => {});
          }
          break;

        case 'copy':
          // Copy text kết quả vào clipboard
          const text = `🎤 StudyLanguage Speaking\n📝 "${sentence}"\n🎯 Điểm: ${score}/100 (${grade})\n📊 Phát âm: ${pronunciation} | Trôi chảy: ${fluency} | Tốc độ: ${pace}`;
          Clipboard.setString(text);
          Alert.alert('✅ Đã copy', 'Kết quả đã được copy vào clipboard');
          console.log('📋 [Share] Đã copy text');
          break;

        case 'save':
          // Save image to camera roll
          try {
            await CameraRoll.saveAsset(fileUri, {type: 'photo'});
            Alert.alert('✅ Đã lưu', 'Ảnh đã được lưu vào Photos');
            console.log('💾 [Share] Đã lưu ảnh');
          } catch (saveErr) {
            console.error('❌ [Share] Lỗi lưu ảnh:', saveErr);
            Alert.alert('Lỗi', 'Không thể lưu ảnh. Vui lòng cấp quyền Photos.');
          }
          break;

        case 'more':
        default:
          await Share.open({
            url: fileUri,
            title: `StudyLanguage — Điểm Speaking: ${score}`,
            message: shareMessage,
            type: 'image/png',
          }).catch(() => {});
          break;
      }
    } catch (err: any) {
      // User cancel share dialog — không cần báo lỗi
      if (err?.message !== 'User did not share') {
        console.error('❌ [Share] Lỗi share:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={{gap: 16}}>
      {/* Capturable Card */}
      <ViewShot
        ref={viewShotRef}
        options={{format: 'png', quality: 1.0}}
        style={{borderRadius: 20, overflow: 'hidden'}}>
        <View
          style={{
            padding: 24,
            borderRadius: 20,
            backgroundColor: '#1a1a2e',
            position: 'relative',
          }}>
          {/* Gradient overlay simulation (teal gradient) */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            backgroundColor: '#0d906820',
          }} />

          {/* App Branding Header */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
            <AppText variant="body" weight="bold" style={{color: '#FFFFFF'}}>
              🌐 StudyLanguage 🎤
            </AppText>
            <AppText variant="caption" style={{color: '#FFFFFF80'}}>
              {displayDate}
            </AppText>
          </View>

          {/* Score Ring + Grade — centered */}
          <View style={{alignItems: 'center', marginBottom: 20}}>
            {/* Score circle ring */}
            <View style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              borderWidth: 6,
              borderColor: scoreColor,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: scoreColor + '12',
            }}>
              <AppText variant="heading1" weight="bold" style={{color: '#FFFFFF', fontSize: 36}}>
                {score}
              </AppText>
              <AppText variant="caption" style={{color: '#FFFFFF80', marginTop: -2}}>
                /100
              </AppText>
            </View>
            {/* Grade badge */}
            <View style={{
              marginTop: 8,
              paddingHorizontal: 18,
              paddingVertical: 5,
              borderRadius: 12,
              backgroundColor: scoreColor + '30',
            }}>
              <AppText variant="body" weight="bold" style={{color: scoreColor}}>
                {grade}
              </AppText>
            </View>
          </View>

          {/* Sentence */}
          <View style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginBottom: 12,
          }}>
            <AppText variant="body" style={{color: '#FFFFFF', textAlign: 'center'}}>
              "{sentence}"
            </AppText>
          </View>

          {/* Topic / Mode / Date meta (like mockup) */}
          <View style={{marginBottom: 12}}>
            <AppText variant="caption" style={{color: '#FFFFFF80'}}>
              Topic: {topic}
            </AppText>
            <AppText variant="caption" style={{color: '#FFFFFF80'}}>
              Mode: {mode}
            </AppText>
            <AppText variant="caption" style={{color: '#FFFFFF80'}}>
              Date: {displayDate}
            </AppText>
          </View>

          {/* Streak + QR row */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            {streak > 0 ? (
              <View style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: '#F59E0B20',
              }}>
                <AppText variant="caption" weight="bold" style={{color: '#F59E0B'}}>
                  🔥 {streak} ngày liên tục
                </AppText>
              </View>
            ) : (
              <View />
            )}
            {/* QR Code */}
            <View style={{backgroundColor: '#FFF', padding: 5, borderRadius: 6}}>
              <QRCode
                value="https://studylanguage.app/speaking"
                size={52}
                backgroundColor="#FFF"
              />
            </View>
          </View>
        </View>
      </ViewShot>

      {/* Social Share Grid — 6 icons (2 rows × 3) theo mockup */}
      <View style={{gap: 10}}>
        <View style={{flexDirection: 'row', gap: 10}}>
          {SHARE_OPTIONS_ROW1.map(opt => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.7}
              disabled={isSharing}
              onPress={() => handleShare(opt.id)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.surface,
                alignItems: 'center',
                gap: 4,
                opacity: isSharing ? 0.6 : 1,
              }}>
              <AppText variant="body">{opt.emoji}</AppText>
              <AppText variant="caption" weight="semibold" style={{fontSize: 10}}>
                {opt.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{flexDirection: 'row', gap: 10}}>
          {SHARE_OPTIONS_ROW2.map(opt => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.7}
              disabled={isSharing}
              onPress={() => handleShare(opt.id)}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.surface,
                alignItems: 'center',
                gap: 4,
                opacity: isSharing ? 0.6 : 1,
              }}>
              <AppText variant="body">{opt.emoji}</AppText>
              <AppText variant="caption" weight="semibold" style={{fontSize: 10}}>
                {opt.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
