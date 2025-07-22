import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BingoCell as BingoCellType } from '../../../types/gameTypes';
import BingoCell from './BingoCell';

interface BingoBoardProps {
  title: string;
  board: BingoCellType[];
  boardSize: number;
  onCellPress?: (index: number) => void;
  disabled?: boolean;
  filledCount: number;
  totalCount: number;
  cellSize?: number;
}

const BingoBoard: React.FC<BingoBoardProps> = ({
  title,
  board,
  boardSize,
  onCellPress,
  disabled = false,
  filledCount,
  totalCount,
  cellSize = 32
}) => {
  const boardWidth = boardSize * (cellSize + 4); // 셀 크기 + 마진

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.score}>
          {filledCount}/{totalCount}
        </Text>
      </View>
      
      <View style={[styles.board, { width: boardWidth }]}>
        {board.map((cell, index) => (
          <BingoCell
            key={index}
            cell={cell}
            onPress={() => onCellPress?.(index)}
            disabled={disabled}
            size={cellSize}
          />
        ))}
      </View>
      
      {/* 진행률 바 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(filledCount / totalCount) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((filledCount / totalCount) * 100)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 0,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a0a0a0',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default BingoBoard; 