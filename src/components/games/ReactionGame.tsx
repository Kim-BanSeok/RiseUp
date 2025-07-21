import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

interface ReactionGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

interface ReactionGameState {
  waiting: boolean;
  started: boolean;
  startTime: number;
  reactionTime: number;
  gameOver: boolean;
}

const ReactionGame: React.FC<ReactionGameProps> = ({ onExit, onScore }) => {
  const [reactionGame, setReactionGame] = useState<ReactionGameState>({
    waiting: false,
    started: false,
    startTime: 0,
    reactionTime: 0,
    gameOver: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 반응속도 게임 시작
  const startReactionGame = () => {
    console.log('⚡ [반응속도] 게임 시작');
    setReactionGame({
      waiting: true,
      started: false,
      startTime: 0,
      reactionTime: 0,
      gameOver: false
    });

    // 랜덤 시간 후 시작
    const delay = Math.random() * 3000 + 1000; // 1~4초
    console.log('⚡ [반응속도] 대기 시간:', delay + 'ms');
    
    timeoutRef.current = setTimeout(() => {
      console.log('⚡ [반응속도] 시작 신호!');
      setReactionGame(prev => ({
        ...prev,
        waiting: false,
        started: true,
        startTime: Date.now()
      }));
    }, delay);
  };

  // 반응속도 측정
  const handleReactionClick = () => {
    console.log('⚡ [반응속도] 클릭 감지');
    
    if (reactionGame.waiting) {
      console.log('⚡ [반응속도] 너무 빠른 클릭');
      Alert.alert('너무 빨라요!', '초록색이 나타날 때까지 기다리세요.');
      return;
    }

    if (reactionGame.started) {
      const reactionTime = Date.now() - reactionGame.startTime;
      console.log('⚡ [반응속도] 반응 시간:', reactionTime + 'ms');
      
      setReactionGame(prev => ({
        ...prev,
        reactionTime,
        gameOver: true,
        started: false
      }));

      const score = Math.max(1000 - reactionTime, 100);
      console.log('⚡ [반응속도] 획득 점수:', score);
      onScore('반응속도', Math.floor(score));
    }
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('⚡ [반응속도] 게임 재시작');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    startReactionGame();
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>⚡ 반응속도 테스트</Text>
      
      <TouchableOpacity
        style={[
          styles.reactionArea,
          reactionGame.waiting && styles.reactionWaiting,
          reactionGame.started && styles.reactionReady
        ]}
        onPress={handleReactionClick}
      >
        <Text style={styles.reactionText}>
          {reactionGame.waiting ? '잠깐...' : 
           reactionGame.started ? '지금 터치!' :
           reactionGame.gameOver ? `${reactionGame.reactionTime}ms` : '터치하여 시작'}
        </Text>
      </TouchableOpacity>

      {reactionGame.gameOver && (
        <View style={styles.reactionResult}>
          <Text style={styles.resultText}>
            반응시간: {reactionGame.reactionTime}ms
          </Text>
          <Text style={styles.resultGrade}>
            {reactionGame.reactionTime < 250 ? '🔥 매우 빠름!' :
             reactionGame.reactionTime < 350 ? '😎 빠름' :
             reactionGame.reactionTime < 500 ? '👍 보통' : '🐌 느림'}
          </Text>
        </View>
      )}

      <View style={styles.gameButtons}>
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.buttonText}>
            {reactionGame.gameOver ? '다시 시작' : '새 게임'}
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
  reactionArea: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  reactionWaiting: {
    backgroundColor: '#FF6B6B',
  },
  reactionReady: {
    backgroundColor: '#4CAF50',
  },
  reactionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  reactionResult: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultText: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 10,
  },
  resultGrade: {
    fontSize: 16,
    color: '#4CAF50',
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

export default ReactionGame; 