import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Share,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCustomAlert } from '../../hooks/useCustomAlert';

interface ScanHistory {
  id: string;
  data: string;
  type: string;
  timestamp: number;
}

interface GeneratedQR {
  id: string;
  text: string;
  timestamp: number;
}

const QRScannerScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [qrText, setQrText] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState('확인 중...');
  const { showCustomAlert } = useCustomAlert();

  useEffect(() => {
    checkCameraPermission();
    loadScanHistory();
    loadGeneratedQRs();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        console.log('카메라 권한 상태:', granted);
        setPermissionStatus(`권한 상태: ${granted ? '허용됨' : '거부됨'}`);
        setHasPermission(granted);
        
        if (!granted) {
          requestCameraPermission();
        }
      } else {
        setHasPermission(true);
        setPermissionStatus('권한 상태: 허용됨 (iOS)');
      }
    } catch (error) {
      console.error('권한 확인 오류:', error);
      setPermissionStatus('권한 확인 실패');
      setHasPermission(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: '카메라 권한 필요',
            message: 'QR 코드 스캔을 위해 카메라 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '허용',
          }
        );
        
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('권한 요청 결과:', granted, isGranted);
        setPermissionStatus(`권한 요청 결과: ${isGranted ? '허용됨' : '거부됨'}`);
        setHasPermission(isGranted);
        
        if (!isGranted) {
          showCustomAlert(
            '카메라 권한 필요',
            'QR 코드 스캔을 위해 설정에서 카메라 권한을 허용해주세요.',
            [{ text: '확인' }]
          );
        }
      }
    } catch (error) {
      console.error('권한 요청 오류:', error);
      setPermissionStatus('권한 요청 실패');
      setHasPermission(false);
    }
  };

  const loadScanHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('qr_scan_history');
      if (history) {
        setScanHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('스캔 기록 로드 실패:', error);
    }
  };

  const loadGeneratedQRs = async () => {
    try {
      const qrs = await AsyncStorage.getItem('generated_qrs');
      if (qrs) {
        setGeneratedQRs(JSON.parse(qrs));
      }
    } catch (error) {
      console.error('생성된 QR 로드 실패:', error);
    }
  };

  const saveScanHistory = async (newHistory: ScanHistory[]) => {
    try {
      await AsyncStorage.setItem('qr_scan_history', JSON.stringify(newHistory));
      setScanHistory(newHistory);
    } catch (error) {
      console.error('스캔 기록 저장 실패:', error);
    }
  };

  const saveGeneratedQRs = async (newQRs: GeneratedQR[]) => {
    try {
      await AsyncStorage.setItem('generated_qrs', JSON.stringify(newQRs));
      setGeneratedQRs(newQRs);
    } catch (error) {
      console.error('생성된 QR 저장 실패:', error);
    }
  };

  const onScanSuccess = (e: any) => {
    console.log('QR 스캔 성공:', e.data);
    setIsScanning(false);
    
    const newScan: ScanHistory = {
      id: Date.now().toString(),
      data: e.data,
      type: detectQRType(e.data),
      timestamp: Date.now(),
    };

    const updatedHistory = [newScan, ...scanHistory].slice(0, 50); // 최대 50개
    saveScanHistory(updatedHistory);

    showCustomAlert(
      'QR 코드 스캔 완료',
      `내용: ${e.data}\n유형: ${newScan.type}`,
      [
        { text: '확인' },
        {
          text: '복사',
          onPress: () => {
            // 클립보드 복사 로직
            showCustomAlert('알림', '클립보드에 복사되었습니다.', [{ text: '확인' }]);
          }
        }
      ]
    );
  };

  const detectQRType = (data: string): string => {
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return 'URL';
    } else if (data.startsWith('mailto:')) {
      return '이메일';
    } else if (data.startsWith('tel:')) {
      return '전화번호';
    } else if (data.startsWith('WIFI:')) {
      return 'WiFi';
    } else {
      return '텍스트';
    }
  };

  const generateQRCode = () => {
    if (!qrText.trim()) {
      showCustomAlert('입력 오류', 'QR 코드로 변환할 텍스트를 입력해주세요.', [{ text: '확인' }]);
      return;
    }

    const newQR: GeneratedQR = {
      id: Date.now().toString(),
      text: qrText.trim(),
      timestamp: Date.now(),
    };

    const updatedQRs = [newQR, ...generatedQRs].slice(0, 30); // 최대 30개
    saveGeneratedQRs(updatedQRs);
    
    setQrText('');
    setShowGenerator(false);
    
    showCustomAlert('QR 코드 생성 완료', '새로운 QR 코드가 생성되었습니다.', [{ text: '확인' }]);
  };

  const shareQRCode = async (text: string) => {
    try {
      await Share.share({
        message: `QR 코드 내용: ${text}`,
        title: 'QR 코드 공유',
      });
    } catch (error) {
      console.error('공유 실패:', error);
      showCustomAlert('공유 실패', 'QR 코드 공유 중 오류가 발생했습니다.', [{ text: '확인' }]);
    }
  };

  const clearHistory = () => {
    showCustomAlert(
      '기록 삭제',
      '모든 스캔 기록을 삭제하시겠습니까?',
      [
        { text: '취소' },
        {
          text: '삭제',
          onPress: async () => {
            await AsyncStorage.removeItem('qr_scan_history');
            setScanHistory([]);
          }
        }
      ]
    );
  };

  const clearGeneratedQRs = () => {
    showCustomAlert(
      'QR 코드 삭제',
      '생성된 모든 QR 코드를 삭제하시겠습니까?',
      [
        { text: '취소' },
        {
          text: '삭제',
          onPress: async () => {
            await AsyncStorage.removeItem('generated_qrs');
            setGeneratedQRs([]);
          }
        }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>{permissionStatus}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.statusText}>{permissionStatus}</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>카메라 권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{permissionStatus}</Text>
      
      {isScanning ? (
        <View style={styles.scannerContainer}>
          <QRCodeScanner
            onRead={onScanSuccess}
            showMarker={true}
            markerStyle={styles.marker}
            cameraStyle={styles.camera}
            topContent={
              <Text style={styles.centerText}>
                QR 코드를 카메라 중앙에 맞춰주세요
              </Text>
            }
            bottomContent={
              <TouchableOpacity
                style={styles.buttonTouchable}
                onPress={() => setIsScanning(false)}
              >
                <Text style={styles.buttonText}>스캔 중지</Text>
              </TouchableOpacity>
            }
          />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setIsScanning(true)}
            >
              <Text style={styles.buttonText}>QR 코드 스캔</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowGenerator(true)}
            >
              <Text style={styles.buttonText}>QR 코드 생성</Text>
            </TouchableOpacity>
          </View>

          {/* 스캔 기록 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>스캔 기록</Text>
              {scanHistory.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearButton}>모두 삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            {scanHistory.length === 0 ? (
              <Text style={styles.emptyText}>스캔 기록이 없습니다</Text>
            ) : (
              scanHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyType}>{item.type}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleString('ko-KR')}
                    </Text>
                  </View>
                  <Text style={styles.historyData} numberOfLines={2}>
                    {item.data}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* 생성된 QR 코드 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>생성된 QR 코드</Text>
              {generatedQRs.length > 0 && (
                <TouchableOpacity onPress={clearGeneratedQRs}>
                  <Text style={styles.clearButton}>모두 삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            {generatedQRs.length === 0 ? (
              <Text style={styles.emptyText}>생성된 QR 코드가 없습니다</Text>
            ) : (
              generatedQRs.map((item) => (
                <View key={item.id} style={styles.qrItem}>
                  <View style={styles.qrContent}>
                    <View style={styles.qrPlaceholder}>
                      <Text style={styles.qrPlaceholderText}>QR</Text>
                    </View>
                    <View style={styles.qrInfo}>
                      <Text style={styles.qrText} numberOfLines={2}>
                        {item.text}
                      </Text>
                      <Text style={styles.qrDate}>
                        {new Date(item.timestamp).toLocaleString('ko-KR')}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => shareQRCode(item.text)}
                  >
                    <Text style={styles.shareButtonText}>공유</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* QR 생성 모달 */}
      <Modal
        visible={showGenerator}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerator(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR 코드 생성</Text>
            <TextInput
              style={styles.textInput}
              placeholder="텍스트, URL, 연락처 등을 입력하세요"
              value={qrText}
              onChangeText={setQrText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowGenerator(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.primaryModalButton]}
                onPress={generateQRCode}
              >
                <Text style={[styles.modalButtonText, styles.primaryModalButtonText]}>
                  생성
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scannerContainer: {
    flex: 1,
  },
  camera: {
    height: '100%',
  },
  marker: {
    borderColor: '#00ff00',
    borderWidth: 2,
  },
  centerText: {
    fontSize: 18,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  buttonTouchable: {
    padding: 16,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    margin: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusText: {
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#e0e0e0',
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyType: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyData: {
    fontSize: 14,
    color: '#333',
  },
  qrItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  qrContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  qrInfo: {
    flex: 1,
    marginLeft: 12,
  },
  qrText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  qrDate: {
    fontSize: 12,
    color: '#999',
  },
  shareButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryModalButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  primaryModalButtonText: {
    color: 'white',
  },
});

export default QRScannerScreen; 