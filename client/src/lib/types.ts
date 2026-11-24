export type Emotion = 'alegria' | 'tristeza' | 'enojo' | 'miedo' | 'sorpresa';
export type ActivityType = 'identifica' | 'une' | 'que_harias' | 'respira' | 'expreso' | 'observa' | 'escucha';
export type ActivityStatus = 'bloqueada' | 'nueva' | 'en_curso' | 'completada';

export interface Preferences {
  fontScale: 'normal' | 'grande' | 'muy_grande';
  highContrast: boolean;
  volume: number;
  muted: boolean;
  voiceRate: number;
  readMode: 'texto' | 'audio' | 'ambos';
  reduceMotion: boolean;
}

export interface Session {
  child: { id: number; name: string; avatarId: number; tutorialDone: boolean } | null;
  family: { id: number; name: string } | null;
}

export interface WeeklyStatus {
  goal: number;
  completed: number;
  reached: boolean;
  days: { key: string; label: string; short: string; played: boolean; isToday: boolean }[];
}

export interface LevelInfo {
  level: number;
  levelName: string;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
  isMax: boolean;
}

export interface Mascot {
  stage: 1 | 2 | 3;
  name: string;
}

export interface Profile extends LevelInfo {
  id: number;
  name: string;
  avatarId: number;
  age: number | null;
  tutorialDone: boolean;
  mascot: Mascot;
  weekly: WeeklyStatus;
}

export interface ModuleSummary {
  id: number;
  code: string;
  title: string;
  worldTitle: string;
  skill: string;
  position: number;
  icon: string;
  unlocked: boolean;
  complete: boolean;
  completedCount: number;
  total: number;
  starsEarned: number;
  starsPossible: number;
}

export interface MapActivity {
  id: number;
  title: string;
  type: ActivityType;
  typeLabel: string;
  instruction: string;
  position: number;
  estMinutes: number;
  questionCount: number;
  emotion: Emotion | null;
  status: ActivityStatus;
  stars: number;
}

export interface MapModule extends ModuleSummary {
  activities: MapActivity[];
}

export interface MapData {
  modules: MapModule[];
  current: { activityId: number; moduleId: number } | null;
}

export interface HomeData {
  profile: Profile;
  continue: { moduleId: number; moduleTitle: string; activityId: number; activityTitle: string; inProgress: boolean } | null;
  last: { activityId: number; title: string; type: string; stars: number; finishedAt: string; moduleTitle: string } | null;
  modules: ModuleSummary[];
  pendingHelp: number;
}

export interface QuestionBase {
  id: number;
  position: number;
  prompt: string;
  story: string | null;
  scene: string | null;
  sceneAlt: string | null;
  hint1: string | null;
  hint2: string | null;
}

export interface ChoiceOption {
  id: number;
  label: string;
  emotion: Emotion | null;
  image: string | null;
}

export interface ChoiceQuestion extends QuestionBase {
  options: ChoiceOption[];
}

export interface PairQuestion extends QuestionBase {
  items: { id: number; label: string; image: string | null }[];
  emotions: { code: Emotion; label: string }[];
}

export interface ExpressQuestion extends QuestionBase {
  emotions: { id: number; code: Emotion; label: string; image: string }[];
  reasons: { id: number; label: string; image: string }[];
}

export type AnyQuestion = ChoiceQuestion | PairQuestion | ExpressQuestion;

export interface Activity {
  id: number;
  moduleId: number;
  moduleTitle: string;
  type: ActivityType;
  typeLabel: string;
  title: string;
  instruction: string;
  emotion: Emotion | null;
  estMinutes: number;
  questions: AnyQuestion[];
}

export interface AnswerResult {
  correct: boolean;
  resolved: boolean;
  stars?: number;
  revealed?: boolean;
  persevered?: boolean;
  title: string;
  message: string | null;
  strategy?: string | null;
  hint?: string | null;
  hintLevel?: 1 | 2;
  correctOptionIds?: number[];
  correctPairs?: { itemId: number; emotion: Emotion }[];
  pairResults?: { itemId: number; correct: boolean }[];
  askForHelp?: string;
}

export interface Badge {
  code: string;
  title: string;
  condition: string;
  icon: string;
  earned?: boolean;
  earnedAt?: string | null;
}

export interface Sticker {
  code: string;
  title: string;
  image: string;
  earned: boolean;
  earnedAt: string | null;
  fromActivity: string | null;
}

export interface FinishResult {
  activityId: number;
  activityTitle: string;
  stars: number;
  questionStars: number[];
  xp: { total: number; parts: { label: string; xp: number }[] };
  level: LevelInfo;
  levelUp: boolean;
  mascot: Mascot;
  mascotEvolved: boolean;
  badges: Badge[];
  sticker: { code: string; title: string; image: string } | null;
  weekly: WeeklyStatus;
  moduleCompleted: { id: number; title: string } | null;
  unlockedModule: { id: number; title: string } | null;
  next: { id: number; title: string } | null;
}

export interface RewardsData {
  badges: (Badge & { earned: boolean; earnedAt: string | null })[];
  stickers: Sticker[];
  level: Profile;
  mascot: Mascot;
  weekly: WeeklyStatus;
}
