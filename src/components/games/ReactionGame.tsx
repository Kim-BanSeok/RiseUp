import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseGameProps, ReactionGameState } from '../../types/gameTypes';
import { gameStyles, gameColors } from '../../styles/gameStyles';
import { useGameState } from '../../hooks/useGameState';
import GameContainer from '../common/GameContainer';
import GameStats from '../common/GameStats';
import GameInstruction from '../common/GameInstruction';
import GameButtons from '../common/GameButtons';
import GameResultComponent from '../common/GameResult';
import CustomAlert from '../CustomAlert';

const ReactionGame: React.FC<BaseGameProps> = React.memo(({ onExit, onScore }) => {
  const initialState: ReactionGameState = {
    waiting: false,
    started: false,
    startTime: 0,
    reactionTime: 0,
    gameOver: false,
    bestTime: 0,
    attempts: 0
  };

  const { gameState, updateGameState, resetGame } = useGameState({
    initialState,
    onGameEnd: useCallback((finalState: ReactionGameState) => {
      if (finalState.reactionTime > 0) {
        const score = Math.max(1000 - finalState.reactionTime, 100);
        onScore('반응속도', Math.floor(score));
      }
    }, [onScore])
  });

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showCustomAlert = useCallback((
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) {
            button.onPress();
          }
        }
      }))
    });
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 반응속도 게임 시작
  const startReactionGame = useCallback(() => {
    console.log('⚡ [반응속도] 게임 시작');
    updateGameState({
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
      updateGameState({
        waiting: false,
        started: true,
        startTime: Date.now()
      });
    }, delay);
  }, [updateGameState]);

  // 반응속도 측정
  const handleReactionClick = useCallback(() => {
    console.log('⚡ [반응속도] 클릭 감지');
    
    if (gameState.waiting) {
      console.log('⚡ [반응속도] 너무 빠른 클릭');
      showCustomAlert('너무 빨라요!', '초록색이 나타날 때까지 기다리세요.', [
        {
          text: '확인',
          style: 'default',
          onPress: () => {}
        }
      ]);
      return;
    }

    if (gameState.started) {
      const reactionTime = Date.now() - gameState.startTime;
      console.log('⚡ [반응속도] 반응 시간:', reactionTime + 'ms');
      
      const newAttempts = gameState.attempts + 1;
      const newBestTime = gameState.bestTime === 0 ? reactionTime : Math.min(gameState.bestTime, reactionTime);
      
      updateGameState({
        reactionTime,
        gameOver: true,
        started: false,
        waiting: false,
        bestTime: newBestTime,
        attempts: newAttempts
      });

      const score = Math.max(1000 - reactionTime, 100);
      console.log('⚡ [반응속도] 획득 점수:', score);
      onScore('반응속도', Math.floor(score));
    }
  }, [gameState.waiting, gameState.started, gameState.startTime, gameState.attempts, gameState.bestTime, updateGameState, onScore, showCustomAlert]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    resetGame({
      attempts: gameState.attempts,
      bestTime: gameState.bestTime
    });
    setTimeout(() => {
      startReactionGame();
    }, 100);
  }, [resetGame, gameState.attempts, gameState.bestTime, startReactionGame]);

  // 게임 통계 (메모이제이션)
  const gameStats = React.useMemo(() => [
    { label: '반응시간', value: gameState.reactionTime > 0 ? `${gameState.reactionTime}ms` : '-' },
    { label: '최고기록', value: gameState.bestTime > 0 ? `${gameState.bestTime}ms` : '-' },
    { label: '시도횟수', value: gameState.attempts },
    { label: '상태', value: gameState.gameOver ? '완료' : gameState.waiting ? '대기중' : gameState.started ? '반응!' : '준비' }
  ], [gameState.reactionTime, gameState.bestTime, gameState.attempts, gameState.gameOver, gameState.waiting, gameState.started]);

  // 게임 버튼들 (메모이제이션)
  const gameButtons = React.useMemo(() => {
    if (!gameState.gameOver && !gameState.waiting && !gameState.started) {
      return [
        { 
          text: '🎯 시작하기', 
          style: 'primary' as const, 
          onPress: startReactionGame 
        },
        { 
          text: '← 나가기', 
          style: 'secondary' as const, 
          onPress: onExit 
        }
      ];
    } else if (gameState.gameOver) {
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
    } else {
      return [
        { 
          text: '← 나가기', 
          style: 'secondary' as const, 
          onPress: onExit 
        }
      ];
    }
  }, [gameState.gameOver, gameState.waiting, gameState.started, startReactionGame, restartGame, onExit]);

  // 지시사항 텍스트 (메모이제이션)
  const instructionText = React.useMemo(() => {
    if (gameState.waiting) {
      return '🔴 기다리세요... 초록색이 나타나면 터치!';
    } else if (gameState.started) {
      return '🟢 지금 터치하세요!';
    } else if (gameState.gameOver) {
      return `✅ 완료! 반응시간: ${gameState.reactionTime}ms`;
    } else {
      return '⚡ 반응속도를 테스트해보세요!';
    }
  }, [gameState.waiting, gameState.started, gameState.gameOver, gameState.reactionTime]);

  // 반응 영역 스타일 (메모이제이션)
  const reactionAreaStyle = React.useMemo(() => {
    const baseStyle = {
      backgroundColor: gameState.waiting ? '#FF6B6B' : gameState.started ? '#4ECDC4' : '#2D2D2D'
    };
    
    if (gameState.started) {
      return [baseStyle, { 
        shadowColor: '#4ECDC4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10
      }];
    }
    
    return [baseStyle];
  }, [gameState.waiting, gameState.started]);

  // 등급 계산 (메모이제이션)
  const getGrade = React.useMemo(() => {
    if (gameState.reactionTime === 0) return '-';
    if (gameState.reactionTime < 200) return 'S급 (초인)';
    if (gameState.reactionTime < 300) return 'A급 (매우빠름)';
    if (gameState.reactionTime < 400) return 'B급 (빠름)';
    if (gameState.reactionTime < 500) return 'C급 (보통)';
    return 'D급 (느림)';
  }, [gameState.reactionTime]);

  return (
    <GameContainer title="⚡ 반응속도 테스트">
      <GameStats stats={gameStats} />
      
      <GameInstruction 
        text={instructionText} 
        gameColor={gameColors.reaction} 
      />

      {/* 반응 영역 */}
      <View style={gameStyles.gridContainer}>
        <TouchableOpacity
          style={[
            gameStyles.gameChoiceButtons,
            {
              width: 250,
              height: 250,
              borderRadius: 125,
              marginBottom: 30
            },
            ...reactionAreaStyle
          ]}
          onPress={handleReactionClick}
          disabled={!gameState.waiting && !gameState.started}
        >
          <Text style={[gameStyles.buttonText, { fontSize: 20, textAlign: 'center' }]}>
            {gameState.waiting ? '🔴 대기중...' :
             gameState.started ? '🟢 지금 터치!' :
             gameState.gameOver ? '✅ 완료' : '📱 터치하여 시작'}
          </Text>
        </TouchableOpacity>
      </View>

      {gameState.gameOver && (
        <GameResultComponent
          result={{
            score: Math.max(1000 - gameState.reactionTime, 100),
            message: `반응시간: ${gameState.reactionTime}ms`,
            isWin: gameState.reactionTime < 400
          }}
          gameColor={gameColors.reaction}
          additionalInfo={[
            { label: '등급', value: getGrade },
            { label: '최고 기록', value: gameState.bestTime > 0 ? `${gameState.bestTime}ms` : '-' }
          ]}
        />
      )}

      <GameButtons buttons={gameButtons} />
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </GameContainer>
  );
});

ReactionGame.displayName = 'ReactionGame';

export default ReactionGame; 