import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import CustomTabBar from '../components/CustomTabBar';
import TabContentRenderer from '../components/TabContentRenderer';
import { useTab } from '../context/TabContext';
import { DEFAULT_TABS } from './TabConfig'; // 같은 폴더이므로 ./TabConfig
import AddAlarmScreen from '../screens/AddAlarmScreen';
import AddTimerScreen from '../screens/AddTimerScreen';
import TabManagerScreen from '../screens/TabManagerScreen';
import HomeScreen from '../screens/HomeScreen';
import TimerScreen from '../screens/TimerScreen';
import AddIntervalTemplateScreen from '../screens/AddIntervalTemplateScreen';
import IntervalHistoryScreen from '../screens/IntervalHistoryScreen';

// 스택 타입 정의 확장
export type MainStackParamList = {
  Main: undefined;
  AddAlarm: undefined;
  AddTimer: undefined;
  TabManager: undefined;
  AddIntervalTemplate: undefined; // 새 화면 추가
  IntervalHistory: undefined; // 새 화면 추가
  AlarmHome: undefined;
  TimerHome: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

// 개별 스택 네비게이터들
const AlarmStackNavigator = createStackNavigator();
const TimerStackNavigator = createStackNavigator();

const AlarmStack = () => (
  <AlarmStackNavigator.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2D1B14' },
      headerTintColor: '#FFD4B3',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <AlarmStackNavigator.Screen 
      name="AlarmHome" 
      component={HomeScreen}
      options={{ title: '알람' }}
    />
    <AlarmStackNavigator.Screen 
      name="AddAlarm" 
      component={AddAlarmScreen}
      options={{ title: '알람 추가' }}
    />
  </AlarmStackNavigator.Navigator>
);

const TimerStack = () => (
  <TimerStackNavigator.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#2D1B14' },
      headerTintColor: '#FFD4B3', 
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <TimerStackNavigator.Screen 
      name="TimerHome" 
      component={TimerScreen}
      options={{ title: '타이머' }}
    />
    <TimerStackNavigator.Screen 
      name="AddTimer" 
      component={AddTimerScreen}
      options={{ title: '타이머 추가' }}
    />
  </TimerStackNavigator.Navigator>
);

const MainTabScreen = ({ navigation }: any) => {
  const { tabs, activeTab, setActiveTab } = useTab();

  // 탭 설정에 따라 컴포넌트 결정
  const getTabComponent = (tab: any) => {
    if (tab.id === 'Alarm') return AlarmStack;
    if (tab.id === 'Timer') return TimerStack;
    return tab.component;
  };

  const updatedTabs = tabs.map(tab => ({
    ...tab,
    component: getTabComponent(tab)
  }));

  return (
    <View style={styles.container}>
      {/* 더 명확하게 보이는 탭 관리 버튼 */}
      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => {
          console.log('탭 관리 버튼 클릭됨');
          navigation.navigate('TabManager');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.manageButtonText}>⚙️</Text>
        <Text style={styles.manageButtonLabel}>탭</Text>
      </TouchableOpacity>

      <TabContentRenderer 
        tabs={updatedTabs}
        activeTab={activeTab}
      />
      
      <CustomTabBar
        tabs={updatedTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scrollable={true}
      />
    </View>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            opacity: current.progress,
          },
        }),
      }}
    >
      <Stack.Screen name="Main" component={MainTabScreen} />
      <Stack.Screen 
        name="TabManager" 
        component={TabManagerScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#2D1B14' },
          headerTintColor: '#FFD4B3',
          headerTitle: '탭 관리',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="AddIntervalTemplate" 
        component={AddIntervalTemplateScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="IntervalHistory" 
        component={IntervalHistoryScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  manageButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: '#FF7F50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD4B3',
  },
  manageButtonText: {
    fontSize: 18,
    marginBottom: -2,
  },
  manageButtonLabel: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default MainNavigator; 