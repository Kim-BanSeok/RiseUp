import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

const MainTabScreen = ({ navigation }: any) => {
  const { tabs, activeTab, setActiveTab, isLoading } = useTab();

  // useMemo로 탭 배열 안정화
  const updatedTabs = useMemo(() => {
    console.log('🔄 MainTabScreen Debug:');
    console.log('  - isLoading:', isLoading);
    console.log('  - tabs length:', tabs?.length);
    console.log('  - activeTab:', activeTab);

    if (!tabs || tabs.length === 0) {
      console.log('⚠️ 탭이 비어있음, 기본 탭 사용');
      return DEFAULT_TABS;
    }

    // 각 탭의 컴포넌트가 유효한지 확인
    return tabs.map(tab => {
      console.log(`🔍 탭 ${tab.id} 컴포넌트 확인:`, tab.component);
      
      // 컴포넌트가 null이거나 undefined인 경우 기본 컴포넌트로 대체
      if (!tab.component) {
        console.log(`⚠️ 탭 ${tab.id}의 컴포넌트가 null입니다. 기본 컴포넌트로 대체`);
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
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <TabContentRenderer 
          tabs={updatedTabs} 
          activeTab={activeTab} 
        />
      </View>
      
      <CustomTabBar
        tabs={updatedTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsPress={handleSettingsPress}
        scrollable={true}
      />
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
    paddingBottom: 80,
  },
});

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabScreen} />
      <Stack.Screen name="AddAlarm" component={AddAlarmScreen} />
      <Stack.Screen name="AddTimer" component={AddTimerScreen} />
      <Stack.Screen name="TabManager" component={TabManagerScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator; 