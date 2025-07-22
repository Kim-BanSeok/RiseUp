import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { gameStyles } from '../../styles/gameStyles';
import { GameButton } from '../../types/gameTypes';

interface GameButtonsProps {
  buttons: GameButton[];
}

const GameButtons: React.FC<GameButtonsProps> = ({ buttons }) => {
  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'primary':
        return gameStyles.primaryButton;
      case 'secondary':
        return gameStyles.secondaryButton;
      case 'danger':
        return gameStyles.dangerButton;
      default:
        return gameStyles.secondaryButton;
    }
  };

  return (
    <View style={gameStyles.gameButtons}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[
            getButtonStyle(button.style),
            button.disabled && gameStyles.disabledButton
          ]}
          onPress={button.onPress}
          disabled={button.disabled}
        >
          <Text style={gameStyles.buttonText}>
            {button.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default GameButtons; 