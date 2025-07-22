import React from 'react';
import { View, Text } from 'react-native';
import { createGameThemeStyles } from '../../styles/gameStyles';

interface GameInstructionProps {
  text: string;
  gameColor: string;
}

const GameInstruction: React.FC<GameInstructionProps> = ({ text, gameColor }) => {
  const themedStyles = createGameThemeStyles(gameColor);

  return (
    <View style={themedStyles.instruction}>
      <Text style={themedStyles.instructionText}>
        {text}
      </Text>
    </View>
  );
};

export default GameInstruction; 