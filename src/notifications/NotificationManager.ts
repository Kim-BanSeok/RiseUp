import notifee, { 
  AndroidImportance, 
  AndroidVisibility,
  TriggerType,
  RepeatFrequency,
  AndroidStyle,
  AndroidCategory
} from '@notifee/react-native';
import { Platform } from 'react-native';

export default class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 권한 요청
      await this.requestPermissions();
      
      // 알림 채널 생성
      await this.createNotificationChannels();
      
      this.isInitialized = true;
      console.log('NotificationManager 초기화 완료');
    } catch (error) {
      console.error('NotificationManager 초기화 실패:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      
      if (settings.authorizationStatus >= 1) {
        console.log('알림 권한 허용됨');
        return true;
      } else {
        console.log('알림 권한 거부됨');
        return false;
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  private async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // 알람 채널
      await notifee.createChannel({
        id: 'alarm_channel',
        name: '알람',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        visibility: AndroidVisibility.PUBLIC,
      });

      // 인터벌 타이머 채널
      await notifee.createChannel({
        id: 'interval_timer',
        name: '인터벌 타이머',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        visibility: AndroidVisibility.PUBLIC,
      });

      // 백그라운드 타이머 채널
      await notifee.createChannel({
        id: 'background_timer',
        name: '백그라운드 타이머',
        importance: AndroidImportance.LOW,
        sound: 'none',
        vibration: false,
        visibility: AndroidVisibility.PUBLIC,
      });

      console.log('알림 채널 생성 완료');
    } catch (error) {
      console.error('알림 채널 생성 실패:', error);
    }
  }

  // 즉시 알림 표시
  async showNotification(
    id: string, 
    title: string, 
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await this.initialize();

      await notifee.displayNotification({
        id,
        title,
        body,
        data,
        android: {
          channelId: 'alarm_channel',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: body,
          },
        },
      });

      console.log('알림 표시됨:', title);
    } catch (error) {
      console.error('알림 표시 실패:', error);
    }
  }

  // 예약 알림
  async scheduleNotification(
    id: string,
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ): Promise<void> {
    try {
      await this.initialize();

      await notifee.createTriggerNotification(
        {
          id,
          title,
          body,
          data,
          android: {
            channelId: 'alarm_channel',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            style: {
              type: AndroidStyle.BIGTEXT,
              text: body,
            },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.getTime(),
        }
      );

      console.log('예약 알림 설정됨:', title, triggerDate);
    } catch (error) {
      console.error('예약 알림 설정 실패:', error);
    }
  }

  // 인터벌 페이즈 완료 알림
  async showIntervalPhaseNotification(
    phaseName: string,
    remainingPhases: number,
    totalPhases: number
  ): Promise<void> {
    try {
      await this.initialize();

      await notifee.displayNotification({
        id: 'interval_phase',
        title: '인터벌 타이머',
        body: `${phaseName} 완료! (${totalPhases - remainingPhases}/${totalPhases})`,
        data: {
          type: 'interval_phase',
          phaseName,
          remainingPhases: remainingPhases.toString(),
          totalPhases: totalPhases.toString(),
        },
        android: {
          channelId: 'interval_timer',
          importance: AndroidImportance.HIGH,
          category: AndroidCategory.ALARM,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: '앱 열기',
              pressAction: {
                id: 'open_app',
                launchActivity: 'default',
              },
            },
          ],
        },
      });

      console.log('인터벌 페이즈 알림 표시됨:', phaseName);
    } catch (error) {
      console.error('인터벌 페이즈 알림 실패:', error);
    }
  }

  // 백그라운드 타이머 진행 알림 (Ongoing notification)
  async showBackgroundTimerNotification(
    phaseName: string,
    remainingTime: string,
    isRunning: boolean
  ): Promise<void> {
    try {
      await this.initialize();

      await notifee.displayNotification({
        id: 'background_timer',
        title: `인터벌 진행 중 - ${phaseName}`,
        body: `남은 시간: ${remainingTime}`,
        data: {
          type: 'background_timer',
          phaseName,
          remainingTime,
          isRunning: isRunning.toString(),
        },
        android: {
          channelId: 'background_timer',
          importance: AndroidImportance.LOW,
          ongoing: true,
          autoCancel: false,
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          actions: [
            {
              title: isRunning ? '일시정지' : '재개',
              pressAction: {
                id: isRunning ? 'pause_timer' : 'resume_timer',
                launchActivity: 'default',
              },
            },
            {
              title: '중지',
              pressAction: {
                id: 'stop_timer',
                launchActivity: 'default',
              },
            },
          ],
          style: {
            type: AndroidStyle.BIGTEXT,
            text: `현재 ${phaseName} 진행 중입니다. 남은 시간: ${remainingTime}`,
          },
        },
      });

      console.log('백그라운드 타이머 알림 표시됨');
    } catch (error) {
      console.error('백그라운드 타이머 알림 실패:', error);
    }
  }

  // 백그라운드 타이머 알림 제거
  async hideBackgroundTimerNotification(): Promise<void> {
    try {
      await notifee.cancelNotification('background_timer');
      console.log('백그라운드 타이머 알림 제거됨');
    } catch (error) {
      console.error('백그라운드 타이머 알림 제거 실패:', error);
    }
  }

  // 모든 알림 취소
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('모든 알림 취소됨');
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  }

  // 특정 알림 취소
  async cancelNotification(id: string): Promise<void> {
    try {
      await notifee.cancelNotification(id);
      console.log('알림 취소됨:', id);
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  }
}
