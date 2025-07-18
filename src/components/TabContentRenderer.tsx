import React from 'react';
import { View, Text } from 'react-native';
import { TabConfig } from './CustomTabBar';

interface TabContentRendererProps {
  tabs?: TabConfig[];
  activeTab?: string;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  tabs = [],
  activeTab = '',
}) => {
  // 디버깅 정보 출력
  console.log(' TabContentRenderer Debug:');
  console.log('  - tabs:', tabs?.map(t => ({ id: t.id, title: t.title, hasComponent: !!t.component })));
  console.log('  - activeTab:', activeTab);
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
      let fallbackComponent = null;
      if (currentTab.id === 'Alarm') {
        fallbackComponent = HomeScreen;
      } else if (currentTab.id === 'Timer') {
        fallbackComponent = TimerScreen;
      } else if (currentTab.id === 'Stopwatch') {
        fallbackComponent = StopwatchScreen;
      } else if (currentTab.id === 'WorldClock') {
        fallbackComponent = WorldClockScreen;
      } else if (currentTab.id === 'IntervalSignal') {
        fallbackComponent = IntervalSignalScreen;
      } else if (currentTab.id === 'SportsTimer') {
        fallbackComponent = SportsTimerScreen;
      }
      
      if (fallbackComponent) {
        console.log('✅ 대체 컴포넌트 사용:', fallbackComponent.name);
        return (
          <View style={{ flex: 1 }}>
            <fallbackComponent />
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
        <Component />
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