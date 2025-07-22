import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BingoCell as BingoCellType } from '../../../types/gameTypes';

interface BingoCellProps {
  cell: BingoCellType;
  onPress?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  size?: number;
}

const BingoCell: React.FC<BingoCellProps> = ({ 
  cell, 
  onPress, 
  disabled = false, 
  isActive = false,
  size = 32
}) => {
  const getCellStyle = () => {
    const baseStyle: any[] = [
      styles.cell,
      { width: size, height: size }
    ];

    if (isActive) {
      baseStyle.push(styles.activeCell);
    } else if (cell.selected) {
      if (cell.selectedBy === 'player') {
        baseStyle.push(styles.playerSelectedCell);
      } else if (cell.selectedBy === 'computer') {
        baseStyle.push(styles.computerSelectedCell);
      }
    }

    if (disabled) {
      baseStyle.push(styles.disabledCell);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any[] = [styles.cellText];
    
    if (cell.selected) {
      baseStyle.push(styles.selectedText);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getCellStyle()}
      onPress={onPress}
      disabled={disabled || cell.selected}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {cell.number}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    backgroundColor: '#555',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderWidth: 1,
    borderColor: '#666',
  },
  
  activeCell: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  
  playerSelectedCell: {
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
    borderWidth: 2,
  },
  
  computerSelectedCell: {
    backgroundColor: '#FF6B6B',
    borderColor: '#F44336',
    borderWidth: 2,
  },
  
  disabledCell: {
    opacity: 0.5,
  },
  
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  selectedText: {
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default BingoCell; 