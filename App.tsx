import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlarmProvider } from './src/context/AlarmContext';
import SimpleSplashScreen from './src/components/SimpleSplashScreen';
import { TimerProvider } from './src/context/TimerContext';
import { TabProvider } from './src/context/TabContext';
import { IntervalProvider } from './src/context/IntervalContext';
import { GameScoreProvider } from './src/context/GameScoreContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import CustomAlert from './src/components/CustomAlert';
import GlobalAlert from './src/utils/GlobalAlert';

console.log('=== App.tsx loaded ===');

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  
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

  const handleSplashEnd = () => {
    console.log('=== Splash screen ended ===');
    setShowSplash(false);
  };

  useEffect(() => {
    const showAlert = (
      title: string,
      message: string,
      buttons: Array<{
        text: string;
        style?: 'default' | 'cancel' | 'destructive';
        onPress?: () => void;
      }>
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

    GlobalAlert.setAlertHandler(showAlert);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={showSplash ? "#1a73e8" : "#1A1A1A"} 
      />
      
      <ThemeProvider>
        <AlarmProvider>
          <TimerProvider>
            <IntervalProvider>
              <TabProvider>
                <GameScoreProvider>
                  {showSplash ? (
                    <SimpleSplashScreen onAnimationEnd={handleSplashEnd} />
                  ) : (
                    <AppNavigator />
                  )}
                </GameScoreProvider>
              </TabProvider>
            </IntervalProvider>
          </TimerProvider>
        </AlarmProvider>
      </ThemeProvider>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaProvider>
  );
}

export default App;