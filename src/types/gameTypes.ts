// 공통 게임 인터페이스
export interface BaseGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

// 공통 게임 상태
export interface BaseGameState {
  gameOver: boolean;
  score?: number;
}

// 게임 결과
export interface GameResult {
  score: number;
  message: string;
  isWin: boolean;
}

// 게임 통계
export interface GameStats {
  totalGames: number;
  bestScore: number;
  averageScore: number;
  winRate?: number;
}

// 숫자 맞추기 게임
export interface NumberGameState extends BaseGameState {
  target: number;
  guess: string;
  attempts: number;
  message: string;
}

// 반응속도 게임
export interface ReactionGameState extends BaseGameState {
  waiting: boolean;
  started: boolean;
  startTime: number;
  reactionTime: number;
  bestTime: number;
  attempts: number;
}

// 기억력 게임
export interface MemoryGameState extends BaseGameState {
  sequence: number[];
  userSequence: number[];
  currentStep: number;
  showingSequence: boolean;
  level: number;
  currentShowingIndex: number;
  isFlashing: boolean;
  attempts: number;
}

// 암산 게임
export interface MathProblem {
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  display: string;
}

export interface MathGameState extends BaseGameState {
  problem: MathProblem | null;
  userAnswer: string;
  streak: number;
  timeLeft: number;
  difficulty: number;
  totalProblems: number;
  correctAnswers: number;
}

// 빙고 게임
export interface BingoCell {
  number: number;
  selected: boolean;
  selectedBy: 'player' | 'computer' | null;
  index: number;
}

export interface BingoGameState extends BaseGameState {
  boardSize: number;
  board: BingoCell[];
  computerBoard: BingoCell[];
  completedLines: string[];
  isSetupPhase: boolean;
  isSizeSelection: boolean;
  currentTurn: 'player' | 'computer';
  playerLines: number;
  computerLines: number;
  winner: string | null;
  setupNumbers: string[];
  setupIndex: number;
  selectedSetupIndex: number;
  currentInputNumber: string;
  isInputModalVisible: boolean;
  isAllBingo: boolean;
}

// 가위바위보 게임
export interface RPSGameState extends BaseGameState {
  playerChoice: string | null;
  computerChoice: string | null;
  result: string | null;
  playerScore: number;
  computerScore: number;
  round: number;
  isPlaying: boolean;
}

// 묵찌빠 게임
export interface MukjjippaGameState extends BaseGameState {
  playerChoice: string | null;
  computerChoice: string | null;
  attacker: string | null;
  result: string | null;
  winner: string | null;
  round: number;
  isPlaying: boolean;
  playerScore: number;
  computerScore: number;
}

// 게임 카테고리
export enum GameCategory {
  BRAIN = 'brain',
  REFLEX = 'reflex',
  STRATEGY = 'strategy',
  CASUAL = 'casual'
}

// 게임 난이도
export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

// 게임 정보
export interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  estimatedTime: number; // 분 단위
}

// 게임 히스토리
export interface GameHistory {
  gameId: string;
  gameName: string;
  score: number;
  duration: number; // 초 단위
  completedAt: Date;
  difficulty?: GameDifficulty;
}

// 게임 설정
export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoSave: boolean;
  showHints: boolean;
}

// 공통 버튼 타입
export interface GameButton {
  text: string;
  onPress: () => void;
  style?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// 게임 상태 표시 아이템
export interface GameStatItem {
  label: string;
  value: string | number;
  color?: string;
}

// 공통 색상 테마
export interface GameTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  accent: string;
} 