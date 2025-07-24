import { TabConfig } from '../components/CustomTabBar';
import HomeScreen from '../screens/alarm/HomeScreen';
import StopwatchScreen from '../screens/stopwatch/StopwatchScreen';
import TimerScreen from '../screens/timer/TimerScreen';
import WorldClockScreen from '../screens/worldclock/WorldClockScreen';
import IntervalSignalScreen from '../screens/interval/IntervalSignalScreen';
import SportsTimerScreen from '../screens/sports/SportsTimerScreen';

export const DEFAULT_TABS: TabConfig[] = [
  {
    id: 'Alarm',
    title: '알람',
    icon: '⏰',
    component: HomeScreen,
    isStack: true,
  },
  {
    id: 'Stopwatch',
    title: '스톱워치',
    icon: '⏱️',
    component: StopwatchScreen,
  },
  {
    id: 'Timer',
    title: '타이머',
    icon: '⏲️',
    component: TimerScreen,
    isStack: true,
    badge: 2, // 테스트용 배지
  },
  {
    id: 'WorldClock',
    title: '세계시계',
    icon: '🌍',
    component: WorldClockScreen,
  },
  {
    id: 'IntervalSignal',
    title: '인터벌',
    icon: '⏳',
    component: IntervalSignalScreen, // 새로운 화면 연결
    badge: 1, // 새 기능 표시
  },
  {
    id: 'SportsTimer',
    title: '스포츠',
    icon: '🏆',
    component: SportsTimerScreen,
  },
];

// 동적으로 탭 추가하는 함수
export const addCustomTab = (tab: TabConfig): TabConfig[] => {
  return [...DEFAULT_TABS, tab];
};

// 탭 순서 변경 함수
export const reorderTabs = (tabs: TabConfig[], fromIndex: number, toIndex: number): TabConfig[] => {
  const newTabs = [...tabs];
  const [movedTab] = newTabs.splice(fromIndex, 1);
  newTabs.splice(toIndex, 0, movedTab);
  return newTabs;
};