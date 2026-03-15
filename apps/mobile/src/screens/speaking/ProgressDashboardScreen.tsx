import React, {useState, useEffect, useCallback} from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {speakingApi} from '@/services/api/speaking';
import DailyGoalCard from '@/components/speaking/DailyGoalCard';
import RadarChart from '@/components/speaking/RadarChart';
import CalendarHeatmap from '@/components/speaking/CalendarHeatmap';
import WeakSoundsCard from '@/components/speaking/WeakSoundsCard';
import BadgeGrid from '@/components/speaking/BadgeGrid';

// ============================================
// TYPES
// ============================================

interface DailyGoalData {
  currentMinutes: number;
  goalMinutes: number;
  sentencesDone: number;
  sessionsDone: number;
  streak: number;
  target: number;
}

interface RadarDataPoint {
  label: string;
  value: number;
}

interface HeatmapEntry {
  date: string;
  minutes: number;
}

interface WeakSound {
  sound: string;
  example: string;
  avgScore: number;
  attempts: number;
}

interface BadgeData {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface WeeklyReport {
  avgScore: number;
  totalMinutes: number;
  totalSessions: number;
  /** Xu hướng điểm 7 ngày gần nhất */
  scoreTrend: number[];
}

// ============================================
// MAIN SCREEN
// ============================================

/**
 * Mục đích: Màn hình tổng quan tiến trình Speaking (Gamification Dashboard)
 * Tham số đầu vào: navigation (từ SpeakingStack)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Speaking Home → tap "Tiến trình" → navigate ProgressDashboard
 */
export default function ProgressDashboardScreen({navigation}: any) {
  const colors = useColors();
  const haptic = useHaptic();

  // State — dữ liệu từ API
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyGoal, setDailyGoal] = useState<DailyGoalData>({
    currentMinutes: 0, goalMinutes: 10, sentencesDone: 0, sessionsDone: 0, streak: 0, target: 10,
  });
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [calendarData, setCalendarData] = useState<HeatmapEntry[]>([]);
  const [weakSounds, setWeakSounds] = useState<WeakSound[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>({
    avgScore: 0, totalMinutes: 0, totalSessions: 0, scoreTrend: [],
  });

  // State — edit goal dialog
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [editGoalValue, setEditGoalValue] = useState('');

  /**
   * Mục đích: Load tất cả data từ API
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Khi screen mount + pull to refresh
   */
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      // Gọi song song 3 API
      const [goalRes, progressRes, badgesRes] = await Promise.all([
        speakingApi.getDailyGoal(),
        speakingApi.getProgress(),
        speakingApi.getBadges(),
      ]);

      setDailyGoal(goalRes);

      if (progressRes) {
        // Chuyển đổi radarChart object thành RadarDataPoint[] cho RadarChart component
        const radar = progressRes.radarChart ?? {pronunciation: 0, fluency: 0, vocabulary: 0, grammar: 0};
        setRadarData([
          {label: 'Phát âm', value: radar.pronunciation ?? 0},
          {label: 'Trôi chảy', value: radar.fluency ?? 0},
          {label: 'Từ vựng', value: radar.vocabulary ?? 0},
          {label: 'Ngữ pháp', value: radar.grammar ?? 0},
        ]);
        setCalendarData(progressRes.calendarHeatmap ?? []);
        setWeakSounds(progressRes.weakSounds ?? []);
        setWeeklyReport(progressRes.weeklyReport ?? {avgScore: 0, totalMinutes: 0, totalSessions: 0, scoreTrend: []});
      }

      setBadges(badgesRes.badges ?? []);
      console.log('✅ [Dashboard] Tải data thành công');
    } catch (err) {
      console.error('❌ [Dashboard] Lỗi tải data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load khi screen focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /**
   * Mục đích: Xử lý kéo refresh
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User kéo xuống để refresh
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  /**
   * Mục đích: Lưu mục tiêu hàng ngày mới
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: EditGoalDialog → nhấn "Lưu"
   */
  const handleSaveGoal = async () => {
    const target = parseInt(editGoalValue, 10);
    if (isNaN(target) || target < 1 || target > 100) {
      console.log('⚠️ [Dashboard] Mục tiêu không hợp lệ:', editGoalValue);
      return;
    }

    haptic.medium();
    const success = await speakingApi.updateDailyGoal(target);
    if (success) {
      setDailyGoal(prev => ({...prev, goalMinutes: target, target}));
      setShowEditGoal(false);
      console.log('✅ [Dashboard] Cập nhật mục tiêu:', target);
    }
  };

  /**
   * Mục đích: Navigate tới practice mode khi tap weak sound
   * Tham số đầu vào: phoneme (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: WeakSoundsCard → tap phoneme
   */
  const handleWeakSoundPress = (phoneme: string) => {
    haptic.light();
    console.log('🔊 [Dashboard] Tap weak sound:', phoneme);
    // Navigate tới Practice với phoneme filter
    navigation.navigate('PracticeConfig', {focusPhoneme: phoneme});
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color="#22C55E" />
        <AppText variant="body" style={{color: colors.neutrals400, marginTop: 12}}>
          Đang tải dữ liệu...
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: colors.background}}
      contentContainerStyle={{paddingBottom: 40}}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#22C55E"
        />
      }>
      {/* Header */}
      <View style={{paddingHorizontal: 20, paddingTop: 16, marginBottom: 20}}>
        <AppText variant="heading2" weight="bold">
          📊 Tiến trình Speaking
        </AppText>
        <AppText variant="caption" style={{color: colors.neutrals400, marginTop: 4}}>
          Theo dõi và cải thiện kỹ năng phát âm
        </AppText>
      </View>

