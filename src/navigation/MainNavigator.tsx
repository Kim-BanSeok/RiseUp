import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabBar from '../components/CustomTabBar';
import TabContentRenderer from '../components/TabContentRenderer';
import { useTab } from '../context/TabContext';
import { DEFAULT_TABS } from './TabConfig';
import AddAlarmScreen from '../screens/alarm/AddAlarmScreen';
import AddTimerScreen from '../screens/timer/AddTimerScreen';
import TabManagerScreen from '../screens/common/TabManagerScreen';
import HomeScreen from '../screens/alarm/HomeScreen';
import TimerScreen from '../screens/timer/TimerScreen';
import StopwatchScreen from '../screens/stopwatch/StopwatchScreen';
import WorldClockScreen from '../screens/worldclock/WorldClockScreen';
import IntervalSignalScreen from '../screens/interval/IntervalSignalScreen';
import SportsTimerScreen from '../screens/sports/SportsTimerScreen';
import AddIntervalTemplateScreen from '../screens/interval/AddIntervalTemplateScreen';
import IntervalHistoryScreen from '../screens/interval/IntervalHistoryScreen';
import AlarmHistoryScreen from '../screens/alarm/AlarmHistoryScreen';
import BackupRestoreScreen from '../screens/alarm/BackupRestoreScreen';
import AlarmStatsScreen from '../screens/alarm/AlarmStatsScreen';
import TimerTemplatesScreen from '../screens/timer/TimerTemplatesScreen';
import TimerHistoryScreen from '../screens/timer/TimerHistoryScreen';
import TimerCategoriesScreen from '../screens/timer/TimerCategoriesScreen';
import IntervalStatsScreen from '../screens/interval/IntervalStatsScreen';
import IntervalBackupScreen from '../screens/interval/IntervalBackupScreen';
import AddCustomSportScreen from '../screens/sports/AddCustomSportScreen';

const Stack = createStackNavigator();

const MainTabScreen = ({ navigation }: any) => {
  const { tabs, activeTab, setActiveTab, isLoading } = useTab();
  const insets = useSafeAreaInsets();

  // 실제 탭바 높이 정확히 계산
  const TAB_BAR_HEIGHT = 80 + (Platform.OS === 'ios' ? 20 : 10);

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
      {/* 콘텐츠 영역 - 실제 탭바 높이만큼 하단 패딩 */}
      <View style={[styles.contentContainer, { paddingBottom: TAB_BAR_HEIGHT }]}>
        <TabContentRenderer 
          tabs={updatedTabs} 
          activeTab={activeTab} 
          navigation={navigation}
        />
      </View>
      
      {/* 탭바 영역 */}
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
    zIndex: 10000, // 탭바를 최상위로
    elevation: 10000, // Android용
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
      <Stack.Screen name="AddCustomSport" component={AddCustomSportScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator; 