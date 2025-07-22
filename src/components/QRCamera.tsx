import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

const { height: screenHeight } = Dimensions.get('window');

interface QRCameraProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
}

const QRCamera: React.FC<QRCameraProps> = ({ onCodeScanned, onClose }) => {
  const [hasScanned, setHasScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // 카메라 권한 확인
  const checkCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await check(permission);
      
      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      }
      
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('권한 확인 실패:', error);
      return false;
    }
  };

  // QR 코드 스캔 성공
  const onSuccess = (e: any) => {
    if (hasScanned) return;
    
    setHasScanned(true);
    setIsActive(false);
    
    console.log('QR 코드 스캔 성공:', e.data);
    
    // 스캔 결과 전달
    setTimeout(() => {
      onCodeScanned(e.data);
    }, 300);
  };

  // 다시 스캔하기
  const resetScan = () => {
    setHasScanned(false);
    setIsActive(true);
  };

  // 권한 요청 시 설정으로 이동
  const openSettings = () => {
    Alert.alert(
      '카메라 권한 필요',
      'QR 코드 스캔을 위해 카메라 권한이 필요합니다.\n설정에서 권한을 허용해주세요.',
      [
        { text: '취소', onPress: onClose },
        { 
          text: '설정 열기', 
          onPress: () => {
            Linking.openSettings();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={onSuccess}
        reactivate={!hasScanned}
        reactivateTimeout={2000}
        showMarker={true}
        markerStyle={styles.marker}
        cameraStyle={styles.camera}
        topViewStyle={styles.topView}
        bottomViewStyle={styles.bottomView}
        containerStyle={styles.scannerContainer}
        checkAndroid6Permissions={true}
        permissionDialogTitle="카메라 권한 요청"
        permissionDialogMessage="QR 코드를 스캔하기 위해 카메라 권한이 필요합니다."
        buttonPositive="허용"
        buttonNegative="거부"
        topContent={
          <View style={styles.topContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>QR 코드 스캔</Text>
            <View style={styles.placeholder} />
          </View>
        }
        bottomContent={
          <View style={styles.bottomContent}>
            <Text style={styles.instructionText}>
              {hasScanned 
                ? '스캔 완료!' 
                : 'QR 코드를 프레임 안에 맞춰주세요'
              }
            </Text>
            
            {hasScanned && (
              <TouchableOpacity style={styles.rescanButton} onPress={resetScan}>
                <Text style={styles.rescanButtonText}>다시 스캔</Text>
              </TouchableOpacity>
            )}

            {/* 권한 안내 */}
            <TouchableOpacity 
              style={styles.helpButton} 
              onPress={() => {
                Alert.alert(
                  '사용 방법',
                  '• QR 코드를 화면 중앙의 사각형 프레임 안에 맞춰주세요\n• 코드가 선명하게 보이도록 적절한 거리를 유지하세요\n• 충분한 조명이 있는 곳에서 스캔하세요',
                  [{ text: '확인' }]
                );
              }}
            >
              <Text style={styles.helpButtonText}>💡 도움말</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    height: screenHeight,
  },
  marker: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    borderRadius: 10,
    width: 250,
    height: 250,
  },
  topView: {
    height: 0,
    flex: 0,
  },
  bottomView: {
    height: 0,
    flex: 0,
  },
  topContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  rescanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  rescanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  helpButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});

export default QRCamera; 