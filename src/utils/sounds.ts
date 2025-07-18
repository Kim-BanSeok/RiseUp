import { Platform } from 'react-native';

export interface SoundOption {
  id: string;
  name: string;
  filename: string;
  description: string;
  type: 'builtin' | 'system' | 'custom';
  uri?: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'default',
    name: '기본 알람',
    filename: 'default',
    description: '시스템 기본 알람음',
    type: 'builtin',
  },
  {
    id: 'classic',
    name: '클래식',
    filename: 'alarm_classic',
    description: '전통적인 알람 소리',
    type: 'builtin',
  },
  {
    id: 'gentle',
    name: '부드러운',
    filename: 'alarm_gentle',
    description: '잔잔하고 부드러운 소리',
    type: 'builtin',
  },
  {
    id: 'loud',
    name: '강력한',
    filename: 'alarm_loud',
    description: '큰 소리로 확실하게',
    type: 'builtin',
  },
  {
    id: 'nature',
    name: '자연의 소리',
    filename: 'alarm_nature',
    description: '새소리와 자연의 소리',
    type: 'builtin',
  },
  // 시스템 사운드
  {
    id: 'system_alarm',
    name: '시스템 알람',
    filename: 'content://settings/system/alarm_alert',
    description: '핸드폰 기본 알람음',
    type: 'system',
  },
  {
    id: 'system_notification',
    name: '시스템 알림',
    filename: 'content://settings/system/notification_sound',
    description: '핸드폰 기본 알림음',
    type: 'system',
  },
  {
    id: 'system_ringtone',
    name: '시스템 벨소리',
    filename: 'content://settings/system/ringtone',
    description: '핸드폰 기본 벨소리',
    type: 'system',
  },
];

// 사용자 정의 사운드 목록 (동적으로 추가됨)
let customSounds: SoundOption[] = [];

// 현재 재생 중인 사운드 관리
let currentSoundId: string | null = null;
let soundTimer: NodeJS.Timeout | null = null;

export const addCustomSound = (sound: SoundOption) => {
  customSounds.push(sound);
};

export const getAllSounds = (): SoundOption[] => {
  return [...SOUND_OPTIONS, ...customSounds];
};

export const getSoundById = (id: string): SoundOption => {
  const allSounds = getAllSounds();
  return allSounds.find(sound => sound.id === id) || SOUND_OPTIONS[0];
};

// 사운드 재생 함수 (개선된 버전)
export const playSound = (soundId: string) => {
  console.log(`🔊 재생 시작: ${soundId}`);
  
  // 기존 사운드 정지
  stopSound();
  
  currentSoundId = soundId;
  const sound = getSoundById(soundId);
  
  if (Platform.OS === 'android') {
    // Android에서는 네이티브 사운드 재생 (실제 구현 시 react-native-sound 사용)
    console.log(`Android 사운드 재생: ${sound.filename}`);
    
    // 현재는 시뮬레이션 - 실제로는 다음과 같이 구현:
    // const Sound = require('react-native-sound');
    // const alarm = new Sound(sound.filename, Sound.MAIN_BUNDLE, (error) => {
    //   if (error) {
    //     console.log('사운드 로드 실패', error);
    //     return;
    //   }
    //   alarm.setNumberOfLoops(-1); // 무한 반복
    //   alarm.play();
    // });
  } else {
    // iOS에서는 AVAudioPlayer 사용
    console.log(`iOS 사운드 재생: ${sound.filename}`);
  }
  
  // 개발용: 콘솔에 주기적으로 알림
  soundTimer = setInterval(() => {
    console.log(`🔔 알람음 재생 중... (${sound.name})`);
  }, 5000);
};

export const stopSound = () => {
  if (currentSoundId) {
    console.log(`🔇 사운드 정지: ${currentSoundId}`);
    currentSoundId = null;
  }
  
  if (soundTimer) {
    clearInterval(soundTimer);
    soundTimer = null;
  }
  
  // 실제 구현 시:
  // if (currentSound) {
  //   currentSound.stop();
  //   currentSound.release();
  // }
};

// 핸드폰에서 사운드 파일 선택
export const pickSoundFromDevice = async (): Promise<SoundOption | null> => {
  try {
    // 파일 선택기를 사용하여 사운드 파일 선택
    // 실제 구현 시 react-native-document-picker 사용
    console.log('사운드 파일 선택 기능 구현 예정');
    return null;
  } catch (error) {
    console.error('사운드 파일 선택 실패:', error);
    return null;
  }
};