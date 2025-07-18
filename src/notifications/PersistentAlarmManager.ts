import { Alert, Vibration, Platform, AppState } from 'react-native';
import { playSound, stopSound } from '../utils/sounds';
import GlobalAlert from '../utils/GlobalAlert';

interface ActiveAlarm {
  id: string;
  title: string;
  message: string;
  soundId: string;
  startTime: Date;
  intervalId?: NodeJS.Timeout;
  soundIntervalId?: NodeJS.Timeout;
}

class PersistentAlarmManager {
  private static instance: PersistentAlarmManager;
  private activeAlarms: Map<string, ActiveAlarm> = new Map();
  private isAppActive = true;

  static getInstance(): PersistentAlarmManager {
    if (!PersistentAlarmManager.instance) {
      PersistentAlarmManager.instance = new PersistentAlarmManager();
    }
    return PersistentAlarmManager.instance;
  }

  constructor() {
    // 앱 상태 변화 감지
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: string) => {
    this.isAppActive = nextAppState === 'active';
    
    // 앱이 활성화되면 알람 체크
    if (this.isAppActive && this.activeAlarms.size > 0) {
      console.log('앱 활성화 - 알람 상태 체크');
      this.activeAlarms.forEach((alarm) => {
        this.showAlarmUI(alarm);
      });
    }
  };

  // 지속적인 알람 시작
  triggerPersistentAlarm(
    id: string,
    title: string,
    message: string,
    soundId: string = 'default'
  ) {
    console.log('🔔 지속 알람 시작:', title);

    // 기존 알람이 있으면 정지
    this.stopAlarm(id);

    const alarm: ActiveAlarm = {
      id,
      title,
      message,
      soundId,
      startTime: new Date(),
    };

    // 사운드 반복 재생 (10초마다)
    const playSoundRepeated = () => {
      playSound(soundId);
      // 진동 (1초간)
      if (Platform.OS === 'android') {
        Vibration.vibrate(1000);
      } else {
        Vibration.vibrate();
      }
    };

    // 즉시 사운드 재생
    playSoundRepeated();

    // 사운드와 진동을 주기적으로 반복
    alarm.soundIntervalId = setInterval(() => {
      playSoundRepeated();
    }, 10000); // 10초마다 반복

    // UI 알림을 주기적으로 표시 (30초마다)
    alarm.intervalId = setInterval(() => {
      this.showAlarmUI(alarm);
    }, 30000);

    // 즉시 UI 표시
    this.showAlarmUI(alarm);

    this.activeAlarms.set(id, alarm);
  }

  // 알람 UI 표시
  private showAlarmUI(alarm: ActiveAlarm) {
    if (!this.isAppActive) {
      console.log('앱이 백그라운드 상태이므로 UI 표시 생략');
      return;
    }

    const runningTime = Math.floor(
      (new Date().getTime() - alarm.startTime.getTime()) / 1000 / 60
    );
    
    const globalAlert = GlobalAlert.getInstance();
    globalAlert.alert(
      `🌅 ${alarm.title}`,
      `${alarm.message}\n\n울린 시간: ${runningTime}분`,
      [
        {
          text: '5분 후 다시 알림',
          style: 'default',
          onPress: () => this.snoozeAlarm(alarm.id, 5),
        },
        {
          text: '알람 끄기',
          style: 'destructive',
          onPress: () => this.stopAlarm(alarm.id),
        },
      ]
    );
  }

  // 알람 정지
  stopAlarm(id: string) {
    const alarm = this.activeAlarms.get(id);
    if (!alarm) return;

    console.log('✅ 알람 정지:', alarm.title);

    // 사운드 정지
    stopSound();

    // 진동 정지
    Vibration.cancel();

    // 타이머 정리
    if (alarm.intervalId) {
      clearInterval(alarm.intervalId);
    }
    if (alarm.soundIntervalId) {
      clearInterval(alarm.soundIntervalId);
    }

    this.activeAlarms.delete(id);
  }

  // 스누즈 (다시 알림)
  private snoozeAlarm(id: string, minutes: number) {
    console.log(`😴 ${minutes}분 후 다시 알림 설정`);
    
    // 현재 알람 정지
    this.stopAlarm(id);

    // 지정된 시간 후 다시 알람
    setTimeout(() => {
      const alarm = this.activeAlarms.get(id);
      if (!alarm) {
        // 스누즈 알람 생성
        this.triggerPersistentAlarm(
          `${id}_snooze_${Date.now()}`,
          '스누즈 알람',
          `${minutes}분 전에 설정한 알람입니다.`,
          'default'
        );
      }
    }, minutes * 60 * 1000);
  }

  // 모든 알람 정지
  stopAllAlarms() {
    console.log('🔕 모든 알람 정지');
    
    this.activeAlarms.forEach((_, id) => {
      this.stopAlarm(id);
    });
  }

  // 활성 알람 개수
  getActiveAlarmCount(): number {
    return this.activeAlarms.size;
  }

  // 활성 알람 목록
  getActiveAlarms(): ActiveAlarm[] {
    return Array.from(this.activeAlarms.values());
  }
}

export default PersistentAlarmManager;
export { ActiveAlarm }; 