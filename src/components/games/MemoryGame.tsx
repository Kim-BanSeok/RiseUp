import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface MemoryGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

interface MemoryGameState {
  sequence: number[];
  userSequence: number[];
  currentStep: number;
  showingSequence: boolean;
  gameOver: boolean;
  level: number;
  currentShowingIndex: number;
  isFlashing: boolean;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onExit, onScore }) => {
  const [memoryGame, setMemoryGame] = useState<MemoryGameState>({
    sequence: [],
    userSequence: [],
    currentStep: 0,
    showingSequence: false,
    gameOver: false,
    level: 1,
    currentShowingIndex: -1,
    isFlashing: false
  });

  // 시퀀스를 순차적으로 보여주는 함수
  const showSequence = (sequence: number[]) => {
    console.log('🧠 [기억력] 시퀀스 표시 시작:', sequence);
    setMemoryGame(prev => ({ 
      ...prev, 
      showingSequence: true, 
      currentShowingIndex: -1,
      isFlashing: false 
    }));
    
    let currentIndex = 0;
    
    const showNextInSequence = () => {
      if (currentIndex >= sequence.length) {
        console.log('🧠 [기억력] 시퀀스 표시 완료');
        setTimeout(() => {
          setMemoryGame(prev => ({ 
            ...prev, 
            showingSequence: false,
            currentShowingIndex: -1,
            isFlashing: false
          }));
        }, 500);
        return;
      }
      
      const buttonIndex = sequence[currentIndex];
      console.log('🧠 [기억력] 버튼 표시:', buttonIndex);
      
      setMemoryGame(prev => ({ 
        ...prev, 
        currentShowingIndex: buttonIndex,
        isFlashing: true 
      }));
      
      setTimeout(() => {
        setMemoryGame(prev => ({ 
          ...prev, 
          currentShowingIndex: -1,
          isFlashing: false 
        }));
        
        setTimeout(() => {
          currentIndex++;
          showNextInSequence();
        }, 400);
      }, 800);
    };
    
    setTimeout(() => {
      showNextInSequence();
    }, 500);
  };

  // 기억력 게임 시작
  const startMemoryGame = () => {
    console.log('🧠 [기억력] 게임 시작');
    const sequence = [Math.floor(Math.random() * 4)];
    console.log('🧠 [기억력] 초기 시퀀스:', sequence);
    
    setMemoryGame({
      sequence,
      userSequence: [],
      currentStep: 0,
      showingSequence: true,
      gameOver: false,
      level: 1,
      currentShowingIndex: -1,
      isFlashing: false
    });

    showSequence(sequence);
  };

  // 기억력 게임 버튼 클릭
  const handleMemoryClick = (index: number) => {
    console.log('🧠 [기억력] 버튼 클릭:', index);
    console.log('🧠 [기억력] 현재 상태:', {
      showingSequence: memoryGame.showingSequence,
      gameOver: memoryGame.gameOver,
      userSequence: memoryGame.userSequence,
      expectedSequence: memoryGame.sequence
    });
    
    if (memoryGame.showingSequence || memoryGame.gameOver) {
      console.log('🧠 [기억력] 클릭 무시됨');
      return;
    }

    const newUserSequence = [...memoryGame.userSequence, index];
    const currentIndex = newUserSequence.length - 1;
    
    console.log('🧠 [기억력] 입력 체크:', {
      userInput: newUserSequence[currentIndex],
      expected: memoryGame.sequence[currentIndex],
      isCorrect: newUserSequence[currentIndex] === memoryGame.sequence[currentIndex]
    });
    
    // 현재 입력이 올바른지 확인
    if (newUserSequence[currentIndex] !== memoryGame.sequence[currentIndex]) {
      console.log('🧠 [기억력] 틀림! 게임 오버');
      setMemoryGame(prev => ({ ...prev, gameOver: true }));
      onScore('기억력', memoryGame.level * 10);
      return;
    }

    // 현재 레벨의 시퀀스를 모두 맞췄을 때
    if (newUserSequence.length === memoryGame.sequence.length) {
      const newLevel = memoryGame.level + 1;
      const newSequence = [...memoryGame.sequence, Math.floor(Math.random() * 4)];
      
      console.log('🧠 [기억력] 레벨 클리어!', {
        currentLevel: memoryGame.level,
        newLevel,
        newSequence
      });
      
      setTimeout(() => {
        setMemoryGame({
          sequence: newSequence,
          userSequence: [],
          currentStep: 0,
          showingSequence: true,
          gameOver: false,
          level: newLevel,
          currentShowingIndex: -1,
          isFlashing: false
        });
        
        showSequence(newSequence);
      }, 500);
    } else {
      console.log('🧠 [기억력] 정답! 다음 입력 대기');
      setMemoryGame(prev => ({ ...prev, userSequence: newUserSequence }));
    }
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('🧠 [기억력] 게임 재시작');
    startMemoryGame();
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>🧠 기억력 게임</Text>
      
      {/* 게임 상태 표시 */}
      <View style={styles.memoryGameStatus}>
        <View style={styles.memoryStatItem}>
          <Text style={styles.memoryStatLabel}>레벨</Text>
          <Text style={styles.memoryStatValue}>{memoryGame.level}</Text>
        </View>
        <View style={styles.memoryStatItem}>
          <Text style={styles.memoryStatLabel}>시퀀스 길이</Text>
          <Text style={styles.memoryStatValue}>{memoryGame.sequence.length}</Text>
        </View>
        <View style={styles.memoryStatItem}>
          <Text style={styles.memoryStatLabel}>진행률</Text>
          <Text style={styles.memoryStatValue}>
            {memoryGame.userSequence.length}/{memoryGame.sequence.length}
          </Text>
        </View>
      </View>

      {/* 게임 안내 */}
      <View style={styles.memoryInstruction}>
        <Text style={styles.instructionText}>
          {memoryGame.showingSequence ? 
            '⚡ 순서를 기억하세요!' : 
            memoryGame.gameOver ? 
              `🎯 게임 오버! 레벨 ${memoryGame.level}까지 도달!` :
              '🎮 순서대로 버튼을 눌러주세요'
          }
        </Text>
      </View>

      {/* 디버깅 정보 */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            시퀀스: [{memoryGame.sequence.join(', ')}]
          </Text>
          <Text style={styles.debugText}>
            사용자: [{memoryGame.userSequence.join(', ')}]
          </Text>
          <Text style={styles.debugText}>
            현재 깜빡임: {memoryGame.currentShowingIndex} | 표시중: {memoryGame.showingSequence ? 'Yes' : 'No'}
          </Text>
        </View>
      )}
      
      {/* 메모리 버튼 그리드 */}
      <View style={styles.memoryGrid}>
        {[0, 1, 2, 3].map((index) => {
          const isFlashing = memoryGame.currentShowingIndex === index;
          const isUserSelected = memoryGame.userSequence.includes(index) && !memoryGame.showingSequence;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.memoryButton,
                isFlashing && styles.memoryButtonFlashing,
                isUserSelected && styles.memoryButtonSelected,
              ]}
              onPress={() => handleMemoryClick(index)}
              disabled={memoryGame.showingSequence || memoryGame.gameOver}
            >
              <Text style={[
                styles.memoryButtonText,
                (isFlashing || isUserSelected) && styles.memoryButtonTextActive
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 진행 상황 표시 */}
      {!memoryGame.gameOver && !memoryGame.showingSequence && (
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(memoryGame.userSequence.length / memoryGame.sequence.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {memoryGame.userSequence.length} / {memoryGame.sequence.length}
          </Text>
        </View>
      )}

      {/* 게임 종료 시 결과 */}
      {memoryGame.gameOver && (
        <View style={styles.memoryGameResult}>
          <Text style={styles.memoryResultTitle}>🎯 최종 결과</Text>
          <Text style={styles.memoryFinalLevel}>도달 레벨: {memoryGame.level}</Text>
          <Text style={styles.memoryFinalScore}>
            획득 점수: {memoryGame.level * 10}점
          </Text>
          <Text style={styles.memorySequenceLength}>
            최대 시퀀스: {memoryGame.sequence.length}개
          </Text>
        </View>
      )}

      <View style={styles.gameButtons}>
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.buttonText}>
            {memoryGame.gameOver ? '다시 시작' : '새 게임'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.buttonText}>나가기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  gameScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 20,
  },
  memoryGameStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  memoryStatItem: {
    alignItems: 'center',
  },
  memoryStatLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  memoryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  memoryInstruction: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  instructionText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  debugText: {
    color: '#FFD700',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  memoryButton: {
    width: 90,
    height: 90,
    backgroundColor: '#333',
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryButtonFlashing: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  memoryButtonSelected: {
    backgroundColor: '#45B7D1',
    borderColor: '#45B7D1',
    borderWidth: 2,
  },
  memoryButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  memoryButtonTextActive: {
    color: 'white',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  progressBar: {
    width: 200,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  progressText: {
    fontSize: 16,
    color: '#FFD700',
    marginLeft: 10,
  },
  memoryGameResult: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    width: '100%',
    maxWidth: 300,
  },
  memoryResultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  memoryFinalLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 6,
  },
  memoryFinalScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 6,
  },
  memorySequenceLength: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 10,
  },
  gameButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exitButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MemoryGame;

