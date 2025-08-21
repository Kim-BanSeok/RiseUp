# 📚 RiseUp API 참조 문서

## 🔄 Context API

### AlarmContext

알람 관련 상태 및 함수들을 제공하는 Context입니다.

#### 상태 (State)

```typescript
interface AlarmContextType {
  alarms: Alarm[];
  alarmGroups: AlarmGroup[];
  alarmHistory: AlarmHistory[];
  isLoading: boolean;
}
```

#### 함수 (Functions)

```typescript
// 알람 추가
addAlarm(
  time: Date, 
  label?: string, 
  repeatDays?: number[], 
  soundId?: string, 
  groupId?: string
): Promise<boolean>

// 알람 삭제
deleteAlarm(alarmId: string): void

// 알람 활성화/비활성화
toggleAlarm(alarmId: string): void

// 알람 그룹 추가
addAlarmGroup(
  name: string, 
  description?: string, 
  color?: string, 
  icon?: string
): string

// 알람 통계 조회
getAlarmStats(): AlarmStats
```

### TimerContext

타이머 관련 상태 및 함수들을 제공하는 Context입니다.

#### 상태 (State)

```typescript
interface TimerContextType {
  timers: Timer[];
  timerTemplates: TimerTemplate[];
  timerHistory: TimerHistory[];
  timerCategories: TimerCategory[];
  isLoading: boolean;
}
```

#### 함수 (Functions)

```typescript
// 타이머 추가
addTimer(timer: TimerInput): void

// 타이머 시작
startTimer(timerId: string): void

// 타이머 일시정지
pauseTimer(timerId: string): void

// 타이머 리셋
resetTimer(timerId: string): void

// 타이머 삭제
deleteTimer(timerId: string): void
```

### TabContext

탭 네비게이션 상태를 관리하는 Context입니다.

#### 상태 (State)

```typescript
interface TabContextType {
  tabs: TabConfig[];
  activeTab: string;
  isLoading: boolean;
}
```

#### 함수 (Functions)

```typescript
// 탭 추가
addTab(tab: TabConfig): void

// 탭 제거
removeTab(tabId: string): void

// 탭 순서 변경
reorderTabs(fromIndex: number, toIndex: number): void

// 기본 탭으로 리셋
resetToDefault(): void
```

## 🪝 Custom Hooks

### useAlarm

```typescript
const useAlarm = () => {
  // AlarmContext의 모든 값과 함수 반환
  return {
    alarms,
    alarmGroups,
    alarmHistory,
    addAlarm,
    deleteAlarm,
    toggleAlarm,
    // ... 기타 함수들
  };
};
```

### useTimer

```typescript
const useTimer = () => {
  // TimerContext의 모든 값과 함수 반환
  return {
    timers,
    timerTemplates,
    timerHistory,
    timerCategories,
    addTimer,
    startTimer,
    pauseTimer,
    // ... 기타 함수들
  };
};
```

### useTab

```typescript
const useTab = () => {
  // TabContext의 모든 값과 함수 반환
  return {
    tabs,
    activeTab,
    setActiveTab,
    addTab,
    removeTab,
    reorderTabs,
    // ... 기타 함수들
  };
};
```

### useGameState

게임 상태 관리를 위한 범용 훅입니다.

```typescript
const useGameState = <T extends BaseGameState>({
  initialState,
  onGameEnd
}: UseGameStateProps<T>): UseGameStateReturn<T>
```

#### 반환값

```typescript
interface UseGameStateReturn<T> {
  gameState: T;
  updateGameState: (updates: Partial<T>) => void;
  resetGame: (newState?: Partial<T>) => void;
  endGame: () => void;
  isGameActive: boolean;
}
```

## 🛠️ Utility Functions

### Storage Functions

#### 알람 관련

```typescript
// 알람 저장
saveAlarmsToStorage(alarms: Alarm[]): Promise<void>

// 알람 로드
loadAlarmsFromStorage(): Promise<Alarm[]>

// 알람 그룹 저장
saveAlarmGroupsToStorage(groups: AlarmGroup[]): Promise<void>

// 알람 그룹 로드
loadAlarmGroupsFromStorage(): Promise<AlarmGroup[]>
```

#### 타이머 관련

```typescript
// 타이머 저장
saveTimersToStorage(timers: Timer[]): Promise<void>

// 타이머 로드
loadTimersFromStorage(): Promise<Timer[]>

// 타이머 히스토리 저장
saveTimerHistoryToStorage(history: TimerHistory[]): Promise<void>

// 타이머 히스토리 로드
loadTimerHistoryFromStorage(): Promise<TimerHistory[]>
```

### Helper Functions

```typescript
// 고유 ID 생성
generateId(): string

// 시간 포맷팅
formatTime(timeMs: number): string

// 날짜 포맷팅
formatDate(date: Date): string

// 진동 알림
vibrate(pattern?: number | number[]): void
```

## 📱 Screen Components

### HomeScreen

알람 메인 화면 컴포넌트입니다.

#### Props

```typescript
interface HomeScreenProps {
  navigation: NavigationProp<any>;
}
```

#### 주요 기능

- 알람 목록 표시
- 필터링 및 그룹별 분류
- 알람 추가/편집/삭제
- 알람 활성화/비활성화

### StopwatchScreen

스톱워치 화면 컴포넌트입니다.

#### 주요 기능

- 시작/정지/리셋
- 랩 타임 기록
- 밀리초 단위 정확도
- 자동 스크롤

### MiniGamesScreen

미니게임 선택 및 실행 화면입니다.

#### 주요 기능

- 게임 목록 표시
- 게임 실행
- 점수 통계
- 게임별 필터링

## 🔧 Configuration

### 기본 설정값

```typescript
// 기본 알람 그룹
const DEFAULT_ALARM_GROUPS: AlarmGroup[] = [
  {
    id: 'default',
    name: '기본',
    description: '기본 알람 그룹',
    color: '#FF6B6B',
    icon: '📁'
  }
];

// 기본 타이머 템플릿
const DEFAULT_TIMER_TEMPLATES: TimerTemplate[] = [
  {
    id: 'pomodoro',
    name: '뽀모도로',
    duration: 25 * 60 * 1000, // 25분
    category: 'work'
  }
];

// 기본 탭 설정
const DEFAULT_TABS: TabConfig[] = [
  {
    id: 'Alarm',
    title: '알람',
    icon: '🔔',
    component: HomeScreen
  },
  {
    id: 'Timer',
    title: '타이머',
    icon: '⏱️',
    component: TimerScreen
  }
];
```

## 📝 사용 예시

### 알람 추가하기

```typescript
import { useAlarm } from '../context/AlarmContext';

const AddAlarmScreen = () => {
  const { addAlarm } = useAlarm();
  
  const handleAddAlarm = async () => {
    const success = await addAlarm(
      new Date('2024-01-15T08:00:00'),
      '아침 알람',
      [1, 2, 3, 4, 5], // 평일
      'default',
      'work'
    );
    
    if (success) {
      console.log('알람 추가 성공!');
    }
  };
  
  return (
    // UI 컴포넌트들
  );
};
```

### 타이머 시작하기

```typescript
import { useTimer } from '../context/TimerContext';

const TimerScreen = () => {
  const { timers, startTimer, pauseTimer } = useTimer();
  
  const handleStartTimer = (timerId: string) => {
    startTimer(timerId);
  };
  
  return (
    // 타이머 목록 및 컨트롤
  );
};
```

---

*이 문서는 RiseUp 앱의 API 사용법을 설명합니다. 더 자세한 내용은 [완전 개발문서](../RiseUp-Complete-Documentation.md)를 참조하세요.*
