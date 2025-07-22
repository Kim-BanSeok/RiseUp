import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { gameStyles } from '../../../styles/gameStyles';
import BingoCell from './BingoCell';
import { BingoCell as BingoCellType } from '../../../types/gameTypes';

interface BoardSetupProps {
  phase: 'size' | 'numbers';
  boardSize: number;
  setupNumbers: string[];
  setupIndex: number;
  selectedSetupIndex: number;
  currentInputNumber: string;
  onSizeSelect: (size: number) => void;
  onNumberInput: (digit: string) => void;
  onNumberConfirm: () => void;
  onNumberBackspace: () => void;
  onCellSelect: (index: number) => void;
  onStartWithDefaults: () => void;
  onCompleteSetup: () => void;
}

const BoardSetup: React.FC<BoardSetupProps> = ({
  phase,
  boardSize,
  setupNumbers,
  setupIndex,
  selectedSetupIndex,
  currentInputNumber: _currentInputNumber,
  onSizeSelect,
  onNumberInput: _onNumberInput,
  onNumberConfirm: _onNumberConfirm,
  onNumberBackspace: _onNumberBackspace,
  onCellSelect,
  onStartWithDefaults,
  onCompleteSetup
}) => {
  const totalCells = boardSize * boardSize;
  const isSetupComplete = setupNumbers.every(num => num !== '' && num !== undefined);

  if (phase === 'size') {
    return (
      <View style={styles.setupContainer}>
        <View style={styles.sizeSelectionHeader}>
          <Text style={styles.sizeSelectionTitle}>빙고판 크기 선택</Text>
          <Text style={styles.sizeSelectionSubtitle}>원하는 크기를 선택하세요</Text>
        </View>
        
        <View style={styles.sizeOptions}>
          <View style={styles.sizeRow}>
            {[5, 6].map(size => (
              <TouchableOpacity
                key={size}
                style={styles.sizeOptionButton}
                onPress={() => onSizeSelect(size)}
              >
                <Text style={styles.sizeOptionText}>{size}×{size}</Text>
                <Text style={styles.sizeOptionDesc}>
                  {size === 5 ? '클래식' : '중급'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.sizeRow}>
            {[7, 8].map(size => (
              <TouchableOpacity
                key={size}
                style={styles.sizeOptionButton}
                onPress={() => onSizeSelect(size)}
              >
                <Text style={styles.sizeOptionText}>{size}×{size}</Text>
                <Text style={styles.sizeOptionDesc}>고급</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.setupContainer}>
      <View style={styles.setupHeader}>
        <Text style={styles.setupTitle}>
          빙고 번호 설정 ({boardSize}×{boardSize})
        </Text>
        <Text style={styles.setupProgress}>
          {setupIndex + 1} / {totalCells}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.defaultStartButton} 
        onPress={onStartWithDefaults}
      >
        <Text style={styles.defaultStartText}>🚀 기본 설정으로 바로 시작</Text>
      </TouchableOpacity>
      
      {/* 빙고 보드 미리보기 */}
      <View style={[styles.previewBoard, { width: boardSize * 36 }]}>
        {Array(totalCells).fill(null).map((_, index) => {
          const mockCell: BingoCellType = {
            number: parseInt(setupNumbers[index]) || (index + 1),
            selected: false,
            selectedBy: null,
            index
          };
          
          return (
            <BingoCell
              key={index}
              cell={mockCell}
              isActive={index === selectedSetupIndex}
              disabled={false}
              size={32}
              onPress={() => onCellSelect(index)}
            />
          );
        })}
      </View>

      {/* 안내 메시지 */}
      <View style={styles.instructionSection}>
        <Text style={styles.instructionText}>
          🎯 원하는 칸을 터치하여 숫자를 설정하세요
        </Text>
        <Text style={styles.instructionSubText}>
          설정된 칸: {setupNumbers.filter(num => num !== '' && num !== undefined).length}/{totalCells}
        </Text>
      </View>

      {/* 완료 버튼 */}
      <TouchableOpacity
        style={[
          gameStyles.primaryButton,
          styles.completeButton,
          !isSetupComplete && gameStyles.disabledButton
        ]}
        onPress={onCompleteSetup}
        disabled={!isSetupComplete}
      >
        <Text style={gameStyles.buttonText}>설정 완료</Text>
      </TouchableOpacity>
      

    </View>
  );
};

const styles = StyleSheet.create({
  setupContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  sizeSelectionHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  
  sizeSelectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  
  sizeSelectionSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  
  sizeOptions: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 15,
  },
  
  sizeOptionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    width: 120,
    height: 80,
    justifyContent: 'center',
  },
  
  sizeOptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  
  sizeOptionDesc: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  
  setupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  
  setupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  
  setupProgress: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  
  defaultStartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#45A049',
  },
  
  defaultStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  
  previewBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  inputSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  inputContainer: {
    alignItems: 'center',
  },
  
  inputButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  
  inputActionButton: {
    minWidth: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  
  completeButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginBottom: 15,
  },
  
  instructionSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  
  instructionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  instructionSubText: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
  },
});

export default BoardSetup; 