// RiseUp/src/components/CustomAlert.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>;
  onRequestClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onRequestClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleButtonPress = (onPress?: () => void) => {
    Vibration.vibrate(50);
    if (onPress) {
      onPress();
    }
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return [styles.button, styles.destructiveButton];
      case 'cancel':
        return [styles.button, styles.cancelButton];
      default:
        return [styles.button, styles.defaultButton];
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return [styles.buttonText, styles.destructiveButtonText];
      case 'cancel':
        return [styles.buttonText, styles.cancelButtonText];
      default:
        return [styles.buttonText, styles.defaultButtonText];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { marginTop: insets.top }]}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* 메시지 */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button.style)}
                onPress={() => handleButtonPress(button.onPress)}
              >
                <Text style={getButtonTextStyle(button.style)}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  alertContainer: {
    backgroundColor: '#2D1B14',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#FF7F50',
    overflow: 'hidden', // 내용이 박스 밖으로 나가지 않도록
  },
  header: {
    backgroundColor: '#FF7F50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  messageContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#FFD4B3',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#4A2C1A',
    width: '100%', // 전체 너비 확실히 설정
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10, // 좌우 패딩 추가
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // 최소 높이 설정
  },
  defaultButton: {
    backgroundColor: '#4A2C1A',
  },
  cancelButton: {
    backgroundColor: '#3A241A',
    borderRightWidth: 1,
    borderRightColor: '#4A2C1A',
  },
  destructiveButton: {
    backgroundColor: '#8B4513',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  defaultButtonText: {
    color: '#FF7F50',
  },
  cancelButtonText: {
    color: '#FFAB7A',
  },
  destructiveButtonText: {
    color: '#FFD4B3',
  },
});

export default CustomAlert;