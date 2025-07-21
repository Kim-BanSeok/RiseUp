import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface MathGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

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
  timeLeft: number;
  gameOver: boolean;
  difficulty: number;
  totalProblems: number;
  correctAnswers: number;
}

const MathGame: React.FC<MathGameProps> = ({ onExit, onScore }) => {
  const [mathGame, setMathGame] = useState<MathGameState>({
    problem: null,
    userAnswer: '',
    score: 0,
    streak: 0,
    timeLeft: 10,
    gameOver: false,
    difficulty: 1,
    totalProblems: 0,
    correctAnswers: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
    setMathGame({
      problem,
      userAnswer: '',
      score: 0,
      streak: 0,
      timeLeft: 10,
      gameOver: false,
      difficulty: 1,
      totalProblems: 0,
      correctAnswers: 0
    });
    startMathTimer();
  };

  // 암산 게임 타이머 시작
  const startMathTimer = () => {
    console.log('⏰ [암산] 타이머 시작');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setMathGame(prev => {
        if (prev.timeLeft <= 1) {
          console.log('⏰ [암산] 시간 종료');
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          onScore('암산', prev.score);
          return { ...prev, timeLeft: 0, gameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  // 암산 답안 체크
  const checkMathAnswer = () => {
    const userAnswer = parseInt(mathGame.userAnswer);
    console.log('➕ [암산] 답안 체크:', {
      userAnswer,
      correctAnswer: mathGame.problem?.answer,
      isCorrect: userAnswer === mathGame.problem?.answer
    });
    
    if (isNaN(userAnswer)) return;

    const isCorrect = userAnswer === mathGame.problem?.answer;
    const newTotalProblems = mathGame.totalProblems + 1;
    const newCorrectAnswers = mathGame.correctAnswers + (isCorrect ? 1 : 0);
    
    if (isCorrect) {
      const newStreak = mathGame.streak + 1;
      const baseScore = 10;
      const streakBonus = Math.floor(newStreak / 3) * 5; // 3연속마다 5점 보너스
      const timeBonus = Math.max(mathGame.timeLeft - 5, 0); // 빠르게 풀면 시간 보너스
      const difficultyBonus = mathGame.difficulty * 2;
      const totalScore = baseScore + streakBonus + timeBonus + difficultyBonus;
      
      const newScore = mathGame.score + totalScore;
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
      
      setMathGame(prev => ({
        ...prev,
        problem: newProblem,
        userAnswer: '',
        score: newScore,
        streak: newStreak,
        timeLeft: Math.max(10 - Math.floor(newDifficulty / 2), 5), // 난이도에 따라 시간 단축
        difficulty: newDifficulty,
        totalProblems: newTotalProblems,
        correctAnswers: newCorrectAnswers
      }));
    } else {
      console.log('➕ [암산] 틀림! 연속 점수 리셋');
      // 틀렸을 때 - 연속 점수는 리셋되지만 게임은 계속
      const newProblem = generateMathProblem(mathGame.difficulty);
      setMathGame(prev => ({
        ...prev,
        problem: newProblem,
        userAnswer: '',
        streak: 0,
        timeLeft: Math.max(10 - Math.floor(prev.difficulty / 2), 5),
        totalProblems: newTotalProblems,
        correctAnswers: newCorrectAnswers
      }));
    }
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('➕ [암산] 게임 재시작');
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    startMathGame();
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>➕ 암산 게임</Text>
      
      {/* 게임 상태 정보 */}
      <View style={styles.mathStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>점수</Text>
          <Text style={styles.statValue}>{mathGame.score}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>연속</Text>
          <Text style={styles.statValue}>{mathGame.streak}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>시간</Text>
          <Text style={[styles.statValue, styles.timerText]}>{mathGame.timeLeft}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>난이도</Text>
          <Text style={styles.statValue}>{mathGame.difficulty}</Text>
        </View>
      </View>

      {!mathGame.gameOver ? (
        <>
          {/* 수학 문제 */}
          <View style={styles.mathProblem}>
            <Text style={styles.problemText}>
              {mathGame.problem?.display}
            </Text>
          </View>

          {/* 숫자 입력 패드 */}
          <View style={styles.numberPad}>
            {/* 답안 표시 */}
            <Text style={styles.answerDisplay}>
              {mathGame.userAnswer || '답을 입력하세요'}
            </Text>
            
            {/* 숫자 버튼들 */}
            <View style={styles.numberButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => setMathGame(prev => ({
                    ...prev,
                    userAnswer: prev.userAnswer + num.toString()
                  }))}
                >
                  <Text style={styles.numberButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setMathGame(prev => ({
                  ...prev,
                  userAnswer: prev.userAnswer.slice(0, -1)
                }))}
              >
                <Text style={styles.numberButtonText}>⌫</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setMathGame(prev => ({
                  ...prev,
                  userAnswer: prev.userAnswer + '0'
                }))}
              >
                <Text style={styles.numberButtonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.numberButton, styles.submitButton]}
                onPress={checkMathAnswer}
                disabled={!mathGame.userAnswer}
              >
                <Text style={styles.numberButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.mathGameOver}>
          <Text style={styles.gameOverTitle}>게임 종료!</Text>
          <Text style={styles.finalScore}>최종 점수: {mathGame.score}점</Text>
          <Text style={styles.accuracy}>
            정확도: {mathGame.totalProblems > 0 ? 
              Math.round((mathGame.correctAnswers / mathGame.totalProblems) * 100) : 0}%
          </Text>
          <Text style={styles.problemsSolved}>
            해결한 문제: {mathGame.correctAnswers} / {mathGame.totalProblems}
          </Text>
        </View>
      )}

      <View style={styles.gameButtons}>
        {mathGame.gameOver && (
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
  mathStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#96CEB4',
  },
  timerText: {
    color: '#FF6B6B',
  },
  mathProblem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 30,
    marginBottom: 30,
    alignItems: 'center',
  },
  problemText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e0e0e0',
    textAlign: 'center',
  },
  numberPad: {
    alignItems: 'center',
    marginBottom: 20,
  },
  answerDisplay: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    fontSize: 24,
    color: '#96CEB4',
    textAlign: 'center',
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#96CEB4',
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
  submitButton: {
    backgroundColor: '#96CEB4',
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  mathGameOver: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#96CEB4',
    marginBottom: 10,
  },
  accuracy: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  problemsSolved: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 20,
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

export default MathGame; 