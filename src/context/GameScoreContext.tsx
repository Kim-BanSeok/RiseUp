import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GameScore {
  game: string;
  score: number;
  date: string;
}

interface GameScoreContextType {
  gameScores: GameScore[];
  addScore: (game: string, score: number) => void;
  clearScores: () => void;
  getTopScores: (game?: string, limit?: number) => GameScore[];
}

const GameScoreContext = createContext<GameScoreContextType | undefined>(undefined);

interface GameScoreProviderProps {
  children: ReactNode;
}

export const GameScoreProvider: React.FC<GameScoreProviderProps> = ({ children }) => {
  const [gameScores, setGameScores] = useState<GameScore[]>([]);

  const addScore = (game: string, score: number) => {
    console.log('🏆 [점수] 새로운 점수 추가:', { game, score });
    const newScore: GameScore = {
      game,
      score,
      date: new Date().toISOString()
    };
    setGameScores(prev => {
      const updated = [newScore, ...prev].slice(0, 50); // 최대 50개까지 저장
      console.log('🏆 [점수] 업데이트된 점수 목록:', updated.length, '개');
      return updated;
    });
  };

  const clearScores = () => {
    console.log('🗑️ [점수] 모든 점수 삭제');
    setGameScores([]);
  };

  const getTopScores = (game?: string, limit: number = 10) => {
    let filtered = gameScores;
    
    if (game) {
      filtered = gameScores.filter(score => score.game === game);
    }
    
    return filtered
      .sort((a, b) => b.score - a.score) // 점수 높은 순으로 정렬
      .slice(0, limit);
  };

  const value = {
    gameScores,
    addScore,
    clearScores,
    getTopScores
  };

  return (
    <GameScoreContext.Provider value={value}>
      {children}
    </GameScoreContext.Provider>
  );
};

export const useGameScore = () => {
  const context = useContext(GameScoreContext);
  if (context === undefined) {
    throw new Error('useGameScore must be used within a GameScoreProvider');
  }
  return context;
}; 