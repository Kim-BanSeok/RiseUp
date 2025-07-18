import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScheduledNotification {
  id: string;
  time: Date;
  title: string;
  message: string;
  repeatDays?: number[];
}

class NotificationManager {
  private static instance: NotificationManager;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // 알림 권한 요청
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // Android 13+ 에서 알림 권한 체크
      return new Promise((resolve) => {
        Alert.alert(
          '알림 권한',
          'RiseUp에서 알람을 울리려면 알림 권한이 필요합니다.',
          [
            { text: '취소', onPress: () => resolve(false) },
            { text: '확인', onPress: () => resolve(true) },
          ]
        );
      });
    }
    return true;
  }

  // 알람 스케줄링
  async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    console.log('📅 알람 예약:', {
      id: notification.id,
      time: notification.time.toLocaleString(),
      title: notification.title,
      message: notification.message,
      repeatDays: notification.repeatDays,
    });

    this.scheduledNotifications.set(notification.id, notification);
    await this.saveScheduledNotifications();

    // 실제 알림은 백그라운드 작업으로 처리
    this.setupBackgroundCheck(notification);
  }

  // 알람 취소
  async cancelNotification(id: string): Promise<void> {
    console.log('❌ 알람 취소:', id);
    this.scheduledNotifications.delete(id);
    await this.saveScheduledNotifications();
  }

  // 모든 알람 취소
  async cancelAllNotifications(): Promise<void> {
    console.log('🗑️ 모든 알람 취소');
    this.scheduledNotifications.clear();
    await this.saveScheduledNotifications();
  }

  // 백그라운드 체크 설정
  private setupBackgroundCheck(notification: ScheduledNotification) {
    const now = new Date();
    const targetTime = new Date(notification.time);
    
    // 오늘 해당 시간이 지났으면 내일로 설정
    if (targetTime.getTime() <= now.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilAlarm = targetTime.getTime() - now.getTime();
    
    console.log(`⏰ ${notification.title} 알람이 ${Math.round(timeUntilAlarm / 1000 / 60)}분 후에 울립니다.`);

    // 실제 환경에서는 네이티브 알람매니저 사용 필요
    // 현재는 개발용 타이머로 구현
    if (timeUntilAlarm > 0 && timeUntilAlarm < 24 * 60 * 60 * 1000) { // 24시간 이내
      setTimeout(() => {
        this.triggerNotification(notification);
      }, timeUntilAlarm);
    }
  }

  // 알림 발생
  private triggerNotification(notification: ScheduledNotification) {
    console.log('🔔 알람 울림!', notification.title);
    
    Alert.alert(
      `🌅 ${notification.title}`,
      notification.message,
      [
        {
          text: '다시 알림 (5분)',
          onPress: () => this.snoozeNotification(notification.id, 5),
        },
        {
          text: '알람 끄기',
          onPress: () => this.dismissNotification(notification.id),
        },
      ],
      { cancelable: false }
    );

    // 진동 효과 (실제 구현 시 Vibration API 사용)
    console.log('📳 진동 효과');
  }

  // 다시 알림 (스누즈)
  private async snoozeNotification(id: string, minutes: number) {
    const notification = this.scheduledNotifications.get(id);
    if (notification) {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
      
      const snoozeNotification = {
        ...notification,
        id: `${id}_snooze_${Date.now()}`,
        time: snoozeTime,
      };

      await this.scheduleNotification(snoozeNotification);
      console.log(`😴 ${minutes}분 후 다시 알림 설정`);
    }
  }

  // 알림 끄기
  private dismissNotification(id: string) {
    console.log('✅ 알람 해제:', id);
    // 반복 알람이면 다음 일정으로 재설정
    const notification = this.scheduledNotifications.get(id);
    if (notification && notification.repeatDays && notification.repeatDays.length > 0) {
      this.scheduleNextRepeat(notification);
    }
  }

  // 다음 반복 알람 설정
  private async scheduleNextRepeat(notification: ScheduledNotification) {
    if (!notification.repeatDays || notification.repeatDays.length === 0) return;

    const now = new Date();
    const currentDay = now.getDay();
    
    // 다음 울릴 요일 찾기
    let nextDay = notification.repeatDays.find(day => day > currentDay);
    if (!nextDay) {
      nextDay = notification.repeatDays[0]; // 다음 주 첫 번째 요일
    }

    const nextTime = new Date(notification.time);
    const dayDiff = nextDay <= currentDay ? 7 - currentDay + nextDay : nextDay - currentDay;
    nextTime.setDate(now.getDate() + dayDiff);

    const nextNotification = {
      ...notification,
      time: nextTime,
    };

    await this.scheduleNotification(nextNotification);
  }

  // 예약된 알림 저장
  private async saveScheduledNotifications() {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      const jsonData = JSON.stringify(notifications.map(n => ({
        ...n,
        time: n.time.toISOString(),
      })));
      await AsyncStorage.setItem('@RiseUp:scheduled_notifications', jsonData);
    } catch (error) {
      console.error('알림 저장 실패:', error);
    }
  }

  // 예약된 알림 로드
  async loadScheduledNotifications() {
    try {
      const jsonData = await AsyncStorage.getItem('@RiseUp:scheduled_notifications');
      if (jsonData) {
        const notifications = JSON.parse(jsonData);
        notifications.forEach((n: any) => {
          this.scheduledNotifications.set(n.id, {
            ...n,
            time: new Date(n.time),
          });
        });
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
    }
  }

  // 활성 알림 목록 가져오기
  getActiveNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }
}

export default NotificationManager;
export { ScheduledNotification };
