import { StyleSheet, Dimensions } from 'react-native';
import { GameTheme } from '../types/gameTypes';

const { width: screenWidth } = Dimensions.get('window');

// 공통 게임 테마
export const gameTheme: GameTheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  text: '#e0e0e0',
  textSecondary: '#a0a0a0',
  success: '#4CAF50',
  warning: '#FFD700',
  error: '#FF6B6B',
  accent: '#96CEB4',
};

// 공통 게임 색상들
export const gameColors = {
  numberGuess: '#FF6B6B',
  reaction: '#4ECDC4',
  memory: '#45B7D1',
  math: '#96CEB4',
  bingo: '#F39C12',
  rps: '#9B59B6',
  mukjjippa: '#E74C3C',
};

// 공통 스타일
export const gameStyles = StyleSheet.create({
  // 기본 컨테이너
  gameContainer: {
    flex: 1,
    backgroundColor: gameTheme.background,
    padding: 20,
  },
  
  gameScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },

  // 게임 제목
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: gameTheme.text,
    marginBottom: 20,
    textAlign: 'center',
  },

  // 게임 상태 섹션
  gameStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  gameStatItem: {
    alignItems: 'center',
  },

  gameStatLabel: {
    fontSize: 14,
    color: gameTheme.textSecondary,
    marginBottom: 4,
  },

  gameStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: gameTheme.warning,
  },

  // 게임 안내 메시지
  gameInstruction: {
    backgroundColor: gameTheme.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: gameTheme.primary,
  },

  instructionText: {
    fontSize: 16,
    color: gameTheme.primary,
    textAlign: 'center',
    fontWeight: '600',
  },

  // 게임 버튼들
  gameButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },

  primaryButton: {
    backgroundColor: gameTheme.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  secondaryButton: {
    backgroundColor: gameTheme.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  dangerButton: {
    backgroundColor: gameTheme.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // 게임 결과 섹션
  gameResult: {
    backgroundColor: gameTheme.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: gameTheme.success,
    width: '100%',
    maxWidth: 300,
  },

  gameResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: gameTheme.warning,
    marginBottom: 10,
  },

  gameResultScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: gameTheme.success,
    marginBottom: 8,
  },

  gameResultText: {
    fontSize: 16,
    color: gameTheme.text,
    marginBottom: 6,
    textAlign: 'center',
  },

  gameResultSubText: {
    fontSize: 14,
    color: gameTheme.textSecondary,
    marginBottom: 10,
  },

  // 숫자 패드
  numberPad: {
    alignItems: 'center',
    marginBottom: 20,
  },

  numberButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 180,
    justifyContent: 'space-between',
  },

  numberButton: {
    width: 50,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  numberButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  // 입력 디스플레이
  inputDisplay: {
    backgroundColor: gameTheme.surface,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: gameTheme.primary,
  },

  inputText: {
    fontSize: 22,
    color: gameTheme.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    minHeight: 28,
  },

  // 게임 선택 버튼들
  gameChoiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },

  gameChoiceButton: {
    width: 80,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },

  gameChoiceButtonActive: {
    borderColor: gameTheme.primary,
    borderWidth: 3,
  },

  gameChoiceButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },

  gameChoiceButtonLabel: {
    fontSize: 12,
    color: gameTheme.textSecondary,
    fontWeight: '600',
  },

  // 진행률 표시
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  progressBar: {
    width: 200,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: gameTheme.warning,
  },

  progressText: {
    fontSize: 16,
    color: gameTheme.warning,
    marginLeft: 10,
  },

  // 디버그 정보
  debugInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },

  debugText: {
    color: gameTheme.warning,
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },

  // 애니메이션 및 특수 효과
  flashingButton: {
    backgroundColor: gameTheme.warning,
    borderColor: gameTheme.warning,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },

  selectedButton: {
    backgroundColor: gameTheme.secondary,
    borderColor: gameTheme.secondary,
    borderWidth: 2,
  },

  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },

  // 카드 스타일
  gameCard: {
    backgroundColor: gameTheme.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },

  gameCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: gameTheme.text,
    marginBottom: 8,
  },

  gameCardDescription: {
    fontSize: 14,
    color: gameTheme.textSecondary,
    lineHeight: 20,
  },

  // 반응형 디자인
  responsiveContainer: {
    width: '100%',
    maxWidth: screenWidth > 600 ? 500 : screenWidth - 40,
  },

  // 그리드 레이아웃
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },

  gridItem: {
    width: (screenWidth - 80) / 2,
    marginBottom: 15,
  },
});

// 특정 게임 색상을 적용한 스타일을 생성하는 함수
export const createGameThemeStyles = (gameColor: string) => StyleSheet.create({
  instruction: {
    ...gameStyles.gameInstruction,
    borderColor: gameColor,
  },
  
  instructionText: {
    ...gameStyles.instructionText,
    color: gameColor,
  },
  
  inputDisplay: {
    ...gameStyles.inputDisplay,
    borderColor: gameColor,
  },
  
  inputText: {
    ...gameStyles.inputText,
    color: gameColor,
  },
  
  activeButton: {
    ...gameStyles.gameChoiceButtonActive,
    borderColor: gameColor,
  },
  
  result: {
    ...gameStyles.gameResult,
    borderColor: gameColor,
  },
});

// 반응형 크기 계산 함수들
export const responsive = {
  width: (percentage: number) => (screenWidth * percentage) / 100,
  fontSize: (size: number) => screenWidth > 600 ? size * 1.2 : size,
  padding: (size: number) => screenWidth > 600 ? size * 1.5 : size,
  margin: (size: number) => screenWidth > 600 ? size * 1.5 : size,
};

export default gameStyles; 