import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabConfig } from '../components/CustomTabBar';
import { DEFAULT_TABS } from '../navigation/TabConfig';
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
import { View, Text } from 'react-native';

interface TabContextType {
  tabs: TabConfig[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  addTab: (tab: TabConfig) => void;
  removeTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  resetToDefault: () => void;
  isLoading: boolean;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};

interface TabProviderProps {
  children: ReactNode;
}

// 컴포넌트 매핑 함수
const getComponentById = (id: string) => {
  // ID에서 기본 ID 추출 (타임스탬프 제거)
  const baseId = id.split('_')[0];
  
  switch (baseId) {
    case 'calculator':
      return CalculatorScreen;
    case 'notes':
      return NotesScreen;
    case 'flashlight':
      return FlashlightScreen;
    case 'weather':
      return WeatherScreen;
    case 'calendar':
      return CalendarScreen;
    case 'habit':
      return HabitTrackerScreen;
    case 'meditation':
      return MeditationTimerScreen;
    case 'exercise':
      return ExerciseTrackerScreen;
    case 'music':
      return MusicPlayerScreen;
    case 'games':
      return MiniGamesScreen;
    case 'qr':
      return QRScannerScreen;
    case 'converter':
      return UnitConverterScreen;
    default:
      return null;
  }
};

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [tabs, setTabs] = useState<TabConfig[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState<string>('Alarm');
  const [isLoading, setIsLoading] = useState(true);
  
  const isLoadedRef = useRef(false);

  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    try {
      console.log(' 탭 데이터 로딩 시작...');
      console.log(' 기본 탭 개수:', DEFAULT_TABS.length);
      
      const savedTabs = await AsyncStorage.getItem('customTabs');
      const savedActiveTab = await AsyncStorage.getItem('activeTab');
      
      console.log(' 저장된 탭:', savedTabs);
      console.log('📦 저장된 활성 탭:', savedActiveTab);
      
      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        console.log('✅ 파싱된 탭:', parsedTabs);
        
        // 파싱된 탭이 유효한지 확인하고, 컴포넌트 재연결
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          const restoredTabs = parsedTabs.map((tab: any) => {
            // 기본 탭인지 확인
            const isDefault = DEFAULT_TABS.some(dt => dt.id === tab.id);
            if (isDefault) {
              return tab; // 기본 탭은 그대로 유지
            }
            
            // 추가된 탭의 경우 컴포넌트 재연결
            const component = getComponentById(tab.id);
            console.log(`재연결 시도: ${tab.id} -> ${component?.name || 'null'}`);
            
            return {
              ...tab,
              component: component || (() => (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A'}}>
                  <Text style={{color: 'white', fontSize: 18}}>🚧 {tab.title}</Text>
                  <Text style={{color: '#A67C61', marginTop: 10}}>개발 예정</Text>
                </View>
              ))
            };
          });
          
          setTabs(restoredTabs);
        } else {
          console.log('⚠️ 저장된 탭이 유효하지 않음, 기본 탭 사용');
          setTabs(DEFAULT_TABS);
        }
      } else {
        console.log(' 기본 탭 사용');
        setTabs(DEFAULT_TABS);
      }
      
      if (savedActiveTab) {
        console.log('✅ 활성 탭 설정:', savedActiveTab);
        setActiveTab(savedActiveTab);
      } else {
        console.log('📝 기본 활성 탭 사용: Alarm');
        setActiveTab('Alarm');
      }
    } catch (error) {
      console.error('❌ 탭 로드 실패:', error);
      setTabs(DEFAULT_TABS);
      setActiveTab('Alarm');
    } finally {
      setIsLoading(false);
      isLoadedRef.current = true;
      console.log('✅ 탭 로딩 완료');
    }
  };

  const saveTabs = async (newTabs: TabConfig[]) => {
    try {
      // 컴포넌트 함수는 저장하지 않고 ID만 저장
      const tabsToSave = newTabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        icon: tab.icon,
        badge: tab.badge,
        isStack: tab.isStack,
        // component는 저장하지 않음
      }));
      
      await AsyncStorage.setItem('customTabs', JSON.stringify(tabsToSave));
      console.log('💾 탭 저장 완료');
    } catch (error) {
      console.error('❌ 탭 저장 실패:', error);
    }
  };

  const addTab = (newTab: TabConfig) => {
    setTabs(prevTabs => {
      const updatedTabs = [...prevTabs, newTab];
      saveTabs(updatedTabs);
      return updatedTabs;
    });
  };

  const removeTab = (tabId: string) => {
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.filter(tab => tab.id !== tabId);
      saveTabs(updatedTabs);
      
      if (activeTab === tabId && updatedTabs.length > 0) {
        setActiveTab(updatedTabs[0].id);
      }
      
      return updatedTabs;
    });
  };

  const reorderTabs = (fromIndex: number, toIndex: number) => {
    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      saveTabs(newTabs);
      return newTabs;
    });
  };

  const resetToDefault = () => {
    setTabs(DEFAULT_TABS);
    setActiveTab('Alarm');
    saveTabs(DEFAULT_TABS);
  };

  const handleSetActiveTab = (tabId: string) => {
    console.log('🔄 활성 탭 변경:', tabId);
    setActiveTab(tabId);
    AsyncStorage.setItem('activeTab', tabId).catch(error => {
      console.error('❌ 활성 탭 저장 실패:', error);
    });
  };

  const safeTabs = isLoading || !tabs || tabs.length === 0 ? DEFAULT_TABS : tabs;
  const safeActiveTab = activeTab || 'Alarm';

  return (
    <TabContext.Provider
      value={{
        tabs: safeTabs,
        activeTab: safeActiveTab,
        setActiveTab: handleSetActiveTab,
        addTab,
        removeTab,
        reorderTabs,
        resetToDefault,
        isLoading,
      }}
    >
      {children}
    </TabContext.Provider>
  );
}; 