import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  resetTabs: () => void;
  updateTab: (tabId: string, updates: Partial<TabConfig>) => void;
  isTabManagerVisible: boolean;
  setTabManagerVisible: (visible: boolean) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const TAB_STORAGE_KEY = '@RiseUp:customTabs';
const ACTIVE_TAB_KEY = '@RiseUp:activeTab';

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [tabs, setTabs] = useState<TabConfig[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState('Alarm');
  const [isTabManagerVisible, setTabManagerVisible] = useState(false);

  // 앱 시작 시 저장된 탭 설정 로드
  useEffect(() => {
    loadTabSettings();
  }, []);

  // 탭 설정 변경 시 저장
  useEffect(() => {
    saveTabSettings();
  }, [tabs, activeTab]);

  const loadTabSettings = async () => {
    try {
      const [savedTabs, savedActiveTab] = await Promise.all([
        AsyncStorage.getItem(TAB_STORAGE_KEY),
        AsyncStorage.getItem(ACTIVE_TAB_KEY)
      ]);

      if (savedTabs) {
        const parsedTabs = JSON.parse(savedTabs);
        // 컴포넌트 참조를 다시 연결
        const restoredTabs = parsedTabs.map((tab: any) => {
          const defaultTab = DEFAULT_TABS.find(dt => dt.id === tab.id);
          return {
            ...tab,
            component: defaultTab?.component || DEFAULT_TABS[0].component
          };
        });
        setTabs(restoredTabs);
      }

      if (savedActiveTab) {
        setActiveTab(savedActiveTab);
      }
    } catch (error) {
      console.error('탭 설정 로드 실패:', error);
    }
  };

  const saveTabSettings = async () => {
    try {
      // 컴포넌트 참조를 제외하고 저장
      const tabsToSave = tabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        icon: tab.icon,
        badge: tab.badge,
        isStack: tab.isStack
      }));

      await Promise.all([
        AsyncStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabsToSave)),
        AsyncStorage.setItem(ACTIVE_TAB_KEY, activeTab)
      ]);
    } catch (error) {
      console.error('탭 설정 저장 실패:', error);
    }
  };

  const addTab = (tab: TabConfig) => {
    setTabs(prev => [...prev, tab]);
  };

  const removeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      // 제거된 탭이 활성 탭이었다면 첫 번째 탭으로 변경
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[0].id);
      }
      return newTabs;
    });
  };

  const reorderTabs = (fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  };

  const resetTabs = () => {
    setTabs(DEFAULT_TABS);
    setActiveTab('Alarm');
  };

  const updateTab = (tabId: string, updates: Partial<TabConfig>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  };

  return (
    <TabContext.Provider value={{
      tabs,
      activeTab,
      setActiveTab,
      addTab,
      removeTab,
      reorderTabs,
      resetTabs,
      updateTab,
      isTabManagerVisible,
      setTabManagerVisible,
    }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
}; 