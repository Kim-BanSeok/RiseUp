import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerState {
  isRunning: boolean;
  startTime: number;
  remainingTime: number;
  currentPhaseIndex: number;
  sessionId: string;
}

class BackgroundTimerManager {
  private static instance: BackgroundTimerManager;
  private appState: AppStateStatus = 'active';
  private backgroundTime: number = 0;
  private listeners: Array<(state: TimerState | null) => void> = [];

  static getInstance(): BackgroundTimerManager {
    if (!BackgroundTimerManager.instance) {
      BackgroundTimerManager.instance = new BackgroundTimerManager();
    }
    return BackgroundTimerManager.instance;
  }

  constructor() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const currentTime = Date.now();

    if (this.appState === 'background' && nextAppState === 'active') {
      // 백그라운드에서 포그라운드로 복귀
      console.log('앱이 포그라운드로 복귀');
      await this.syncTimerState();
    } else if (this.appState === 'active' && nextAppState === 'background') {
      // 포그라운드에서 백그라운드로 전환
      console.log('앱이 백그라운드로 전환');
      this.backgroundTime = currentTime;
      await this.saveCurrentState();
    }

    this.appState = nextAppState;
  };

  // 현재 타이머 상태 저장
  async saveTimerState(state: TimerState) {
    try {
      await AsyncStorage.setItem('@RiseUp:timerState', JSON.stringify({
        ...state,
        savedAt: Date.now()
      }));
      console.log('타이머 상태 저장됨:', state);
    } catch (error) {
      console.error('타이머 상태 저장 실패:', error);
    }
  }

  // 저장된 타이머 상태 로드
  async loadTimerState(): Promise<TimerState | null> {
    try {
      const saved = await AsyncStorage.getItem('@RiseUp:timerState');
      if (!saved) return null;

      const state = JSON.parse(saved);
      console.log('저장된 타이머 상태 로드됨:', state);
      return state;
    } catch (error) {
      console.error('타이머 상태 로드 실패:', error);
      return null;
    }
  }

  // 백그라운드에서 복귀 시 타이머 동기화
  private async syncTimerState() {
    const savedState = await this.loadTimerState();
    if (!savedState || !savedState.isRunning) return;

    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - savedState.savedAt) / 1000);
    
    console.log(`백그라운드에서 ${elapsedTime}초 경과`);

    // 경과 시간만큼 타이머 상태 업데이트
    const updatedState = this.calculateNewTimerState(savedState, elapsedTime);
    
    // 리스너들에게 업데이트된 상태 전달
    this.notifyListeners(updatedState);
  }

  private calculateNewTimerState(state: TimerState, elapsedSeconds: number): TimerState {
    let remainingTime = state.remainingTime - elapsedSeconds;
    let currentPhaseIndex = state.currentPhaseIndex;
    
    // 시간이 지나서 다음 페이즈로 넘어가야 하는 경우 처리
    while (remainingTime <= 0 && currentPhaseIndex < 999) { // 임시로 큰 수 사용
      // 다음 페이즈로 이동하는 로직은 IntervalContext에서 처리
      break;
    }

    return {
      ...state,
      remainingTime: Math.max(0, remainingTime),
      currentPhaseIndex
    };
  }

  // 현재 상태 저장 (백그라운드 진입 시)
  private async saveCurrentState() {
    // 현재 실행 중인 타이머가 있다면 저장
    // 이 부분은 IntervalContext와 연동
  }

  // 리스너 등록
  addListener(callback: (state: TimerState | null) => void) {
    this.listeners.push(callback);
  }

  // 리스너 제거
  removeListener(callback: (state: TimerState | null) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // 리스너들에게 상태 변경 알림
  private notifyListeners(state: TimerState | null) {
    this.listeners.forEach(listener => listener(state));
  }

  // 타이머 상태 초기화
  async clearTimerState() {
    try {
      await AsyncStorage.removeItem('@RiseUp:timerState');
      console.log('타이머 상태 초기화됨');
    } catch (error) {
      console.error('타이머 상태 초기화 실패:', error);
    }
  }
}

export default BackgroundTimerManager; 