import React from 'react';
import { View } from 'react-native';
import { TabConfig } from './CustomTabBar';

interface TabContentRendererProps {
  tabs: TabConfig[];
  activeTab: string;
}

const TabContentRenderer: React.FC<TabContentRendererProps> = ({
  tabs,
  activeTab,
}) => {
  const currentTab = tabs.find(tab => tab.id === activeTab);
  
  if (!currentTab) {
    return <View style={{ flex: 1, backgroundColor: '#1A1A1A' }} />;
  }

  const Component = currentTab.component;
  
  // 스택 네비게이터인 경우와 일반 화면인 경우 구분
  return (
    <View style={{ flex: 1 }}>
      <Component />
    </View>
  );
};

export default TabContentRenderer;