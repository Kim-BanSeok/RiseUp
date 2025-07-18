import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';

export interface TabConfig {
  id: string;
  title: string;
  icon: string;
  component: React.ComponentType<any>;
  badge?: number;
  isStack?: boolean;
}

interface CustomTabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onSettingsPress?: () => void;
  scrollable?: boolean;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onSettingsPress,
  scrollable = false,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  
  // 4개씩 보이도록 탭 너비 조정
  const tabWidth = Math.max(80, Math.min(100, screenWidth / 4));

  const renderTabItem = (tab: TabConfig, index: number) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabItem,
          { width: tabWidth },
          isActive && styles.activeTabItem,
        ]}
        onPress={() => onTabChange(tab.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
          {tab.icon}
        </Text>
        <Text style={[styles.tabTitle, isActive && styles.activeTabTitle]}>
          {tab.title}
        </Text>
        {tab.badge && tab.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tab.badge > 99 ? '99+' : tab.badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={true} // 항상 스크롤 가능하도록
        bounces={false}
        decelerationRate="fast"
      >
        {/* 일반 탭들 */}
        {tabs.map((tab, index) => renderTabItem(tab, index))}
        
        {/* 고정된 설정 버튼 (맨 오른쪽) */}
        <TouchableOpacity
          style={[styles.settingsButton, { width: tabWidth }]}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
          <Text style={styles.settingsText}>설정</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    // 높이를 더 크게 조정
    maxHeight: 80,  // 70 → 80
    minHeight: 65,  // 55 → 65
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, // 패딩 조정
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // 8 → 10
    paddingHorizontal: 6, // 4 → 6
    minHeight: 60, // 50 → 60
    maxHeight: 80, // 70 → 80
  },
  activeTabItem: {
    backgroundColor: '#333',
    borderRadius: 10, // 8 → 10
  },
  tabIcon: {
    fontSize: 22, // 16 → 22 (훨씬 크게)
    marginBottom: 4, // 2 → 4
  },
  activeTabIcon: {
    color: '#fff',
  },
  tabTitle: {
    fontSize: 11, // 8 → 11 (더 크게)
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 2,        // 1 → 2
    right: 2,      // 1 → 2
    backgroundColor: '#ff4444',
    borderRadius: 8, // 6 → 8
    minWidth: 16,   // 12 → 16
    height: 16,     // 12 → 16
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,    // 6 → 8
    fontWeight: 'bold',
  },
  settingsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // 8 → 10
    paddingHorizontal: 6, // 4 → 6
    minHeight: 60, // 50 → 60
    maxHeight: 80, // 70 → 80
    backgroundColor: '#2a2a2a',
    borderRadius: 10, // 8 → 10
    marginLeft: 4,
  },
  settingsIcon: {
    fontSize: 22, // 18 → 22
    marginBottom: 4, // 2 → 4
  },
  settingsText: {
    fontSize: 11, // 9 → 11
    color: '#888',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CustomTabBar; 