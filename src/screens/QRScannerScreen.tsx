import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QRHistory {
  id: string;
  content: string;
  type: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'unknown';
  date: string;
}

const QRScannerScreen = () => {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<QRHistory[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateText, setGenerateText] = useState('');

  const detectQRType = (content: string): QRHistory['type'] => {
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return 'url';
    } else if (content.startsWith('mailto:')) {
      return 'email';
    } else if (content.startsWith('tel:')) {
      return 'phone';
    } else if (content.startsWith('WIFI:')) {
      return 'wifi';
    } else {
      return 'text';
    }
  };

  const startScan = () => {
    Alert.alert(
      '기능 준비 중',
      'QR 스캐너 기능을 준비 중입니다.\n현재는 시뮬레이션 모드로 동작합니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '시뮬레이션',
          onPress: () => {
            setIsScanning(true);
            // 시뮬레이션된 QR 스캔
            setTimeout(() => {
              const sampleContent = 'https://example.com';
              const newScan: QRHistory = {
                id: Date.now().toString(),
                content: sampleContent,
                type: detectQRType(sampleContent),
                date: new Date().toISOString()
              };
              setHistory(prev => [newScan, ...prev]);
              setIsScanning(false);
              Alert.alert('스캔 완료', `스캔된 내용: ${sampleContent}`);
            }, 2000);
          }
        }
      ]
    );
  };

  const handleHistoryItem = (item: QRHistory) => {
    const actions: Array<{text: string, onPress?: () => void, style?: any}> = [
      { text: '취소', style: 'cancel' }
    ];

    if (item.type === 'url') {
      actions.unshift({
        text: '링크 열기',
        onPress: () => Alert.alert('알림', '브라우저에서 링크를 열 수 있습니다.')
      });
    } else if (item.type === 'phone') {
      actions.unshift({
        text: '전화 걸기',
        onPress: () => Alert.alert('알림', '전화 앱에서 번호를 다이얼할 수 있습니다.')
      });
    } else if (item.type === 'email') {
      actions.unshift({
        text: '이메일 작성',
        onPress: () => Alert.alert('알림', '메일 앱에서 이메일을 작성할 수 있습니다.')
      });
    }

    actions.unshift({
      text: '복사',
      onPress: () => {
        Clipboard.setString(item.content);
        Alert.alert('복사됨', '클립보드에 복사되었습니다.');
      }
    });

    actions.unshift({
      text: '공유',
      onPress: () => {
        Share.share({
          message: item.content,
          title: 'QR 코드 내용'
        });
      }
    });

    Alert.alert('QR 코드 내용', item.content, actions);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    Alert.alert(
      '히스토리 삭제',
      '모든 스캔 히스토리를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => setHistory([])
        }
      ]
    );
  };

  const generateQR = () => {
    if (!generateText.trim()) {
      Alert.alert('오류', '생성할 텍스트를 입력하세요.');
      return;
    }

    Alert.alert(
      'QR 코드 생성',
      `"${generateText}" 내용으로 QR 코드가 생성되었습니다.\n실제 구현에서는 QR 코드 이미지가 표시됩니다.`,
      [{ text: '확인' }]
    );
    setGenerateText('');
    setShowGenerate(false);
  };

  const getTypeIcon = (type: QRHistory['type']) => {
    switch (type) {
      case 'url': return '🌐';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'wifi': return '📶';
      case 'text': return '📄';
      default: return '❓';
    }
  };

  const getTypeLabel = (type: QRHistory['type']) => {
    switch (type) {
      case 'url': return '웹사이트';
      case 'email': return '이메일';
      case 'phone': return '전화번호';
      case 'wifi': return 'WiFi';
      case 'text': return '텍스트';
      default: return '기타';
    }
  };

  if (showGenerate) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowGenerate(false)}>
            <Text style={styles.backButton}>◀ 돌아가기</Text>
          </TouchableOpacity>
          <Text style={styles.title}>QR 코드 생성</Text>
          <View style={{ width: 80 }} />
        </View>

        <View style={styles.generateContainer}>
          <Text style={styles.generateLabel}>생성할 내용:</Text>
          <Text
            style={styles.generateInput}
            onPress={() => {
              Alert.prompt(
                'QR 코드 생성',
                '생성할 텍스트나 URL을 입력하세요',
                [
                  { text: '취소', style: 'cancel' },
                  { 
                    text: '확인', 
                    onPress: (text) => setGenerateText(text || '')
                  }
                ],
                'plain-text',
                generateText
              );
            }}
          >
            {generateText || '터치하여 입력'}
          </Text>

          <TouchableOpacity style={styles.generateButton} onPress={generateQR}>
            <Text style={styles.generateButtonText}>QR 코드 생성</Text>
          </TouchableOpacity>

          <View style={styles.qrPreview}>
            <Text style={styles.qrPreviewText}>
              📱{'\n'}QR 코드{'\n'}미리보기
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>📱 QR 스캐너</Text>
        <TouchableOpacity 
          style={styles.generateToggle}
          onPress={() => setShowGenerate(true)}
        >
          <Text style={styles.generateToggleText}>생성</Text>
        </TouchableOpacity>
      </View>

      {/* 스캔 영역 */}
      <View style={styles.scanArea}>
        <View style={styles.scanFrame}>
          {isScanning ? (
            <View style={styles.scanningIndicator}>
              <Text style={styles.scanningText}>스캔 중...</Text>
              <Text style={styles.scanningSubText}>QR 코드를 카메라에 맞춰주세요</Text>
            </View>
          ) : (
            <View style={styles.scanPlaceholder}>
              <Text style={styles.scanPlaceholderIcon}>📱</Text>
              <Text style={styles.scanPlaceholderText}>QR 코드 스캔</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? '스캔 중...' : '스캔 시작'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 히스토리 */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>스캔 히스토리</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearButton}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.historyList}>
          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>아직 스캔한 QR 코드가 없습니다</Text>
              <Text style={styles.emptySubText}>QR 코드를 스캔해보세요!</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <TouchableOpacity 
                  style={styles.historyContent}
                  onPress={() => handleHistoryItem(item)}
                >
                  <View style={styles.historyIcon}>
                    <Text style={styles.historyIconText}>{getTypeIcon(item.type)}</Text>
                  </View>
                  
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyType}>{getTypeLabel(item.type)}</Text>
                    <Text style={styles.historyText} numberOfLines={2}>
                      {item.content}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.date).toLocaleDateString('ko-KR')} {' '}
                      {new Date(item.date).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteHistoryItem(item.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  generateToggle: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  generateToggleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    color: '#4CAF50',
    fontSize: 16,
  },
  scanArea: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scanningSubText: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  scanPlaceholder: {
    alignItems: 'center',
  },
  scanPlaceholderIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  scanPlaceholderText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanButtonDisabled: {
    backgroundColor: '#666',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  clearButton: {
    color: '#ff4444',
    fontSize: 14,
  },
  historyList: {
    flex: 1,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconText: {
    fontSize: 20,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  historyText: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  deleteButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  generateContainer: {
    flex: 1,
    padding: 20,
  },
  generateLabel: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 10,
  },
  generateInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 50,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrPreview: {
    width: 200,
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  qrPreviewText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default QRScannerScreen; 