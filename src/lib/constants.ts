export const BEGINNER_MAX_FRET = 5;
export const DEFAULT_MAX_FRET = 10;
export const ADVANCED_MAX_FRET = 17;

export const STRING_NAMES = ["E", "A", "D", "G", "B", "E"] as const;

export const DIFFICULTY_LABELS = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
  expert: "고급",
} as const;

export const VOICING_TYPE_LABELS = {
  open: "오픈 코드",
  easy: "초보자용",
  shell: "핵심음 중심",
  partial: "약식 운지",
  rootless: "루트리스",
  barre: "바레 코드",
  full: "완전 운지",
  advanced: "고급 운지",
} as const;

export const COLLISION_LABELS = {
  low: "충돌 낮음",
  medium: "주의",
  high: "충돌 높음",
} as const;
