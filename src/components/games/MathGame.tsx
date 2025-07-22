import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { BaseGameProps } from '../../types/gameTypes';
import { gameStyles, gameColors } from '../../styles/gameStyles';
import { useGameState } from '../../hooks/useGameState';
import { useGameTimer } from '../../hooks/useGameTimer';
import GameContainer from '../common/GameContainer';
import GameStats from '../common/GameStats';
import GameInstruction from '../common/GameInstruction';
import GameButtons from '../common/GameButtons';
import GameResultComponent from '../common/GameResult';

interface MathProblem {
  num1: number;
  num2: number;
  operator: string;
  answer: number;
  display: string;
}

interface MathGameState {
  problem: MathProblem | null;
  userAnswer: string;
  score: number;
  streak: number;
  gameOver: boolean;
  difficulty: number;
  totalProblems: number;
  correctAnswers: number;
  timeLeft: number;
  attempts: number;
}

const MathGame: React.FC<BaseGameProps> = ({ onExit, onScore }) => {
  const initialState: MathGameState = {
    problem: null,
    userAnswer: '',
    score: 0,
    streak: 0,
    gameOver: false,
    difficulty: 1,
    totalProblems: 0,
    correctAnswers: 0,
    timeLeft: 10,
    attempts: 0
  };

  const { gameState, updateGameState, resetGame } = useGameState({
    initialState,
    onGameEnd: (finalState) => {
      if (finalState.score > 0) {
        onScore('암산', finalState.score);
      }
    }
  });

  const { timeLeft, start: startTimer, pause: pauseTimer, reset: resetTimer } = useGameTimer({
    initialTime: 10,
    onTimeUp: () => {
      console.log('⏰ [암산] 시간 종료');
      updateGameState({ 
        gameOver: true 
      });
      onScore('암산', gameState.score);
    },
    autoStart: false
  });

  // 수학 문제 생성
  const generateMathProblem = (difficulty: number): MathProblem => {
    console.log('➕ [암산] 문제 생성, 난이도:', difficulty);
    const operators = ['+', '-', '×', '÷'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let num1: number, num2: number, answer: number;
    
    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * (difficulty * 10)) + 1;
        num2 = Math.floor(Math.random() * (difficulty * 10)) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * (difficulty * 10)) + difficulty * 5;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * (difficulty * 3)) + 1;
        num2 = Math.floor(Math.random() * (difficulty * 3)) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        // 나누어 떨어지는 문제만 생성
        num2 = Math.floor(Math.random() * (difficulty * 2)) + 1;
        answer = Math.floor(Math.random() * (difficulty * 5)) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    const problem = {
      num1,
      num2,
      operator,
      answer,
      display: `${num1} ${operator} ${num2} = ?`
    };
    
    console.log('➕ [암산] 생성된 문제:', problem);
    return problem;
  };

  // 암산 게임 시작
  const startMathGame = () => {
    console.log('➕ [암산] 게임 시작');
    const problem = generateMathProblem(1);
    updateGameState({
      problem,
      userAnswer: '',
      score: 0,
      streak: 0,
      gameOver: false,
      difficulty: 1,
      totalProblems: 0,
      correctAnswers: 0,
      attempts: gameState.attempts + 1
    });
    resetTimer();
    startTimer();
  };

  // 암산 답안 체크
  const checkMathAnswer = () => {
    const userAnswer = parseInt(gameState.userAnswer);
    console.log('➕ [암산] 답안 체크:', {
      userAnswer,
      correctAnswer: gameState.problem?.answer,
      isCorrect: userAnswer === gameState.problem?.answer
    });
    
    if (isNaN(userAnswer) || !gameState.problem) return;

    const isCorrect = userAnswer === gameState.problem.answer;
    const newTotalProblems = gameState.totalProblems + 1;
    const newCorrectAnswers = gameState.correctAnswers + (isCorrect ? 1 : 0);
    
    if (isCorrect) {
      const newStreak = gameState.streak + 1;
      const baseScore = 10;
      const streakBonus = Math.floor(newStreak / 3) * 5; // 3연속마다 5점 보너스
      const timeBonus = Math.max(timeLeft - 5, 0); // 빠르게 풀면 시간 보너스
      const difficultyBonus = gameState.difficulty * 2;
      const totalScore = baseScore + streakBonus + timeBonus + difficultyBonus;
      
      const newScore = gameState.score + totalScore;
      const newDifficulty = Math.min(Math.floor(newScore / 100) + 1, 5); // 100점마다 난이도 증가
      const newProblem = generateMathProblem(newDifficulty);
      
      console.log('➕ [암산] 정답!', {
        streak: newStreak,
        baseScore,
        streakBonus,
        timeBonus,
        difficultyBonus,
        totalScore,
        newScore,
        newDifficulty
      });
      
      updateGameState({
        problem: newProblem,
        userAnswer: '',
        score: newScore,
        streak: newStreak,
        difficulty: newDifficulty,
        totalProblems: newTotalProblems,
        correctAnswers: newCorrectAnswers
      });
      
      // 시간 리셋
      resetTimer();
      startTimer();
    } else {
      console.log('➕ [암산] 틀림! 연속 점수 리셋');
      // 틀렸을 때 - 연속 점수는 리셋되지만 게임은 계속
      const newProblem = generateMathProblem(gameState.difficulty);
      updateGameState({
        problem: newProblem,
        userAnswer: '',
        streak: 0,
        totalProblems: newTotalProblems,
        correctAnswers: newCorrectAnswers
      });
      
      // 시간 리셋
      resetTimer();
      startTimer();
    }
  };

  // 숫자 입력 처리
  const handleNumberInput = (digit: string) => {
    if (gameState.userAnswer.length >= 4) return; // 최대 4자리
    updateGameState({
      userAnswer: gameState.userAnswer + digit
    });
  };

  // 백스페이스
  const handleNumberBackspace = () => {
    updateGameState({
      userAnswer: gameState.userAnswer.slice(0, -1)
    });
  };

  // 입력 초기화
  const clearNumberInput = () => {
    updateGameState({ userAnswer: '' });
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('➕ [암산] 게임 재시작');
    pauseTimer();
    resetGame({
      attempts: gameState.attempts
    });
  };

  // 새 게임 시작
  const startNewGame = () => {
    pauseTimer();
    startMathGame();
  };

  // 게임 통계 데이터
  const getGameStats = () => {
    const accuracy = gameState.totalProblems > 0 ? 
      Math.round((gameState.correctAnswers / gameState.totalProblems) * 100) : 0;
    
    return [
      { label: '점수', value: gameState.score },
      { label: '연속', value: gameState.streak },
      { label: '시간', value: `${timeLeft}s` },
      { label: '난이도', value: gameState.difficulty },
      { label: '정답률', value: `${accuracy}%` }
    ];
  };

  // 게임 인스트럭션 텍스트
  const getInstructionText = () => {
    if (gameState.gameOver) {
      const accuracy = gameState.totalProblems > 0 ? 
        Math.round((gameState.correctAnswers / gameState.totalProblems) * 100) : 0;
      return `🎯 게임 종료! 정답률: ${accuracy}%`;
    } else if (!gameState.problem) {
      return '➕ 암산 게임을 시작하세요!';
    } else {
      return `⏰ ${timeLeft}초 남음! 빠르게 계산하세요!`;
    }
  };

  // 게임 버튼 설정
  const getGameButtons = () => {
    const buttons = [];
    
    if (gameState.gameOver) {
      buttons.push({
        text: '다시 시작',
        onPress: startNewGame,
        style: 'primary' as const
      });
      buttons.push({
        text: '전체 재시작',
        onPress: restartGame,
        style: 'secondary' as const
      });
    } else if (!gameState.problem) {
      buttons.push({
        text: '시작하기',
        onPress: startNewGame,
        style: 'primary' as const
      });
    }
    
    buttons.push({
      text: '나가기',
      onPress: onExit,
      style: 'secondary' as const
    });
    
    return buttons;
  };

  return (
    <GameContainer title="➕ 암산 게임">
      <GameStats stats={getGameStats()} />
      
      <GameInstruction 
        text={getInstructionText()} 
        gameColor={gameColors.math} 
      />

      {/* 문제 표시 */}
      {gameState.problem && !gameState.gameOver && (
        <View style={gameStyles.inputDisplay}>
          <Text style={[gameStyles.inputText, { fontSize: 24, color: gameColors.math }]}>
            {gameState.problem.display}
          </Text>
        </View>
      )}

      {/* 답안 입력 */}
      {!gameState.gameOver && gameState.problem && (
        <>
          <View style={gameStyles.inputDisplay}>
            <Text style={gameStyles.inputText}>
              {gameState.userAnswer || '답을 입력하세요'}
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
                onPress={handleNumberBackspace}
              >
                <Text style={gameStyles.numberButtonText}>⌫</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={gameStyles.numberButton}
                onPress={() => handleNumberInput('0')}
              >
                <Text style={gameStyles.numberButtonText}>0</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[gameStyles.numberButton, { backgroundColor: gameColors.math }]}
                onPress={checkMathAnswer}
                disabled={!gameState.userAnswer}
              >
                <Text style={gameStyles.numberButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 액션 버튼들 */}
          <View style={gameStyles.gameButtons}>
            <TouchableOpacity
              style={gameStyles.secondaryButton}
              onPress={clearNumberInput}
            >
              <Text style={gameStyles.buttonText}>지우기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {gameState.gameOver && (
        <GameResultComponent
          result={{
            score: gameState.score,
            message: `${gameState.totalProblems}문제 중 ${gameState.correctAnswers}문제 정답!`,
            isWin: gameState.score >= 100
          }}
          gameColor={gameColors.math}
          additionalInfo={[
            { label: '최대 연속', value: gameState.streak.toString() },
            { label: '최고 난이도', value: gameState.difficulty.toString() },
            { label: '정답률', value: `${Math.round((gameState.correctAnswers / Math.max(gameState.totalProblems, 1)) * 100)}%` }
          ]}
        />
      )}

      <GameButtons buttons={getGameButtons()} />
    </GameContainer>
  );
};

export default MathGame; 