      {/* Daily Goal Card */}
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <DailyGoalCard
          currentMinutes={dailyGoal.currentMinutes}
          goalMinutes={dailyGoal.goalMinutes}
          sentencesDone={dailyGoal.sentencesDone}
          sessionsDone={dailyGoal.sessionsDone}
        />
        {/* Edit goal link */}
        <TouchableOpacity
          onPress={() => {
            setEditGoalValue(String(dailyGoal.target));
            setShowEditGoal(true);
          }}
          style={{alignItems: 'center', marginTop: 4}}>
          <AppText variant="caption" style={{color: '#22C55E'}}>
            ✏️ Mục tiêu: {dailyGoal.target} câu/ngày — Chỉnh
          </AppText>
        </TouchableOpacity>
        {dailyGoal.streak > 0 && (
          <AppText variant="caption" style={{color: '#F59E0B', textAlign: 'center', marginTop: 2}}>
            🔥 Streak: {dailyGoal.streak} ngày
          </AppText>
        )}
      </View>

      {/* ===== C3: Weekly Report Section (MỚI) ===== */}
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <AppText variant="body" weight="semibold" style={{marginBottom: 12}}>
          📅 Báo cáo tuần
        </AppText>
        <View style={{
          flexDirection: 'row',
          gap: 10,
        }}>
          <WeeklyStatCard
            emoji="🎯"
            label="Điểm TB"
            value={`${weeklyReport.avgScore}`}
            color="#22C55E"
            surfaceColor={colors.surface}
          />
          <WeeklyStatCard
            emoji="⏱️"
            label="Phút luyện"
            value={`${weeklyReport.totalMinutes}`}
            color="#F59E0B"
            surfaceColor={colors.surface}
          />
          <WeeklyStatCard
            emoji="🗣️"
            label="Phiên"
            value={`${weeklyReport.totalSessions}`}
            color="#3B82F6"
            surfaceColor={colors.surface}
          />
        </View>

