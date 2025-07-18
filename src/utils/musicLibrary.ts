import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MusicFile {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
}

const MUSIC_CACHE_KEY = '@RiseUp:selected_music_files';

// 기본 제공 음악 목록 (예시)
const DEFAULT_MUSIC_LIST: MusicFile[] = [
  {
    id: 'music_1',
    name: '클래식 피아노',
    uri: 'android.resource://com.riseup/raw/piano_classic',
    type: 'audio/mp3',
    size: 2048000,
  },
  {
    id: 'music_2',
    name: '자연의 소리',
    uri: 'android.resource://com.riseup/raw/nature_sounds',
    type: 'audio/mp3',
    size: 1536000,
  },
  {
    id: 'music_3',
    name: '부드러운 멜로디',
    uri: 'android.resource://com.riseup/raw/soft_melody',
    type: 'audio/mp3',
    size: 1792000,
  },
  {
    id: 'music_4',
    name: '새소리',
    uri: 'android.resource://com.riseup/raw/bird_song',
    type: 'audio/mp3',
    size: 1280000,
  },
  {
    id: 'music_5',
    name: '바다 파도',
    uri: 'android.resource://com.riseup/raw/ocean_waves',
    type: 'audio/mp3',
    size: 2304000,
  }
];

// 사용자 정의 음악 파일 추가 (수동 입력)
export const addCustomMusicFile = async (): Promise<MusicFile | null> => {
  return new Promise((resolve) => {
    // CustomAlert.prompt(
    //   '음악 파일 추가',
    //   '음악 파일 이름을 입력해주세요:',
    //   [
    //     {
    //       text: '취소',
    //       style: 'cancel',
    //       onPress: () => resolve(null),
    //     },
    //     {
    //       text: '추가',
    //       onPress: (musicName) => {
    //         if (musicName && musicName.trim()) {
    //           const musicFile: MusicFile = {
    //             id: Date.now().toString(),
    //             name: musicName.trim(),
    //             uri: `custom://music/${musicName.trim().replace(/\s+/g, '_')}`,
    //             type: 'audio/mp3',
    //             size: 1024000, // 기본 크기
    //           };
    //           resolve(musicFile);
    //         } else {
    //           resolve(null);
    //         }
    //       },
    //     },
    //   ],
    //   'plain-text'
    // );
    // 임시로 기본 음악 파일 추가
    const musicFile: MusicFile = {
      id: Date.now().toString(),
      name: '새로운 음악',
      uri: `custom://music/new_music_${Date.now()}`,
      type: 'audio/mp3',
      size: 1024000,
    };
    resolve(musicFile);
  });
};

// 기본 음악 목록 가져오기
export const getDefaultMusicList = (): MusicFile[] => {
  return DEFAULT_MUSIC_LIST;
};

// 선택된 음악 파일들 저장
export const saveSelectedMusicFiles = async (files: MusicFile[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(MUSIC_CACHE_KEY, JSON.stringify(files));
    console.log('선택된 음악 파일 저장 완료');
  } catch (error) {
    console.error('음악 파일 저장 실패:', error);
  }
};

// 선택된 음악 파일들 로드
export const loadSelectedMusicFiles = async (): Promise<MusicFile[]> => {
  try {
    const data = await AsyncStorage.getItem(MUSIC_CACHE_KEY);
    if (data) {
      const files = JSON.parse(data);
      console.log(`저장된 음악 파일 ${files.length}개 로드`);
      return files;
    }
  } catch (error) {
    console.error('음악 파일 로드 실패:', error);
  }
  
  // 기본값으로 기본 음악 목록 반환
  return getDefaultMusicList();
};

// 음악 파일 제거
export const removeMusicFile = async (fileId: string): Promise<void> => {
  try {
    const files = await loadSelectedMusicFiles();
    const updatedFiles = files.filter(file => file.id !== fileId);
    await saveSelectedMusicFiles(updatedFiles);
    console.log('음악 파일 제거 완료');
  } catch (error) {
    console.error('음악 파일 제거 실패:', error);
  }
};

// 음악 파일 재생 (시뮬레이션)
export const playMusicFile = (fileUri: string): void => {
  console.log(`🎵 음악 재생: ${fileUri}`);
  // TODO: 실제 음악 재생 구현 (react-native-sound 등 사용)
};

// 음악 파일 정지
export const stopMusicFile = (): void => {
  console.log('🔇 음악 정지');
  // TODO: 실제 음악 정지 구현
};

// 기본 음악 목록 초기화
export const initializeDefaultMusic = async (): Promise<void> => {
  try {
    const existingFiles = await AsyncStorage.getItem(MUSIC_CACHE_KEY);
    if (!existingFiles) {
      // 처음 실행 시 기본 음악 목록으로 초기화
      await saveSelectedMusicFiles(DEFAULT_MUSIC_LIST);
      console.log('기본 음악 목록으로 초기화 완료');
    }
  } catch (error) {
    console.error('기본 음악 목록 초기화 실패:', error);
  }
}; 