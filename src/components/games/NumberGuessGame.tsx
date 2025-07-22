import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseGameProps, NumberGameState } from '../../types/gameTypes';
import { gameStyles, gameColors } from '../../styles/gameStyles';
import { useGameState } from '../../hooks/useGameState';
import GameContainer from '../common/GameContainer';
import GameStats from '../common/GameStats';
import GameInstruction from '../common/GameInstruction';
import GameButtons from '../common/GameButtons';
import GameResultComponent from '../common/GameResult';

const NumberGuessGame: React.FC<BaseGameProps> = ({ onExit, onScore }) => {
  const initialState: NumberGameState = {
    target: Math.floor(Math.random() * 100) + 1,
    guess: '',
    attempts: 0,
    gameOver: false,
    message: '1부터 100 사이의 숫자를 입력하세요!'
  };

  const { gameState, updateGameState, resetGame } = useGameState({
    initialState,
    onGameEnd: (finalState) => {
      if (finalState.target === parseInt(finalState.guess)) {
        onScore('숫자 맞추기', Math.max(100 - finalState.attempts * 5, 10));
      }
    }
  });

  // 숫자 추측
  const makeGuess = () => {
    const guess = parseInt(gameState.guess);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      updateGameState({
        message: '1부터 100 사이의 숫자를 입력하세요!'
      });
      return;
    }

    const newAttempts = gameState.attempts + 1;
    let message = '';
    let gameOver = false;

    if (guess === gameState.target) {
      message = `🎉 정답! ${newAttempts}번 만에 맞췄습니다!`;
      gameOver = true;
    } else if (guess < gameState.target) {
      message = '⬆️ UP! 더 큰 숫자입니다.';
    } else {
      message = '⬇️ DOWN! 더 작은 숫자입니다.';
    }

    updateGameState({
      attempts: newAttempts,
      message,
      gameOver,
      guess: gameOver ? gameState.guess : ''
    });
  };

  // 숫자 입력 처리
  const handleNumberInput = (digit: string) => {
    if (gameState.guess.length >= 3) return;
    updateGameState({
      guess: gameState.guess + digit
    });
  };

  // 백스페이스
  const handleNumberBackspace = () => {
    updateGameState({
      guess: gameState.guess.slice(0, -1)
    });
  };

  // 입력 초기화
  const clearNumberInput = () => {
    updateGameState({ guess: '' });
  };

  // 게임 재시작
  const restartGame = () => {
    resetGame({
      target: Math.floor(Math.random() * 100) + 1,
      message: '1부터 100 사이의 숫자를 입력하세요!'
    });
  };

  // 게임 통계 데이터
  const stats = [
    { label: '시도 횟수', value: gameState.attempts },
    { label: '범위', value: '1 ~ 100' },
    { label: '상태', value: gameState.gameOver ? '완료' : '진행중' }
  ];

  // 게임 버튼 설정
  const gameButtons = [
    ...(gameState.gameOver ? [{
      text: '다시 시작',
      onPress: restartGame,
      style: 'primary' as const
    }] : []),
    {
      text: '나가기',
      onPress: onExit,
      style: 'secondary' as const
    }
  ];

  return (
    <GameContainer title="🔢 숫자 맞추기">
      <GameStats stats={stats} />
      
      <GameInstruction 
        text={gameState.message}
        gameColor={gameColors.numberGuess}
      />

      {!gameState.gameOver && (
        <>
          {/* 범위 표시 */}
          <View style={styles.rangeDisplay}>
            <Text style={styles.rangeText}>1 ~ 100</Text>
          </View>

          {/* 숫자 입력 디스플레이 */}
          <View style={gameStyles.inputDisplay}>
            <Text style={gameStyles.inputText}>
              {gameState.guess || '숫자를 입력하세요'}
            </Text>
          </View>

          {/* 숫자 패드 */}
          <View style={gameStyles.numberPad}>
            <View style={gameStyles.numberButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <TouchableOpacity
                  key={num}
                  style={gameStyles.numberButton}
                  onPress={() => handleNumberInput(num.toString())}
                >
                  <Text style={gameStyles.numberButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={gameStyles.numberButton}
                onPress={clearNumberInput}
              >
                <Text style={gameStyles.numberButtonText}>C</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={gameStyles.numberButton}
                onPress={() => handleNumberInput('0')}
              >
                <Text style={gameStyles.numberButtonText}>0</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={gameStyles.numberButton}
                onPress={handleNumberBackspace}
              >
                <Text style={gameStyles.numberButtonText}>⌫</Text>
              </TouchableOpacity>
            </View>

            {/* 추측 버튼 */}
            <TouchableOpacity
              style={[
                styles.guessButton,
                !gameState.guess && gameStyles.disabledButton
              ]}
              onPress={makeGuess}
              disabled={!gameState.guess}
            >
              <Text style={gameStyles.buttonText}>🎯 추측하기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 게임 종료 시 결과 표시 */}
      {gameState.gameOver && (
        <GameResultComponent
          result={{
            score: Math.max(100 - gameState.attempts * 5, 10),
            message: `${gameState.attempts}번 만에 맞췄습니다!`,
            isWin: true
          }}
          gameColor={gameColors.numberGuess}
          additionalInfo={[
            { label: '정답', value: gameState.target },
            { label: '총 시도', value: `${gameState.attempts}번` }
          ]}
        />
      )}

      <GameButtons buttons={gameButtons} />
    </GameContainer>
  );
};

const styles = {
  rangeDisplay: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center' as const,
  },
  rangeText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: '600' as const,
  },
  guessButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center' as const,
    minWidth: 200,
  },
};

export default NumberGuessGame; 