import { NativeModules, Platform } from 'react-native';

const { FlashlightModule } = NativeModules;

interface FlashlightInterface {
  turnOnFlashlight(): Promise<boolean>;
  turnOffFlashlight(): Promise<boolean>;
  isFlashlightAvailable(): Promise<boolean>;
}

export default FlashlightModule as FlashlightInterface; 