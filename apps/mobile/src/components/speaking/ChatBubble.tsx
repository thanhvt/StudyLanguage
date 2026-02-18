import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

export type ChatRole = 'ai' | 'user' | 'system';

export interface ChatMessage {
  /** ID unique */
  id: string;
  /** Ai nói: ai, user, hoặc system */
  role: ChatRole;
  /** Nội dung tin nhắn */
  text: string;
  /** URL audio (cho AI response) */
  audioUrl?: string;
  /** Timestamp */
  timestamp: number;
}

interface ChatBubbleProps {
  /** Tin nhắn cần hiển thị */
  message: ChatMessage;
  /** Khi user nhấn nút phát audio */
  onPlayAudio?: (audioUrl: string) => void;
  /** Khi user nhấn "Nói lại" trên bubble của mình */
  onReSpeak?: (message: ChatMessage) => void;
  /** Đang phát audio của bubble này */
  isPlaying?: boolean;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị 1 tin nhắn chat trong Coach Session
 * Tham số đầu vào: message, onPlayAudio, onReSpeak, isPlaying
 * Tham số đầu ra: JSX.Element — bubble chat AI hoặc User
 * Khi nào sử dụng:
 *   - CoachSessionScreen: render mỗi message trong FlatList
 *   - RoleplaySessionScreen: render dialogue AI/User
 */
export default function ChatBubble({
  message,
  onPlayAudio,
  onReSpeak,
  isPlaying = false,
}: ChatBubbleProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;
  const isAI = message.role === 'ai';
  const isUser = message.role === 'user';

  // System message (announcement)
  if (message.role === 'system') {
    return (
      <View style={styles.systemContainer}>
        <AppText
          variant="bodySmall"
          className="text-neutrals400 text-center italic"
          raw>
          {message.text}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.rowRight : styles.rowLeft,
      ]}>
      <View
        style={[
          styles.bubble,
          isAI
            ? [styles.aiBubble, {backgroundColor: colors.surface}]
            : [styles.userBubble, {backgroundColor: `${speakingColor}25`}],
        ]}>
        {/* Nội dung text */}
        <AppText
          variant="body"
          style={{color: colors.foreground}}
          raw>
          {message.text}
        </AppText>

        {/* Action row */}
        <View style={styles.actionRow}>
          {/* Nút phát audio (cho AI) */}
          {isAI && message.audioUrl && onPlayAudio && (
            <TouchableOpacity
              onPress={() => onPlayAudio(message.audioUrl!)}
              style={[styles.actionBtn, {backgroundColor: `${speakingColor}20`}]}
              activeOpacity={0.7}>
              <Icon
                name={isPlaying ? 'Pause' : 'Volume2'}
                className="w-4 h-4"
                style={{color: speakingColor}}
              />
            </TouchableOpacity>
          )}

          {/* Nút "Nói lại" (cho User) */}
          {isUser && onReSpeak && (
            <TouchableOpacity
              onPress={() => onReSpeak(message)}
              style={[styles.actionBtn, {backgroundColor: `${speakingColor}15`}]}
              activeOpacity={0.7}>
              <Icon
                name="RefreshCw"
                className="w-3.5 h-3.5"
                style={{color: speakingColor}}
              />
              <AppText
                variant="caption"
                style={{color: speakingColor, marginLeft: 4}}
                raw>
                Nói lại
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  bubbleRow: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  aiBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  systemContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
});
