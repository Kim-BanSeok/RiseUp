import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { gameStyles } from '../../../styles/gameStyles';

interface NumberInputModalProps {
  visible: boolean;
  currentNumber: string;
  cellIndex: number;
  boardSize: number;
  onNumberInput: (digit: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

const NumberInputModal: React.FC<NumberInputModalProps> = ({
  visible,
  currentNumber,
  cellIndex,
  boardSize,
  onNumberInput,
  onBackspace,
  onConfirm,
  onClose
}) => {
  const row = Math.floor(cellIndex / boardSize) + 1;
  const col = (cellIndex % boardSize) + 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>설정 완료</Text>
          
          <Text style={styles.cellInfo}>
            {cellIndex + 1}번째 칸 ({row}행 {col}열)
          </Text>
          
          <View style={gameStyles.inputDisplay}>
            <Text style={gameStyles.inputText}>
              {currentNumber || '숫자 입력'}
            </Text>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[gameStyles.primaryButton, styles.actionButton]}
              onPress={onConfirm}
              disabled={!currentNumber}
            >
              <Text style={gameStyles.buttonText}>✓</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[gameStyles.dangerButton, styles.actionButton]}
              onPress={onBackspace}
            >
              <Text style={gameStyles.buttonText}>⌫</Text>
            </TouchableOpacity>
          </View>
          
          <View style={gameStyles.numberPad}>
            <View style={gameStyles.numberButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <TouchableOpacity
                  key={num}
                  style={gameStyles.numberButton}
                  onPress={() => onNumberInput(num.toString())}
                >
                  <Text style={gameStyles.numberButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={gameStyles.numberButton}
                onPress={() => onNumberInput('0')}
              >
                <Text style={gameStyles.numberButtonText}>0</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>설정 완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minWidth: 300,
    maxWidth: '90%',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  
  cellInfo: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 20,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
    marginBottom: 20,
  },
  
  actionButton: {
    minWidth: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  
  closeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
    marginTop: 20,
  },
  
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default NumberInputModal; 