// RiseUp/src/utils/GlobalAlert.ts
import { Alert } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  cancelable?: boolean;
}

class GlobalAlert {
  private static instance: GlobalAlert;
  private alertHandler: ((title: string, message: string, buttons: AlertButton[], options?: AlertOptions) => void) | null = null;

  static getInstance(): GlobalAlert {
    if (!GlobalAlert.instance) {
      GlobalAlert.instance = new GlobalAlert();
    }
    return GlobalAlert.instance;
  }

  // CustomAlert 핸들러 등록
  setAlertHandler(handler: (title: string, message: string, buttons: AlertButton[], options?: AlertOptions) => void) {
    this.alertHandler = handler;
  }

  // CustomAlert 핸들러 제거
  removeAlertHandler() {
    this.alertHandler = null;
  }

  // Alert 표시 (CustomAlert가 있으면 사용, 없으면 기본 Alert 사용)
  alert(
    title: string,
    message: string,
    buttons: AlertButton[] = [{ text: '확인', style: 'default' }],
    options?: AlertOptions
  ) {
    if (this.alertHandler) {
      // CustomAlert 사용
      this.alertHandler(title, message, buttons, options);
    } else {
      // 기본 Alert 사용 (fallback)
      Alert.alert(title, message, buttons, options);
    }
  }
}

export default GlobalAlert;