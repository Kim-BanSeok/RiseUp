import { useState, useCallback } from 'react';
import { BaseGameState } from '../types/gameTypes';

interface UseGameStateProps<T extends BaseGameState> {
  initialState: T;
  onGameEnd?: (finalState: T) => void;
}

interface UseGameStateReturn<T> {
  gameState: T;
  updateGameState: (updates: Partial<T>) => void;
  resetGame: (newState?: Partial<T>) => void;
  endGame: () => void;
  isGameActive: boolean;
}

export const useGameState = <T extends BaseGameState>({
  initialState,
  onGameEnd
}: UseGameStateProps<T>): UseGameStateReturn<T> => {
  const [gameState, setGameState] = useState<T>(initialState);

  const updateGameState = useCallback((updates: Partial<T>) => {
    console.log('🎮 [게임상태] 업데이트:', updates);
    setGameState(prev => {
      const newState = { ...prev, ...updates };
      
      // 게임이 종료되었는지 확인
      if (newState.gameOver && !prev.gameOver) {
        console.log('🎮 [게임상태] 게임 종료됨');
        if (onGameEnd) {
          onGameEnd(newState);
        }
      }
      
      return newState;
    });
  }, [onGameEnd]);

  const resetGame = useCallback((newState?: Partial<T>) => {
    console.log('🎮 [게임상태] 게임 리셋');
    const resetState = {
      ...initialState,
      ...newState
    };
    setGameState(resetState);
  }, [initialState]);

  const endGame = useCallback(() => {
    console.log('🎮 [게임상태] 강제 게임 종료');
    updateGameState({ gameOver: true } as Partial<T>);
  }, [updateGameState]);

  const isGameActive = !gameState.gameOver;

  return {
    gameState,
    updateGameState,
    resetGame,
    endGame,
    isGameActive
  };
}; 