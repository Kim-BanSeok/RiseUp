import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SCREEN_WIDTH, COLORS, SIZES, getButtonSize } from '../../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CalculatorScreen = () => {
  const insets = useSafeAreaInsets();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, op: string): number => {
    switch (op) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      default: return secondValue;
    }
  };

  const performEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue === null || operation === null) {
      return;
    }

    const newValue = calculate(previousValue, inputValue, operation);
    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const renderButton = (text: string, onPress: () => void, style?: any) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, style?.buttonText]}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { 
      paddingTop: insets.top,
      paddingBottom: insets.bottom + 100 // 탭바 높이만큼 하단 패딩 추가
    }]}>
      <View style={styles.display}>
        <Text style={styles.displayText}>{display}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          {renderButton('C', clearAll, styles.clearButton)}
          {renderButton('±', () => setDisplay(String(-parseFloat(display))), styles.operatorButton)}
          {renderButton('%', () => setDisplay(String(parseFloat(display) / 100)), styles.operatorButton)}
          {renderButton('÷', () => performOperation('÷'), styles.operatorButton)}
        </View>
        
        <View style={styles.row}>
          {renderButton('7', () => inputDigit('7'))}
          {renderButton('8', () => inputDigit('8'))}
          {renderButton('9', () => inputDigit('9'))}
          {renderButton('×', () => performOperation('×'), styles.operatorButton)}
        </View>
        
        <View style={styles.row}>
          {renderButton('4', () => inputDigit('4'))}
          {renderButton('5', () => inputDigit('5'))}
          {renderButton('6', () => inputDigit('6'))}
          {renderButton('-', () => performOperation('-'), styles.operatorButton)}
        </View>
        
        <View style={styles.row}>
          {renderButton('1', () => inputDigit('1'))}
          {renderButton('2', () => inputDigit('2'))}
          {renderButton('3', () => inputDigit('3'))}
          {renderButton('+', () => performOperation('+'), styles.operatorButton)}
        </View>
        
        <View style={styles.row}>
          {renderButton('0', () => inputDigit('0'), styles.zeroButton)}
          {renderButton('.', inputDecimal)}
          {renderButton('=', performEquals, styles.equalsButton)}
        </View>
      </View>
    </View>
  );
};

const buttonSize = getButtonSize(4, 60);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  displayText: {
    color: 'white',
    fontSize: 48,
    fontWeight: '300',
  },
  buttonContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  operatorButton: {
    backgroundColor: '#FF7F50',
  },
  equalsButton: {
    backgroundColor: '#4ECDC4',
  },
  zeroButton: {
    width: buttonSize * 2 + 10,
  },
});

export default CalculatorScreen; 