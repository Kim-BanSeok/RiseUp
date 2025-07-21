import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface NumberGuessGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

interface NumberGameState {
  target: number;
  guess: string;
  attempts: number;
  gameOver: boolean;
  message: string;
}

const NumberGuessGame: React.FC<NumberGuessGameProps> = ({ onExit, onScore }) => {
  const [numberGame, setNumberGame] = useState<NumberGameState>({
    target: Math.floor(Math.random() * 100) + 1,
    guess: '',
    attempts: 0,
    gameOver: false,
    message: '1부터 100 사이의 숫자를 입력하세요!'
  });

  // 숫자 추측
  const makeGuess = () => {
    const guess = parseInt(numberGame.guess);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      setNumberGame(prev => ({
        ...prev,
        message: '1부터 100 사이의 숫자를 입력하세요!'
      }));
      return;
    }

    const newAttempts = numberGame.attempts + 1;
    let message = '';
    let gameOver = false;

    if (guess === numberGame.target) {
      message = `🎉 정답! ${newAttempts}번 만에 맞췄습니다!`;
      gameOver = true;
      onScore('숫자 맞추기', Math.max(100 - newAttempts * 5, 10));
    } else if (guess < numberGame.target) {
      message = '⬆️ UP! 더 큰 숫자입니다.';
    } else {
      message = '⬇️ DOWN! 더 작은 숫자입니다.';
    }

    setNumberGame(prev => ({
      ...prev,
      attempts: newAttempts,
      message,
      gameOver,
      guess: gameOver ? prev.guess : ''
    }));
  };

  // 숫자 입력 처리
  const handleNumberInput = (digit: string) => {
    if (numberGame.guess.length >= 3) return;
    setNumberGame(prev => ({
      ...prev,
      guess: prev.guess + digit
    }));
  };

  // 백스페이스
  const handleNumberBackspace = () => {
    setNumberGame(prev => ({
      ...prev,
      guess: prev.guess.slice(0, -1)
    }));
  };

  // 입력 초기화
  const clearNumberInput = () => {
    setNumberGame(prev => ({
      ...prev,
      guess: ''
    }));
  };

  // 게임 재시작
  const restartGame = () => {
    setNumberGame({
      target: Math.floor(Math.random() * 100) + 1,
      guess: '',
      attempts: 0,
      gameOver: false,
      message: '1부터 100 사이의 숫자를 입력하세요!'
    });
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>🔢 숫자 맞추기</Text>
      <Text style={styles.gameMessage}>{numberGame.message}</Text>
      <Text style={styles.attemptsText}>시도 횟수: {numberGame.attempts}</Text>
      
      {!numberGame.gameOver && (
        <>
          {/* 범위 표시 */}
          <View style={styles.rangeDisplay}>
            <Text style={styles.rangeText}>1 ~ 100</Text>
          </View>

          {/* 숫자 입력 디스플레이 */}
          <View style={styles.numberGuessDisplay}>
            <Text style={styles.guessText}>
              {numberGame.guess || '숫자를 입력하세요'}
            </Text>
          </View>

          {/* 숫자 패드 */}
          <View style={styles.numberPad}>
            <View style={styles.numberButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberInput(num.toString())}
                >
                  <Text style={styles.numberButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.numberButton}
                onPress={clearNumberInput}
              >
                <Text style={styles.numberButtonText}>C</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handleNumberInput('0')}
              >
                <Text style={styles.numberButtonText}>0</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.numberButton}
                onPress={handleNumberBackspace}
              >
                <Text style={styles.numberButtonText}>⌫</Text>
              </TouchableOpacity>
            </View>

            {/* 추측 버튼 */}
            <TouchableOpacity
              style={[styles.guessButton, !numberGame.guess && styles.guessButtonDisabled]}
              onPress={makeGuess}
              disabled={!numberGame.guess}
            >
              <Text style={styles.guessButtonText}>🎯 추측하기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 게임 종료 시 결과 표시 */}
      {numberGame.gameOver && (
        <View style={styles.numberGameResult}>
          <Text style={styles.targetNumber}>정답: {numberGame.target}</Text>
          <Text style={styles.finalAttempts}>총 시도: {numberGame.attempts}번</Text>
          <Text style={styles.scoreEarned}>
            획득 점수: {Math.max(100 - numberGame.attempts * 5, 10)}점
          </Text>
        </View>
      )}

      <View style={styles.gameButtons}>
        {numberGame.gameOver && (
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.buttonText}>다시 시작</Text>
          </TouchableOpacity>
        )}
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
  gameMessage: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 20,
  },
  attemptsText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 20,
  },
  rangeDisplay: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  numberGuessDisplay: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  guessText: {
    fontSize: 28,
    color: '#FF6B6B',
    fontWeight: 'bold',
    textAlign: 'center',
    minHeight: 35,
  },
  numberPad: {
    alignItems: 'center',
    marginBottom: 20,
  },
  numberButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'space-between',
  },
  numberButton: {
    width: 70,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  guessButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  guessButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  guessButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberGameResult: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  targetNumber: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalAttempts: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  scoreEarned: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
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

export default NumberGuessGame; 