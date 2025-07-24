import React from 'react';
import { View, Text } from 'react-native';
import { TabConfig } from './CustomTabBar';
import HomeScreen from '../screens/alarm/HomeScreen';
import TimerScreen from '../screens/timer/TimerScreen';
import StopwatchScreen from '../screens/stopwatch/StopwatchScreen';
import WorldClockScreen from '../screens/worldclock/WorldClockScreen';
import IntervalSignalScreen from '../screens/interval/IntervalSignalScreen';
import SportsTimerScreen from '../screens/sports/SportsTimerScreen';
import CalculatorScreen from '../screens/utilities/CalculatorScreen';
import NotesScreen from '../screens/utilities/NotesScreen';
import FlashlightScreen from '../screens/utilities/FlashlightScreen';
import WeatherScreen from '../screens/utilities/WeatherScreen';
import CalendarScreen from '../screens/utilities/CalendarScreen';
import HabitTrackerScreen from '../screens/utilities/HabitTrackerScreen';
import MeditationTimerScreen from '../screens/timer/MeditationTimerScreen';
import ExerciseTrackerScreen from '../screens/sports/ExerciseTrackerScreen';
import MusicPlayerScreen from '../screens/utilities/MusicPlayerScreen';
import MiniGamesScreen from '../screens/utilities/MiniGamesScreen';
import QRScannerScreen from '../screens/utilities/QRScannerScreen';
import UnitConverterScreen from '../screens/utilities/UnitConverterScreen';

interface TabContentRendererProps {
  tabs?: TabConfig[];
  activeTab?: string;
  navigation?: any;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  tabs = [],
  activeTab = '',
  navigation,
}) => {
  // 디버깅 정보 출력
  console.log(' TabContentRenderer Debug:');
  console.log('  - tabs:', tabs?.map(t => ({ id: t.id, title: t.title, hasComponent: !!t.component })));
  console.log('  - activeTab:', activeTab);
  console.log('  - navigation:', !!navigation);
  console.log('  - tabs length:', tabs?.length);

  // 안전한 탭 찾기
  const currentTab = React.useMemo(() => {
    try {
      if (!tabs || !Array.isArray(tabs) || !activeTab) {
        console.log('❌ 탭 찾기 실패: 조건 불만족');
        return null;
      }
      
      const foundTab = tabs.find(tab => tab && tab.id === activeTab);
      console.log('✅ 찾은 탭:', foundTab ? { id: foundTab.id, title: foundTab.title, hasComponent: !!foundTab.component } : '없음');
      return foundTab || null;
    } catch (error) {
      console.error('❌ 탭 찾기 오류:', error);
      return null;
    }
  }, [tabs, activeTab]);
  
  if (!currentTab) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#888', fontSize: 16, marginBottom: 10 }}>
          탭을 찾을 수 없습니다
        </Text>
        <Text style={{ color: '#666', fontSize: 12 }}>
          activeTab: {activeTab}
        </Text>
        <Text style={{ color: '#666', fontSize: 12 }}>
          tabs: {tabs?.length || 0}개
        </Text>
      </View>
    );
  }

  try {
    const Component = currentTab.component;
    console.log("🚀 렌더링할 컴포넌트:", Component);
    
    if (!Component) {
      console.error('❌ 컴포넌트가 null입니다:', currentTab.title);
      
      // 컴포넌트가 null인 경우 기본 컴포넌트로 대체
      let FallbackComponent = null;
      
      // 기본 탭들
      if (currentTab.id === 'Alarm') {
        FallbackComponent = HomeScreen;
      } else if (currentTab.id === 'Timer') {
        FallbackComponent = TimerScreen;
      } else if (currentTab.id === 'Stopwatch') {
        FallbackComponent = StopwatchScreen;
      } else if (currentTab.id === 'WorldClock') {
        FallbackComponent = WorldClockScreen;
      } else if (currentTab.id === 'IntervalSignal') {
        FallbackComponent = IntervalSignalScreen;
      } else if (currentTab.id === 'SportsTimer') {
        FallbackComponent = SportsTimerScreen;
      }
      // 추가된 탭들
      else if (currentTab.id.includes('calculator')) {
        FallbackComponent = CalculatorScreen;
      } else if (currentTab.id.includes('notes')) {
        FallbackComponent = NotesScreen;
      } else if (currentTab.id.includes('flashlight')) {
        FallbackComponent = FlashlightScreen;
      } else if (currentTab.id.includes('weather')) {
        FallbackComponent = WeatherScreen;
      } else if (currentTab.id.includes('calendar')) {
        FallbackComponent = CalendarScreen;
      } else if (currentTab.id.includes('habit')) {
        FallbackComponent = HabitTrackerScreen;
      } else if (currentTab.id.includes('meditation')) {
        FallbackComponent = MeditationTimerScreen;
      } else if (currentTab.id.includes('exercise')) {
        FallbackComponent = ExerciseTrackerScreen;
      } else if (currentTab.id.includes('music')) {
        FallbackComponent = MusicPlayerScreen;
      } else if (currentTab.id.includes('games')) {
        FallbackComponent = MiniGamesScreen;
      } else if (currentTab.id.includes('qr')) {
        FallbackComponent = QRScannerScreen;
      } else if (currentTab.id.includes('converter')) {
        FallbackComponent = UnitConverterScreen;
      }
      
      if (FallbackComponent) {
        console.log('✅ 대체 컴포넌트 사용:', FallbackComponent.name);
        return (
          <View style={{ flex: 1 }}>
            <FallbackComponent navigation={navigation} />
          </View>
        );
      }
      
      return (
        <View style={{ 
          flex: 1, 
          backgroundColor: '#1A1A1A',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: '#888', fontSize: 16 }}>
            컴포넌트를 로드할 수 없습니다: {currentTab.title}
          </Text>
        </View>
      );
    }
    
    console.log('✅ 컴포넌트 렌더링:', currentTab.title);
    
    // JSX로 렌더링 (함수형 컴포넌트도 지원)
    return (
      <View style={{ flex: 1 }}>
        <Component navigation={navigation} />
      </View>
    );
  } catch (error) {
    console.error('❌ 컴포넌트 렌더링 오류:', error);
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: '#888', fontSize: 16 }}>
          화면을 로드할 수 없습니다: {error.message}
        </Text>
      </View>
    );
  }
};

export default TabContentRenderer;