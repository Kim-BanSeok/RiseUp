import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../components/CustomTabBar';
import TabContentRenderer from '../components/TabContentRenderer';
import { useTab } from '../context/TabContext';
import { DEFAULT_TABS } from './TabConfig';
import AddAlarmScreen from '../screens/AddAlarmScreen';
import AddTimerScreen from '../screens/AddTimerScreen';
import TabManagerScreen from '../screens/TabManagerScreen';
import HomeScreen from '../screens/HomeScreen';
import TimerScreen from '../screens/TimerScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import WorldClockScreen from '../screens/WorldClockScreen';
import IntervalSignalScreen from '../screens/IntervalSignalScreen';
import SportsTimerScreen from '../screens/SportsTimerScreen';
import AddIntervalTemplateScreen from '../screens/AddIntervalTemplateScreen';
import IntervalHistoryScreen from '../screens/IntervalHistoryScreen';
import AlarmHistoryScreen from '../screens/AlarmHistoryScreen';
import BackupRestoreScreen from '../screens/BackupRestoreScreen';
import AlarmStatsScreen from '../screens/AlarmStatsScreen';
import TimerTemplatesScreen from '../screens/TimerTemplatesScreen';
import TimerHistoryScreen from '../screens/TimerHistoryScreen';
import TimerCategoriesScreen from '../screens/TimerCategoriesScreen';
import IntervalStatsScreen from '../screens/IntervalStatsScreen';
import IntervalBackupScreen from '../screens/IntervalBackupScreen';

const Stack = createStackNavigator();

const MainTabScreen = ({ navigation }: any) => {
  const { tabs, activeTab, setActiveTab, isLoading } = useTab();
  const insets = useSafeAreaInsets();

  // 탭바 높이 계산 (고정값)
  const TAB_BAR_HEIGHT = 80;

  // useMemo로 탭 배열 안정화
  const updatedTabs = useMemo(() => {
    if (!tabs || tabs.length === 0) {
      return DEFAULT_TABS;
    }

    return tabs.map(tab => {
      if (!tab.component) {
        if (tab.id === 'Alarm') {
          return { ...tab, component: HomeScreen };
        } else if (tab.id === 'Timer') {
          return { ...tab, component: TimerScreen };
        } else if (tab.id === 'Stopwatch') {
          return { ...tab, component: StopwatchScreen };
        } else if (tab.id === 'WorldClock') {
          return { ...tab, component: WorldClockScreen };
        } else if (tab.id === 'IntervalSignal') {
          return { ...tab, component: IntervalSignalScreen };
        } else if (tab.id === 'SportsTimer') {
          return { ...tab, component: SportsTimerScreen };
        }
      }
      return tab;
    });
  }, [tabs, isLoading]);

  const handleSettingsPress = () => {
    navigation.navigate('TabManager');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 콘텐츠 영역 - 탭바 높이만큼만 하단 패딩 */}
      <View style={[styles.contentContainer, { paddingBottom: TAB_BAR_HEIGHT }]}>
        <TabContentRenderer 
          tabs={updatedTabs} 
          activeTab={activeTab} 
          navigation={navigation}
        />
      </View>
      
      {/* 탭바 영역 - 하단 SafeArea 적용 */}
      <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
        <CustomTabBar
          tabs={updatedTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSettingsPress={handleSettingsPress}
          scrollable={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTab" component={MainTabScreen} />
      <Stack.Screen name="AddAlarm" component={AddAlarmScreen} />
      <Stack.Screen name="AddTimer" component={AddTimerScreen} />
      <Stack.Screen name="TabManager" component={TabManagerScreen} />
      <Stack.Screen name="AddIntervalTemplate" component={AddIntervalTemplateScreen} />
      <Stack.Screen name="AlarmHistory" component={AlarmHistoryScreen} />
      <Stack.Screen name="BackupRestore" component={BackupRestoreScreen} />
      <Stack.Screen name="AlarmStats" component={AlarmStatsScreen} />
      <Stack.Screen name="TimerTemplates" component={TimerTemplatesScreen} />
      <Stack.Screen name="TimerHistory" component={TimerHistoryScreen} />
      <Stack.Screen name="TimerCategories" component={TimerCategoriesScreen} />
      <Stack.Screen name="IntervalStats" component={IntervalStatsScreen} />
      <Stack.Screen name="IntervalBackup" component={IntervalBackupScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator; 