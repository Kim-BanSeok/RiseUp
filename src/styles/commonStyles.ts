import { StyleSheet, Dimensions } from 'react-native';

// 화면 크기
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 공통 색상 팔레트
export const COLORS = {
  // 기본 테마
  primary: '#FF7F50',
  secondary: '#FFD4B3',
  background: '#2D1B14',
  surface: '#4A2C1A',
  text: '#FFD4B3',
  textSecondary: '#FFAB7A',
  textMuted: '#A67C61',
  border: '#8B6341',
  
  // 상태 색상
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#CD5C5C',
  info: '#2196F3',
  
  // 투명도
  overlay: 'rgba(0, 0, 0, 0.8)',
  lightOverlay: 'rgba(0, 0, 0, 0.3)',
};

// 공통 크기
export const SIZES = {
  padding: 20,
  margin: 20,
  borderRadius: 12,
  smallBorderRadius: 8,
  
  // 폰트 크기
  fontLarge: 24,
  fontMedium: 16,
  fontSmall: 14,
  fontXSmall: 12,
  
  // 아이콘 크기
  iconLarge: 32,
  iconMedium: 24,
  iconSmall: 16,
};

// 공통 스타일
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  subtitle: {
    fontSize: SIZES.fontMedium,
    color: COLORS.textSecondary,
  },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: SIZES.smallBorderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    color: 'white',
    fontSize: SIZES.fontMedium,
    fontWeight: '600',
  },
  
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
  },
  
  // 반응형 그리드
  halfWidth: {
    width: (SCREEN_WIDTH - 60) / 2,
  },
  
  thirdWidth: {
    width: (SCREEN_WIDTH - 80) / 3,
  },
  
  // 텍스트 스타일
  textCenter: {
    textAlign: 'center',
  },
  
  textBold: {
    fontWeight: 'bold',
  },
  
  // 레이아웃
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  flex1: {
    flex: 1,
  },
  
  // 그림자
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

// 유틸리티 함수
export const getResponsiveWidth = (percentage: number) => SCREEN_WIDTH * (percentage / 100);
export const getResponsiveHeight = (percentage: number) => SCREEN_HEIGHT * (percentage / 100);

// 버튼 크기 계산 (계산기 등에서 사용)
export const getButtonSize = (columns: number = 4, padding: number = 60) => 
  (SCREEN_WIDTH - padding) / columns; 