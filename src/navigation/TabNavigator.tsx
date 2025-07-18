import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddAlarmScreen from '../screens/AddAlarmScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import TimerScreen from '../screens/TimerScreen';
import AddTimerScreen from '../screens/AddTimerScreen';
import WorldClockScreen from '../screens/WorldClockScreen';
import IntervalSignalScreen from '../screens/IntervalSignalScreen';
import SportsTimerScreen from '../screens/SportsTimerScreen';

// 알람 스택 타입 정의
export type AlarmStackParamList = {
  AlarmHome: undefined;
  AddAlarm: undefined;
};

// 타이머 스택 타입 정의
export type TimerStackParamList = {
  TimerHome: undefined;
  AddTimer: undefined;
};

// 메인 탭 타입 정의 (6개 탭으로 확장)
export type TabParamList = {
  Alarm: undefined;
  Stopwatch: undefined;
  Timer: undefined;
  WorldClock: undefined;
  IntervalSignal: undefined;
  SportsTimer: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const AlarmStack = createStackNavigator<AlarmStackParamList>();
const TimerStack = createStackNavigator<TimerStackParamList>();

// 알람 스택 네비게이터
const AlarmStackNavigator = () => {
  return (
    <AlarmStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2D1B14',
        },
        headerTintColor: '#FFD4B3',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AlarmStack.Screen 
        name="AlarmHome" 
        component={HomeScreen}
        options={{ title: '알람' }}
      />
      <AlarmStack.Screen 
        name="AddAlarm" 
        component={AddAlarmScreen}
        options={{ title: '알람 추가' }}
      />
    </AlarmStack.Navigator>
  );
};

// 타이머 스택 네비게이터
const TimerStackNavigator = () => {
  return (
    <TimerStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2D1B14',
        },
        headerTintColor: '#FFD4B3',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <TimerStack.Screen 
        name="TimerHome" 
        component={TimerScreen}
        options={{ title: '타이머' }}
      />
      <TimerStack.Screen 
        name="AddTimer" 
        component={AddTimerScreen}
        options={{ title: '타이머 추가' }}
      />
    </TimerStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#4A2C1A',
          borderTopColor: '#8B6341',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 85 : 95, // 높이 증가
          paddingBottom: Platform.OS === 'android' ? 20 : 30, // 패딩 증가
          paddingTop: 8, // 상단 패딩 줄임
          paddingHorizontal: 2, // 좌우 패딩 줄임
          position: 'absolute',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        tabBarActiveTintColor: '#FF7F50',
        tabBarInactiveTintColor: '#A67C61',
        tabBarLabelStyle: {
          fontSize: 9, // 폰트 크기 줄임 (6개 탭 대응)
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 2 : 0,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 1 : 0,
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Alarm"
        component={AlarmStackNavigator}
        options={{
          title: '알람',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>⏰</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Stopwatch"
        component={StopwatchScreen}
        options={{
          title: '스톱워치',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>⏱️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerStackNavigator}
        options={{
          title: '타이머',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>⏲️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="WorldClock"
        component={WorldClockScreen}
        options={{
          title: '세계시계',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>🌍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="IntervalSignal"
        component={IntervalSignalScreen}
        options={{
          title: '인터벌',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>⏳</Text>
          ),
        }}
      />
      <Tab.Screen
        name="SportsTimer"
        component={SportsTimerScreen}
        options={{
          title: '스포츠',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4, color }}>🏆</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 