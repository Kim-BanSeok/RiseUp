import React from 'react';
import { View, Text } from 'react-native';
import { gameStyles } from '../../styles/gameStyles';
import { GameStatItem } from '../../types/gameTypes';

interface GameStatsProps {
  stats: GameStatItem[];
}

const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  return (
    <View style={gameStyles.gameStatusContainer}>
      {stats.map((stat, index) => (
        <View key={index} style={gameStyles.gameStatItem}>
          <Text style={gameStyles.gameStatLabel}>{stat.label}</Text>
          <Text style={[
            gameStyles.gameStatValue,
            stat.color && { color: stat.color }
          ]}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default GameStats; 