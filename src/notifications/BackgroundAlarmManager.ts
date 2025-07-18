import { NativeModules, Platform } from 'react-native';
import { PermissionManager } from '../utils/permissions';

const { AlarmModule } = NativeModules;

export class BackgroundAlarmManager {
  private static instance: BackgroundAlarmManager;

  static getInstance(): BackgroundAlarmManager {
    if (!BackgroundAlarmManager.instance) {
      BackgroundAlarmManager.instance = new BackgroundAlarmManager();
    }
    return BackgroundAlarmManager.instance;
  }

  // 백그라운드 알람 설정
  async scheduleBackgroundAlarm(
    id: string,
    time: Date,
    title: string,
    message: string
  ): Promise<boolean> {
    try {
      // 권한 확인 (중복 요청 방지)
      const hasPermission = await PermissionManager.requestNotificationPermission();
      if (!hasPermission) {
        console.log('알림 권한이 없어 알람을 설정할 수 없습니다.');
        return false;
      }

      if (Platform.OS === 'android' && AlarmModule) {
        const timeInMillis = time.getTime();
        const result = await AlarmModule.setAlarm(id, timeInMillis, title, message);
        console.log('백그라운드 알람 설정 성공:', result);
        return true;
      } else {
        console.log('iOS 또는 네이티브 모듈 없음');
        return false;
      }
    } catch (error) {
      console.error('백그라운드 알람 설정 실패:', error);
      return false;
    }
  }

  // 백그라운드 알람 취소
  async cancelBackgroundAlarm(id: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && AlarmModule) {
        const result = await AlarmModule.cancelAlarm(id);
        console.log('백그라운드 알람 취소 성공:', result);
        return true;
      }
      return false;
    } catch (error) {
      console.error('백그라운드 알람 취소 실패:', error);
      return false;
    }
  }

  // 반복 알람 설정
  async scheduleRepeatingAlarm(
    id: string,
    time: Date,
    title: string,
    message: string,
    repeatDays: number[]
  ): Promise<boolean> {
    try {
      const results: boolean[] = [];

      for (let i = 0; i < repeatDays.length; i++) {
        const day = repeatDays[i];
        const now = new Date();
        const alarmTime = new Date(time);
        
        // 다음 해당 요일까지의 일수 계산
        const currentDay = now.getDay();
        let daysUntilAlarm = (day - currentDay + 7) % 7;
        
        // 오늘이면서 시간이 지났다면 다음 주로
        if (daysUntilAlarm === 0) {
          const todayAlarmTime = new Date(now);
          todayAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
          if (todayAlarmTime.getTime() <= now.getTime()) {
            daysUntilAlarm = 7;
          }
        }

        const nextAlarmTime = new Date(now);
        nextAlarmTime.setDate(now.getDate() + daysUntilAlarm);
        nextAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);

        const dayId = `${id}_day_${day}`;
        const success = await this.scheduleBackgroundAlarm(
          dayId,
          nextAlarmTime,
          title,
          message
        );
        results.push(success);

        console.log(`요일 ${day} 알람 설정:`, {
          id: dayId,
          time: nextAlarmTime.toLocaleString(),
          success
        });
      }

      return results.every(result => result);
    } catch (error) {
      console.error('반복 알람 설정 실패:', error);
      return false;
    }
  }

  // 반복 알람 취소
  async cancelRepeatingAlarm(id: string, repeatDays: number[]): Promise<boolean> {
    try {
      const results: boolean[] = [];

      for (const day of repeatDays) {
        const dayId = `${id}_day_${day}`;
        const success = await this.cancelBackgroundAlarm(dayId);
        results.push(success);
      }

      return results.every(result => result);
    } catch (error) {
      console.error('반복 알람 취소 실패:', error);
      return false;
    }
  }
} 