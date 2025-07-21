import React from 'react';
import { View, Text } from 'react-native';
import CalculatorScreen from '../screens/CalculatorScreen';
import NotesScreen from '../screens/NotesScreen';
import FlashlightScreen from '../screens/FlashlightScreen';
import WeatherScreen from '../screens/WeatherScreen';
import CalendarScreen from '../screens/CalendarScreen';

export interface TabTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  component: React.ComponentType<any>;
  category: 'utility' | 'productivity' | 'health' | 'entertainment' | 'tools';
}

// 개발 예정 화면 컴포넌트
const createDevelopmentScreen = (title: string) => () => (
  <View style={{
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#1A1A1A'
  }}>
    <Text style={{
      color: 'white', 
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 10
    }}>
      🚧 {title}
    </Text>
    <Text style={{
      color: '#A67C61', 
      fontSize: 14,
      textAlign: 'center'
    }}>
      개발 예정입니다
    </Text>
  </View>
);

export const TAB_TEMPLATES: TabTemplate[] = [
  // 유틸리티
  {
    id: 'calculator',
    title: '계산기',
    icon: '🔢',
    description: '간단한 계산 기능',
    component: CalculatorScreen,
    category: 'utility'
  },
  {
    id: 'weather',
    title: '날씨',
    icon: '🌤️',
    description: '현재 날씨 정보',
    component: WeatherScreen,
    category: 'utility'
  },
  {
    id: 'calendar',
    title: '캘린더',
    icon: '📅',
    description: '일정 관리 및 캘린더',
    component: CalendarScreen,
    category: 'utility'
  },
  {
    id: 'flashlight',
    title: '손전등',
    icon: '🔦',
    description: '화면 밝기 조절',
    component: FlashlightScreen, // 실제 컴포넌트로 변경
    category: 'utility'
  },
  
  // 생산성
  {
    id: 'notes',
    title: '메모',
    icon: '📝',
    description: '빠른 메모 작성',
    component: NotesScreen, // 실제 컴포넌트로 변경
    category: 'productivity'
  },
  {
    id: 'calendar',
    title: '캘린더',
    icon: '📅',
    description: '일정 관리',
    component: createDevelopmentScreen('캘린더'),
    category: 'productivity'
  },
  {
    id: 'habit',
    title: '습관',
    icon: '✅',
    description: '습관 트래커',
    component: createDevelopmentScreen('습관 트래커'),
    category: 'productivity'
  },
  
  // 건강
  {
    id: 'meditation',
    title: '명상',
    icon: '🧘‍♂️',
    description: '명상 타이머',
    component: createDevelopmentScreen('명상'),
    category: 'health'
  },
  {
    id: 'exercise',
    title: '운동',
    icon: '💪',
    description: '운동 기록',
    component: createDevelopmentScreen('운동'),
    category: 'health'
  },
  
  // 엔터테인먼트
  {
    id: 'music',
    title: '음악',
    icon: '🎵',
    description: '음악 플레이어',
    component: createDevelopmentScreen('음악'),
    category: 'entertainment'
  },
  {
    id: 'games',
    title: '게임',
    icon: '🎮',
    description: '미니 게임',
    component: createDevelopmentScreen('게임'),
    category: 'entertainment'
  },
  
  // 도구
  {
    id: 'qr',
    title: 'QR코드',
    icon: '📱',
    description: 'QR 스캐너',
    component: createDevelopmentScreen('QR코드'),
    category: 'tools'
  },
  {
    id: 'converter',
    title: '변환기',
    icon: '🔄',
    description: '단위 변환',
    component: createDevelopmentScreen('변환기'),
    category: 'tools'
  },
];

// 카테고리별 필터링 함수
export const getTemplatesByCategory = (category: TabTemplate['category']) => {
  return TAB_TEMPLATES.filter(template => template.category === category);
};

// 카테고리 목록
export const TEMPLATE_CATEGORIES = [
  { id: 'utility', name: '유틸리티', icon: '⚙️' },
  { id: 'productivity', name: '생산성', icon: '📊' },
  { id: 'health', name: '건강', icon: '💚' },
  { id: 'entertainment', name: '엔터테인먼트', icon: '🎭' },
  { id: 'tools', name: '도구', icon: '️' },
] as const; 