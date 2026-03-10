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

/** Persona info — truyền vào khi Roleplay mode */
export interface PersonaInfo {
  /** Tên persona (vd: "Dr. Smith") */
  name: string;
  /** Role (vd: "Bác sĩ") */
  role: string;
  /** Emoji avatar */
  avatar?: string;
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
  /** Persona info — khi Roleplay mode, hiển thị avatar + name cho AI */
  persona?: PersonaInfo | null;
  /** Accent color tuỳ chỉnh — mặc định speaking.dark */
  accentColor?: string;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị 1 tin nhắn chat trong AI Conversation
 * Tham số đầu vào: message, onPlayAudio, onReSpeak, isPlaying, persona, accentColor
 * Tham số đầu ra: JSX.Element — bubble chat AI (có thể có persona) hoặc User
 * Khi nào sử dụng:
 *   - ConversationScreen: render mỗi message trong FlatList
 *   - Roleplay: hiển thị thêm persona avatar/name header
 *   - Free Talk: hiển thị AI bubble bình thường
 */
export default function ChatBubble({
  message,
  onPlayAudio,
  onReSpeak,
  isPlaying = false,
  persona,
  accentColor,
}: ChatBubbleProps) {
  const colors = useColors();
  const accent = accentColor || SKILL_COLORS.speaking.dark;
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

      {/* Persona Avatar — Roleplay AI only */}
      {isAI && persona && (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, {backgroundColor: `${accent}20`}]}>
            <AppText style={{fontSize: 16}} raw>
              {persona.avatar || '🎭'}
            </AppText>
          </View>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isAI
            ? [styles.aiBubble, {backgroundColor: colors.surface}]
            : [styles.userBubble, {backgroundColor: `${accent}25`}],
          // Khi có persona, bubble cần shift sang phải
          isAI && persona && {maxWidth: '72%'},
        ]}>

        {/* Persona Name Header — Roleplay AI only */}
        {isAI && persona && (
          <AppText
            variant="caption"
            weight="bold"
            style={{color: accent, marginBottom: 4}}
            raw>
            {persona.name}
            <AppText variant="caption" style={{color: colors.neutrals400, fontWeight: 'normal'}} raw>
              {' '}• {persona.role}
            </AppText>
          </AppText>
        )}

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
              style={[styles.actionBtn, {backgroundColor: `${accent}20`}]}
              activeOpacity={0.7}>
              <Icon
                name={isPlaying ? 'Pause' : 'Volume2'}
                className="w-4 h-4"
                style={{color: accent}}
              />
            </TouchableOpacity>
          )}

          {/* Nút "Nói lại" (cho User) */}
          {isUser && onReSpeak && (
            <TouchableOpacity
              onPress={() => onReSpeak(message)}
              style={[styles.actionBtn, {backgroundColor: `${accent}15`}]}
              activeOpacity={0.7}>
              <Icon
                name="RefreshCw"
                className="w-3.5 h-3.5"
                style={{color: accent}}
              />
              <AppText
                variant="caption"
                style={{color: accent, marginLeft: 4}}
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
    flexDirection: 'row',
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
