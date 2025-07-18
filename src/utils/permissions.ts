import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_KEY = '@RiseUp:notification_permission';

export class PermissionManager {
  private static hasAsked = false;
  private static isGranted = false;

  // 권한 상태 확인 (중복 요청 방지)
  static async checkPermissionStatus(): Promise<boolean> {
    if (this.hasAsked) {
      return this.isGranted;
    }

    try {
      // 이전에 권한을 확인했는지 체크
      const savedStatus = await AsyncStorage.getItem(PERMISSION_KEY);
      if (savedStatus !== null) {
        this.hasAsked = true;
        this.isGranted = savedStatus === 'granted';
        return this.isGranted;
      }
      return false;
    } catch (error) {
      console.error('권한 상태 확인 실패:', error);
      return false;
    }
  }

  // 한번만 권한 요청
  static async requestNotificationPermission(): Promise<boolean> {
    // 이미 확인했으면 저장된 결과 반환
    const hasPermission = await this.checkPermissionStatus();
    if (this.hasAsked) {
      return hasPermission;
    }

    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'RiseUp 알림 권한',
              message: '알람이 정시에 울리려면 알림 권한이 필요합니다.',
              buttonPositive: '허용',
              buttonNegative: '거부',
            }
          );
          
          this.isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          this.isGranted = true; // Android 12 이하는 자동 허용
        }
      } catch (error) {
        console.error('Android 권한 요청 실패:', error);
        this.isGranted = false;
      }
    } else {
      this.isGranted = true; // iOS는 별도 처리
    }

    // 권한 상태 저장
    this.hasAsked = true;
    await AsyncStorage.setItem(
      PERMISSION_KEY, 
      this.isGranted ? 'granted' : 'denied'
    );

    console.log('알림 권한 결과:', this.isGranted);
    return this.isGranted;
  }

  // 권한 재설정 (설정에서 호출)
  static async resetPermissionStatus(): Promise<void> {
    await AsyncStorage.removeItem(PERMISSION_KEY);
    this.hasAsked = false;
    this.isGranted = false;
  }
}