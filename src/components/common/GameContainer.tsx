import React from 'react';
import { ScrollView, Text } from 'react-native';
import { gameStyles } from '../../styles/gameStyles';

interface GameContainerProps {
  title: string;
  children: React.ReactNode;
  showScrollIndicator?: boolean;
}

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  children,
  showScrollIndicator = true
}) => {
  return (
    <ScrollView
      style={gameStyles.gameContainer}
      contentContainerStyle={gameStyles.gameScrollContent}
      showsVerticalScrollIndicator={showScrollIndicator}
    >
      <Text style={gameStyles.gameTitle}>{title}</Text>
      {children}
    </ScrollView>
  );
};

export default GameContainer; 