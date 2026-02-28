import React, {useState} from 'react';
import {
  ScrollView,
  View,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {AppText, Icon} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useAuthStore} from '@/store/useAuthStore';

// Loại góp ý
const FEEDBACK_TYPES = [
  {id: 'bug', label: 'Lỗi', icon: 'Bug'},
  {id: 'feature', label: 'Tính năng', icon: 'Lightbulb'},
  {id: 'other', label: 'Khác', icon: 'MessageSquare'},
] as const;

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['id'];

// Giới hạn ký tự tin nhắn
const MAX_MESSAGE_LENGTH = 500;

/**
 * Mục đích: Màn hình góp ý — cho phép user gửi bug, feature request, hoặc feedback
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Navigation từ ProfileScreen → "Góp ý"
 */
export default function FeedbackScreen() {
  const colors = useColors();

  // Tự điền email từ auth state nếu có
  const userEmail = useAuthStore(state => state.user?.email ?? '');

  // Form state
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState(userEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra form hợp lệ
  const isValid = message.trim().length >= 10 && rating > 0;

  /**
   * Mục đích: Gửi góp ý lên server
   * Tham số đầu vào: không có (lấy từ form state)
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi user nhấn nút "Gửi góp ý"
   */
  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      console.log('📨 [Feedback] Đang gửi góp ý...', {type, rating, messageLength: message.length});

      // TODO: Gọi API thực tế POST /api/feedback
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   body: JSON.stringify({ type, message, rating, email }),
      // });

      // Giả lập gọi API
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      console.log('✅ [Feedback] Gửi thành công');
      Alert.alert(
        'Cảm ơn bạn! 🎉',
        'Góp ý của bạn đã được gửi thành công. Chúng tôi sẽ xem xét sớm nhất.',
        [{text: 'OK', onPress: () => {
          // Reset form
          setMessage('');
          setRating(0);
          setType('bug');
        }}],
      );
    } catch (error) {
      console.error('❌ [Feedback] Lỗi gửi góp ý:', error);
      Alert.alert('Lỗi', 'Không thể gửi góp ý. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 40}}
        keyboardShouldPersistTaps="handled">
        {/* === Loại góp ý (Type Chips) === */}
        <View className="px-4 pt-4">
          <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
            Loại góp ý
          </AppText>
          <View className="flex-row gap-3">
            {FEEDBACK_TYPES.map(item => {
              const isSelected = type === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setType(item.id)}
                  className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary + '20'
                      : colors.neutrals900,
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: colors.primary + '50',
                  }}>
                  <Icon
                    name={item.icon as any}
                    className="w-4 h-4 mr-1.5"
                    style={{color: isSelected ? colors.primary : colors.neutrals400}}
                  />
                  <AppText
                    variant="caption"
                    className="font-sans-medium"
                    style={{color: isSelected ? colors.primary : colors.neutrals300}}
                    raw>
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* === Nội dung (Message Textarea) === */}
        <View className="px-4 mt-6">
          <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
            Nội dung
          </AppText>
          <View
            className="p-4 rounded-2xl"
            style={{backgroundColor: colors.neutrals900}}>
            <TextInput
              value={message}
              onChangeText={text => setMessage(text.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder="Mô tả chi tiết vấn đề hoặc ý tưởng của bạn (tối thiểu 10 ký tự)..."
              placeholderTextColor={colors.neutrals500}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="text-foreground text-base font-sans-regular"
              style={{minHeight: 120, color: colors.foreground}}
            />
            <AppText
              variant="caption"
              className="text-right mt-2"
              style={{
                color: message.length >= MAX_MESSAGE_LENGTH
                  ? '#f43f5e'
                  : colors.neutrals500,
              }}
              raw>
              {message.length}/{MAX_MESSAGE_LENGTH}
            </AppText>
          </View>
        </View>

        {/* === Đánh giá (Star Rating) === */}
        <View className="px-4 mt-6">
          <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
            Đánh giá trải nghiệm
          </AppText>
          <View
            className="flex-row items-center justify-center py-4 rounded-2xl gap-4"
            style={{backgroundColor: colors.neutrals900}}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={8}>
                <Icon
                  name="Star"
                  className="w-8 h-8"
                  style={{
                    color: star <= rating ? '#f59e0b' : colors.neutrals700,
                  }}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* === Email (Optional) === */}
        <View className="px-4 mt-6">
          <AppText variant="label" className="text-neutrals400 mb-3 uppercase" raw>
            Email phản hồi (tuỳ chọn)
          </AppText>
          <View
            className="p-4 rounded-2xl"
            style={{backgroundColor: colors.neutrals900}}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.neutrals500}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="text-foreground text-base font-sans-regular"
              style={{color: colors.foreground}}
            />
          </View>
          <AppText variant="caption" className="text-neutrals500 mt-1.5 px-1" raw>
            Chúng tôi sẽ phản hồi qua email này nếu cần thiết
          </AppText>
        </View>

        {/* === Nút gửi (Submit) === */}
        <View className="px-4 mt-8">
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="py-4 rounded-2xl items-center active:opacity-90"
            style={{
              backgroundColor: isValid ? colors.primary : colors.neutrals800,
              opacity: isSubmitting ? 0.6 : 1,
            }}>
            <AppText
              variant="label"
              className="font-sans-semibold"
              style={{color: isValid ? '#000000' : colors.neutrals500}}
              raw>
              {isSubmitting ? 'Đang gửi...' : 'Gửi góp ý'}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
