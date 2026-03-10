/**
 * Mục đích: Barrel export cho Topic components dùng chung
 * Khi nào sử dụng: Import topic components trong config screens
 *   import { TopicSelector } from '@/components/topic'
 */
export {default as TopicSelector} from './TopicSelector';
export type {TopicSelectorProps} from './TopicSelector';
