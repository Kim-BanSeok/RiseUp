import { useState } from 'react';
import { AlertButton, AlertConfig } from '../types/Alert';

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: AlertButton[]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) {
            button.onPress();
          }
        }
      }))
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  return {
    alertConfig,
    showCustomAlert,
    hideAlert
  };
}; 