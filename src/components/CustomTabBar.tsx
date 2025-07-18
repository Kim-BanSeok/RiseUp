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
  scrollable?: boolean;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  scrollable = true,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const animatedValues = useRef(
    tabs.reduce((acc, tab) => {
      acc[tab.id] = new Animated.Value(tab.id === activeTab ? 1 : 0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;
  
  // 탭이 화면에 맞는지 확인
  const tabWidth = screenWidth / tabs.length;
  const shouldScroll = scrollable && (tabWidth < 80 || tabs.length > 5);

  useEffect(() => {
    // 탭 변경 애니메이션
    Object.keys(animatedValues).forEach(tabId => {
      Animated.timing(animatedValues[tabId], {
        toValue: tabId === activeTab ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    if (shouldScroll && scrollViewRef.current) {
      // 활성 탭을 중앙으로 스크롤
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (activeIndex !== -1) {
        const scrollTo = Math.max(0, (activeIndex * 100) - (screenWidth / 2) + 50);
        scrollViewRef.current.scrollTo({
          x: scrollTo,
          animated: true,
        });
      }
    }
  }, [activeTab, shouldScroll, screenWidth]);

  const renderTab = (tab: TabConfig, index: number) => {
    const isActive = tab.id === activeTab;
    const animatedValue = animatedValues[tab.id] || new Animated.Value(0);
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabItem,
          shouldScroll ? styles.scrollableTab : { flex: 1 },
        ]}
        onPress={() => onTabChange(tab.id)}
        activeOpacity={0.7}
      >
        <Animated.View style={[
          styles.tabContent,
          {
            backgroundColor: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', 'rgba(255, 127, 80, 0.1)']
            }),
            borderRadius: 12,
            transform: [{
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05]
              })
            }]
          }
        ]}>
          <Text style={[
            styles.tabIcon,
            isActive ? styles.activeTabIcon : styles.inactiveTabIcon
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.tabLabel,
            isActive ? styles.activeTabLabel : styles.inactiveTabLabel
          ]}>
            {tab.title}
          </Text>
          {tab.badge && tab.badge > 0 && (
            <Animated.View style={[
              styles.badge,
              {
                transform: [{
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2]
                  })
                }]
              }
            ]}>
              <Text style={styles.badgeText}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
        {isActive && (
          <Animated.View style={[
            styles.activeIndicator,
            {
              opacity: animatedValue,
              transform: [{
                scaleX: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                })
              }]
            }
          ]} />
        )}
      </TouchableOpacity>
    );
  };

  if (shouldScroll) {
    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {tabs.map(renderTab)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.fixedTabContainer}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4A2C1A',
    borderTopColor: '#8B6341',
    borderTopWidth: 1,
    height: Platform.OS === 'android' ? 85 : 95,
    paddingBottom: Platform.OS === 'android' ? 20 : 30,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  fixedTabContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: 'relative',
  },
  scrollableTab: {
    minWidth: 80,
    width: 100,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  activeTabIcon: {
    color: '#FF7F50',
  },
  inactiveTabIcon: {
    color: '#A67C61',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#FF7F50',
    fontWeight: '600',
  },
  inactiveTabLabel: {
    color: '#A67C61',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF7F50',
  },
});

export default CustomTabBar; 