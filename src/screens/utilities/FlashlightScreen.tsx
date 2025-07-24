import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FlashlightModule from '../../native/FlashlightModule';

const FlashlightScreen = () => {
  const insets = useSafeAreaInsets();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [flashState, setFlashState] = useState(false); // 실제 플래시 상태

  useEffect(() => {
    checkFlashlightAvailability();
    requestCameraPermission();
  }, []);

  const checkFlashlightAvailability = async () => {
    try {
      const available = await FlashlightModule.isFlashlightAvailable();
      setIsAvailable(available);
    } catch (error) {
      console.error('플래시 확인 실패:', error);
      setIsAvailable(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한',
            message: '손전등 기능을 사용하려면 카메라 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (error) {
        console.error('권한 요청 실패:', error);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  const toggleFlash = async () => {
    if (!hasPermission) {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return;
    }

    if (!isAvailable) {
      Alert.alert('플래시 없음', '이 기기에는 플래시가 없습니다.');
      return;
    }

    // SOS나 깜빡임이 활성화되어 있으면 중지
    if (isSOSActive || isBlinking) {
      setIsSOSActive(false);
      setIsBlinking(false);
      return;
    }

    try {
      if (isFlashOn) {
        await FlashlightModule.turnOffFlashlight();
        setIsFlashOn(false);
        setFlashState(false);
      } else {
        await FlashlightModule.turnOnFlashlight();
        setIsFlashOn(true);
        setFlashState(true);
      }
    } catch (error) {
      console.error('플래시 토글 실패:', error);
      Alert.alert('오류', '플래시를 제어할 수 없습니다.');
    }
  };

  const handleSOS = async () => {
    if (!hasPermission || !isAvailable) {
      Alert.alert('사용 불가', 'SOS 신호를 사용할 수 없습니다.');
      return;
    }

    if (isSOSActive) {
      setIsSOSActive(false);
      setFlashState(false);
      return;
    }

    setIsSOSActive(true);
    setIsBlinking(false);
    setIsFlashOn(false);

    try {
      // SOS 패턴: 3번 깜빡임 - 3번 깜빡임 - 3번 깜빡임
      for (let cycle = 0; cycle < 3; cycle++) {
        if (!isSOSActive) break; // 중지되면 루프 종료
        
        // 3번 깜빡임
        for (let i = 0; i < 3; i++) {
          if (!isSOSActive) break;
          await FlashlightModule.turnOnFlashlight();
          setFlashState(true);
          await new Promise(resolve => setTimeout(resolve, 200));
          await FlashlightModule.turnOffFlashlight();
          setFlashState(false);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        if (!isSOSActive) break;
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 3번 깜빡임
        for (let i = 0; i < 3; i++) {
          if (!isSOSActive) break;
          await FlashlightModule.turnOnFlashlight();
          setFlashState(true);
          await new Promise(resolve => setTimeout(resolve, 200));
          await FlashlightModule.turnOffFlashlight();
          setFlashState(false);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        if (!isSOSActive) break;
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 3번 깜빡임
        for (let i = 0; i < 3; i++) {
          if (!isSOSActive) break;
          await FlashlightModule.turnOnFlashlight();
          setFlashState(true);
          await new Promise(resolve => setTimeout(resolve, 200));
          await FlashlightModule.turnOffFlashlight();
          setFlashState(false);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        if (!isSOSActive) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('SOS 신호 실패:', error);
    } finally {
      setIsSOSActive(false);
      setFlashState(false);
    }
  };

  const handleBlink = async () => {
    if (!hasPermission || !isAvailable) {
      Alert.alert('사용 불가', '깜빡임 기능을 사용할 수 없습니다.');
      return;
    }

    if (isBlinking) {
      setIsBlinking(false);
      setFlashState(false);
      return;
    }

    setIsBlinking(true);
    setIsSOSActive(false);
    setIsFlashOn(false);

    try {
      // 10번 깜빡임
      for (let i = 0; i < 10; i++) {
        if (!isBlinking) break; // 중지되면 루프 종료
        
        await FlashlightModule.turnOnFlashlight();
        setFlashState(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await FlashlightModule.turnOffFlashlight();
        setFlashState(false);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('깜빡임 실패:', error);
    } finally {
      setIsBlinking(false);
      setFlashState(false);
    }
  };

  // 현재 플래시 상태에 따른 표시기 스타일 결정
  const getFlashIndicatorStyle = () => {
    if (flashState) {
      return [styles.flashIndicator, styles.flashOn];
    }
    return styles.flashIndicator;
  };

  // 현재 상태에 따른 아이콘 결정
  const getFlashIcon = () => {
    if (flashState) {
      return '🔦';
    }
    if (isSOSActive) {
      return '🚨';
    }
    if (isBlinking) {
      return '⚡';
    }
    return '⚫';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>손전등</Text>
          <Text style={styles.subtitle}>
            {isFlashOn ? '켜짐' : isSOSActive ? 'SOS 신호' : isBlinking ? '깜빡임' : '꺼짐'}
          </Text>
          {!isAvailable && (
            <Text style={styles.warningText}>⚠️ 플래시 없음</Text>
          )}
          {!hasPermission && (
            <Text style={styles.warningText}>⚠️ 권한 필요</Text>
          )}
        </View>

        {/* 플래시 상태 표시 - 실제 플래시 상태 반영 */}
        <View style={getFlashIndicatorStyle()}>
          <Text style={styles.flashIcon}>
            {getFlashIcon()}
          </Text>
        </View>

        {/* 토글 버튼 */}
        <TouchableOpacity
          style={[
            styles.toggleButton, 
            (isFlashOn || isSOSActive || isBlinking) && styles.toggleButtonOn,
            (!hasPermission || !isAvailable) && styles.toggleButtonDisabled
          ]}
          onPress={toggleFlash}
          activeOpacity={0.8}
          disabled={!hasPermission || !isAvailable || isSOSActive || isBlinking}
        >
          <Text style={[styles.toggleButtonText, (isFlashOn || isSOSActive || isBlinking) && styles.toggleButtonTextOn]}>
            {isFlashOn ? '끄기' : isSOSActive ? 'SOS 중지' : isBlinking ? '깜빡임 중지' : '켜기'}
          </Text>
        </TouchableOpacity>

        {/* 추가 기능들 */}
        <View style={styles.additionalFeatures}>
          <TouchableOpacity 
            style={[
              styles.featureButton, 
              (!hasPermission || !isAvailable) && styles.featureButtonDisabled,
              isSOSActive && styles.featureButtonActive
            ]}
            onPress={handleSOS}
            disabled={!hasPermission || !isAvailable}
          >
            <Text style={[styles.featureIcon, isSOSActive && styles.featureIconActive]}>🚨</Text>
            <Text style={[styles.featureText, isSOSActive && styles.featureTextActive]}>
              {isSOSActive ? 'SOS 중지' : 'SOS 신호'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.featureButton, 
              (!hasPermission || !isAvailable) && styles.featureButtonDisabled,
              isBlinking && styles.featureButtonActive
            ]}
            onPress={handleBlink}
            disabled={!hasPermission || !isAvailable}
          >
            <Text style={[styles.featureIcon, isBlinking && styles.featureIconActive]}>⚡</Text>
            <Text style={[styles.featureText, isBlinking && styles.featureTextActive]}>
              {isBlinking ? '깜빡임 중지' : '깜빡임'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#A67C61',
    fontSize: 18,
  },
  warningText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 5,
  },
  flashIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    borderWidth: 3,
    borderColor: '#555',
  },
  flashOn: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  flashIcon: {
    fontSize: 48,
  },
  toggleButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 50,
    minWidth: 120,
    alignItems: 'center',
  },
  toggleButtonOn: {
    backgroundColor: '#FF4444',
  },
  toggleButtonDisabled: {
    backgroundColor: '#666',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButtonTextOn: {
    color: 'white',
  },
  additionalFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  featureButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    minWidth: 80,
  },
  featureButtonDisabled: {
    opacity: 0.5,
  },
  featureButtonActive: {
    backgroundColor: '#FF7F50',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureIconActive: {
    color: 'white',
  },
  featureText: {
    color: '#A67C61',
    fontSize: 12,
    textAlign: 'center',
  },
  featureTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FlashlightScreen; 