import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlarmProvider } from './src/context/AlarmContext';
import SplashScreen from './src/components/SplashScreen';
import { TimerProvider } from './src/context/TimerContext';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import CustomAlert from './src/components/CustomAlert';
import GlobalAlert from './src/utils/GlobalAlert';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  
  // 모든 Hook을 조건부 렌더링 밖에서 선언
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showGlobalAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }> = [{ text: '확인' }]
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          button.onPress?.();
        }
      }))
    });
  };

  // GlobalAlert 인스턴스에 핸들러 등록
  useEffect(() => {
    GlobalAlert.getInstance().setAlertHandler(showGlobalAlert);
  }, []);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  // 조건부 렌더링 - 하지만 Hook은 이미 모두 선언됨
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onAnimationEnd={handleSplashEnd} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AlarmProvider>
        <TimerProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#2D1B14" />
            <TabNavigator />
            
            {/* 전역 CustomAlert */}
            <CustomAlert
              visible={alertConfig.visible}
              title={alertConfig.title}
              message={alertConfig.message}
              buttons={alertConfig.buttons}
              onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
          </NavigationContainer>
        </TimerProvider>
      </AlarmProvider>
    </SafeAreaProvider>
  );
}

export default App;