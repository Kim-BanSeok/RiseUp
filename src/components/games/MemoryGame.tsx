import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseGameProps, MemoryGameState } from '../../types/gameTypes';
import { gameStyles, gameColors } from '../../styles/gameStyles';
import { useGameState } from '../../hooks/useGameState';
import GameContainer from '../common/GameContainer';
import GameStats from '../common/GameStats';
import GameInstruction from '../common/GameInstruction';
import GameButtons from '../common/GameButtons';
import GameResultComponent from '../common/GameResult';

const MemoryGame: React.FC<BaseGameProps> = React.memo(({ onExit, onScore }) => {
  const initialState: MemoryGameState = {
    sequence: [],
    userSequence: [],
    currentStep: 0,
    showingSequence: false,
    gameOver: false,
    level: 1,
    currentShowingIndex: -1,
    isFlashing: false,
    score: 0,
    attempts: 0
  };

  const { gameState, updateGameState, resetGame } = useGameState({
    initialState,
    onGameEnd: useCallback((finalState: MemoryGameState) => {
      if ((finalState.score ?? 0) > 0) {
        onScore('기억력', finalState.score ?? 0);
      }
    }, [onScore])
  });

  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, []);

  // 시퀀스를 순차적으로 보여주는 함수
  const showSequence = useCallback((sequence: number[]) => {
    console.log('🧠 [기억력] 시퀀스 표시 시작:', sequence);
    updateGameState({ 
      showingSequence: true, 
      currentShowingIndex: -1,
      isFlashing: false 
    });
    
    let currentIndex = 0;
    
    const showNextInSequence = () => {
      if (currentIndex >= sequence.length) {
        console.log('🧠 [기억력] 시퀀스 표시 완료');
        sequenceTimeoutRef.current = setTimeout(() => {
          updateGameState({ 
            showingSequence: false,
            currentShowingIndex: -1,
            isFlashing: false
          });
        }, 500);
        return;
      }
      
      const buttonIndex = sequence[currentIndex];
      console.log('🧠 [기억력] 버튼 표시:', buttonIndex);
      
      updateGameState({ 
        currentShowingIndex: buttonIndex,
        isFlashing: true 
      });
      
      sequenceTimeoutRef.current = setTimeout(() => {
        updateGameState({ 
          currentShowingIndex: -1,
          isFlashing: false 
        });
        
        sequenceTimeoutRef.current = setTimeout(() => {
          currentIndex++;
          showNextInSequence();
        }, 400);
      }, 800);
    };
    
    sequenceTimeoutRef.current = setTimeout(() => {
      showNextInSequence();
    }, 500);
  }, [updateGameState]);

  // 기억력 게임 시작
  const startMemoryGame = useCallback(() => {
    console.log('🧠 [기억력] 게임 시작');
    const sequence = [Math.floor(Math.random() * 4)];
    console.log('🧠 [기억력] 초기 시퀀스:', sequence);
    
    updateGameState({
      sequence,
      userSequence: [],
      currentStep: 0,
      showingSequence: true,
      gameOver: false,
      level: 1,
      currentShowingIndex: -1,
      isFlashing: false,
      score: 0,
      attempts: gameState.attempts + 1
    });

    showSequence(sequence);
  }, [updateGameState, gameState.attempts, showSequence]);

  // 사용자 입력 처리
  const handleButtonPress = useCallback((buttonIndex: number) => {
    if (gameState.showingSequence || gameState.gameOver) return;

    console.log('🧠 [기억력] 버튼 클릭:', buttonIndex);
    console.log('🧠 [기억력] 현재 스텝:', gameState.currentStep);
    
    const newUserSequence = [...gameState.userSequence, buttonIndex];
    const isCorrect = buttonIndex === gameState.sequence[gameState.currentStep];
    
    console.log('🧠 [기억력] 정답 여부:', isCorrect);
    
    if (!isCorrect) {
      // 틀렸을 때
      console.log('🧠 [기억력] 게임 오버');
      updateGameState({
        gameOver: true,
        userSequence: newUserSequence
      });
             onScore('기억력', gameState.score ?? 0);
      return;
    }
    
    // 맞았을 때
    if (gameState.currentStep === gameState.sequence.length - 1) {
      // 현재 레벨 완성
      const newLevel = gameState.level + 1;
      const newScore = (gameState.score ?? 0) + gameState.level * 10;
      const newSequence = [...gameState.sequence, Math.floor(Math.random() * 4)];
      
      console.log('🧠 [기억력] 레벨 클리어! 새 레벨:', newLevel);
      console.log('🧠 [기억력] 새 시퀀스:', newSequence);
      
      updateGameState({
        sequence: newSequence,
        userSequence: [],
        currentStep: 0,
        level: newLevel,
        score: newScore,
        showingSequence: true,
        currentShowingIndex: -1,
        isFlashing: false
      });
      
      setTimeout(() => {
        showSequence(newSequence);
      }, 1000);
    } else {
      // 다음 단계로
      updateGameState({
        userSequence: newUserSequence,
        currentStep: gameState.currentStep + 1
      });
    }
  }, [gameState, updateGameState, onScore, showSequence]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    resetGame({
      attempts: gameState.attempts
    });
    setTimeout(() => {
      startMemoryGame();
    }, 100);
  }, [resetGame, gameState.attempts, startMemoryGame]);

  // 게임 통계 생성 (메모이제이션)
     const gameStats = React.useMemo(() => [
    { label: '레벨', value: gameState.level },
    { label: '점수', value: gameState.score ?? 0 },
    { label: '시퀀스 길이', value: gameState.sequence.length },
    { label: '진행', value: gameState.gameOver ? '종료' : gameState.showingSequence ? '표시중' : '입력중' },
    { label: '도전', value: gameState.attempts }
  ], [gameState.level, gameState.score, gameState.sequence.length, gameState.gameOver, gameState.showingSequence, gameState.attempts]);

  // 게임 버튼 생성 (메모이제이션)
  const gameButtons = React.useMemo(() => {
    if (!gameState.gameOver) {
      return [
        { 
          text: '🎯 새 게임', 
          style: 'primary' as const, 
          onPress: restartGame 
        },
        { 
          text: '← 나가기', 
          style: 'secondary' as const, 
          onPress: onExit 
        }
      ];
    } else {
      return [
        { 
          text: '🔄 다시하기', 
          style: 'primary' as const, 
          onPress: restartGame 
        },
        { 
          text: '← 나가기', 
          style: 'secondary' as const, 
          onPress: onExit 
        }
      ];
    }
  }, [gameState.gameOver, restartGame, onExit]);

  // 지시사항 텍스트 생성 (메모이제이션)
  const instructionText = React.useMemo(() => {
    if (!gameState.sequence.length) {
      return '🎯 새 게임을 시작하세요!';
    } else if (gameState.showingSequence) {
      return '👀 시퀀스를 기억하세요!';
    } else if (gameState.gameOver) {
      return `🎮 게임 종료! 레벨 ${gameState.level}까지 성공!`;
    } else {
      return '🧠 순서대로 눌러보세요!';
    }
  }, [gameState.sequence.length, gameState.showingSequence, gameState.gameOver, gameState.level]);

  return (
    <GameContainer title="🧠 기억력 테스트">
      <GameStats stats={gameStats} />
      
      <GameInstruction 
        text={instructionText}
        gameColor={gameColors.memory} 
      />

      {/* 4x1 버튼 그리드 */}
      <View style={gameStyles.gridContainer}>
        {[0, 1, 2, 3].map((buttonIndex) => (
          <TouchableOpacity
            key={buttonIndex}
            style={[
              gameStyles.gameChoiceButtons,
              { 
                backgroundColor: gameState.currentShowingIndex === buttonIndex ? 
                  gameColors.memory : '#2D2D2D',
                width: 70,
                height: 70,
                margin: 8
              }
            ]}
            onPress={() => handleButtonPress(buttonIndex)}
            disabled={gameState.showingSequence || gameState.gameOver}
          >
            <Text style={[gameStyles.buttonText, { fontSize: 24 }]}>
              {buttonIndex + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {gameState.gameOver && (
        <GameResultComponent
          result={{
            score: gameState.score ?? 0,
            message: `레벨 ${gameState.level}까지 성공!`,
            isWin: gameState.level >= 5
          }}
          gameColor={gameColors.memory}
          additionalInfo={[
            { label: '최종 레벨', value: gameState.level.toString() },
            { label: '시퀀스 길이', value: gameState.sequence.length.toString() }
          ]}
        />
      )}

      <GameButtons buttons={gameButtons} />
    </GameContainer>
  );
});

MemoryGame.displayName = 'MemoryGame';

export default MemoryGame;

