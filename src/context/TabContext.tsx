import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabConfig } from '../components/CustomTabBar';
import { DEFAULT_TABS } from '../navigation/TabConfig';

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

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  // 초기값을 DEFAULT_TABS로 설정 (절대 빈 배열이 되지 않도록)
  const [tabs, setTabs] = useState<TabConfig[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState<string>('Alarm');
  const [isLoading, setIsLoading] = useState(true);
  
  // 로딩 완료 여부를 추적하는 ref
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
        
        // 파싱된 탭이 유효한지 확인하고, 유효하지 않으면 기본 탭 사용
        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
          setTabs(parsedTabs);
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
      // 오류 시에도 기본값 사용
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
      await AsyncStorage.setItem('customTabs', JSON.stringify(newTabs));
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

  // 로딩 중이거나 탭이 비어있으면 기본값 제공
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