        {/* M4: Score Trend Mini Chart (7 ngày) */}
        {weeklyReport.scoreTrend.length > 0 && (
          <View style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.surface,
          }}>
            <AppText variant="caption" weight="semibold" style={{marginBottom: 8, color: colors.neutrals400}}>
              📈 Xu hướng điểm 7 ngày
            </AppText>
            <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 50}}>
              {weeklyReport.scoreTrend.map((val, i) => {
                const max = Math.max(...weeklyReport.scoreTrend, 1);
                const barHeight = (val / max) * 40 + 4;
                const barColor = val >= 80 ? '#22C55E' : val >= 60 ? '#F59E0B' : '#EF4444';
                return (
                  <View key={i} style={{flex: 1, alignItems: 'center'}}>
                    <View style={{
                      width: '80%',
                      height: barHeight,
                      borderRadius: 4,
                      backgroundColor: barColor,
                    }} />
                  </View>
                );
              })}
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
              <AppText variant="caption" style={{color: colors.neutrals400, fontSize: 9}}>7 ngày trước</AppText>
              <AppText variant="caption" style={{color: colors.neutrals400, fontSize: 9}}>Hôm nay</AppText>
            </View>
          </View>
        )}
      </View>

      {/* Radar Chart — 4 trục theo doc */}
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <AppText variant="body" weight="semibold" style={{marginBottom: 12}}>
          🎯 Phân tích kỹ năng
        </AppText>
        <RadarChart data={radarData} />
      </View>

      {/* Calendar Heatmap */}
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <AppText variant="body" weight="semibold" style={{marginBottom: 12}}>
          🗓️ Lịch luyện tập
        </AppText>
        <CalendarHeatmap data={calendarData} />
      </View>

      {/* Weak Sounds */}
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <AppText variant="body" weight="semibold" style={{marginBottom: 12}}>
          ⚠️ Âm cần cải thiện
        </AppText>
        <WeakSoundsCard
          sounds={weakSounds}
        />
      </View>

      {/* Badge Grid */}
      <View style={{paddingHorizontal: 20, marginBottom: 20}}>
        <AppText variant="body" weight="semibold" style={{marginBottom: 12}}>
          🏅 Huy hiệu
        </AppText>
        <BadgeGrid badges={badges} />
      </View>

      {/* ===== Edit Goal Dialog ===== */}
      <Modal visible={showEditGoal} transparent animationType="fade">
        <Pressable
          style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}
          onPress={() => setShowEditGoal(false)}>
          <Pressable
            onPress={e => e.stopPropagation()}
            style={{
              width: '80%',
              backgroundColor: colors.background,
              borderRadius: 20,
              padding: 24,
            }}>
            <AppText variant="heading3" weight="bold" style={{marginBottom: 16}}>
              🎯 Chỉnh mục tiêu
            </AppText>
            <AppText variant="caption" style={{color: colors.neutrals400, marginBottom: 12}}>
              Số câu nói mỗi ngày (1-100)
            </AppText>
            <TextInput
              value={editGoalValue}
              onChangeText={setEditGoalValue}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="VD: 15"
              placeholderTextColor={colors.neutrals400}
              style={{
                borderWidth: 1.5,
                borderColor: '#22C55E',
                borderRadius: 12,
                padding: 14,
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
                color: colors.foreground,
                marginBottom: 20,
              }}
            />
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity
                onPress={() => setShowEditGoal(false)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                }}>
                <AppText variant="body" weight="semibold">
                  Huỷ
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveGoal}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#22C55E',
                  alignItems: 'center',
                }}>
                <AppText variant="body" weight="bold" style={{color: '#FFF'}}>
                  Lưu
                </AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

// ============================================
// WeeklyStatCard — Card thống kê tuần
// ============================================

interface WeeklyStatCardProps {
  emoji: string;
  label: string;
  value: string;
  color: string;
  surfaceColor: string;
}

/**
 * Mục đích: Hiển thị 1 metric trong Weekly Report
 * Tham số đầu vào: emoji, label, value, color
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ProgressDashboardScreen → Weekly Report section
 */
function WeeklyStatCard({emoji, label, value, color, surfaceColor}: WeeklyStatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 14,
        backgroundColor: surfaceColor,
        alignItems: 'center',
        gap: 4,
      }}>
      <AppText variant="body">{emoji}</AppText>
      <AppText variant="heading3" weight="bold" style={{color}}>
        {value}
      </AppText>
      <AppText variant="caption" style={{opacity: 0.7}}>
        {label}
      </AppText>
    </View>
  );
}
