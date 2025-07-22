import React from 'react';
import { View, Text } from 'react-native';
import { gameStyles, createGameThemeStyles } from '../../styles/gameStyles';
import { GameResult } from '../../types/gameTypes';

interface GameResultProps {
  result: GameResult;
  gameColor: string;
  additionalInfo?: Array<{
    label: string;
    value: string | number;
  }>;
}

const GameResultComponent: React.FC<GameResultProps> = ({ 
  result, 
  gameColor, 
  additionalInfo 
}) => {
  const themedStyles = createGameThemeStyles(gameColor);

  return (
    <View style={themedStyles.result}>
      <Text style={gameStyles.gameResultTitle}>
        {result.isWin ? '🎉 게임 완료!' : '😅 게임 종료'}
      </Text>
      
      <Text style={gameStyles.gameResultScore}>
        {result.score}점
      </Text>
      
      <Text style={gameStyles.gameResultText}>
        {result.message}
      </Text>
      
      {additionalInfo && additionalInfo.map((info, index) => (
        <Text key={index} style={gameStyles.gameResultSubText}>
          {info.label}: {info.value}
        </Text>
      ))}
    </View>
  );
};

export default GameResultComponent; 