import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { getAllSounds, SoundOption, playSound, stopSound, getSoundById } from '../utils/sounds';
import { 
  addCustomMusicFile,
  getDefaultMusicList,
  loadSelectedMusicFiles, 
  saveSelectedMusicFiles,
  removeMusicFile,
  playMusicFile, 
  stopMusicFile, 
  initializeDefaultMusic,
  MusicFile 
} from '../utils/musicLibrary';
import CustomAlert from './CustomAlert';

interface SoundSelectorProps {
  selectedSoundId: string;
  onSoundChange: (soundId: string) => void;
}

const SoundSelector: React.FC<SoundSelectorProps> = ({
  selectedSoundId,
  onSoundChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // CustomAlert 상태
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) {
            button.onPress();
          }
        }
      }))
    });
  };

  const selectedSound = getSoundById(selectedSoundId);
  const allSounds = getAllSounds();

  // 컴포넌트 마운트 시 음악 파일 로드
  useEffect(() => {
    initializeMusic();
  }, []);

  const initializeMusic = async () => {
    await initializeDefaultMusic();
    await loadMusicFiles();
  };

  const loadMusicFiles = async () => {
    const files = await loadSelectedMusicFiles();
    setMusicFiles(files);
  };

  const handleSoundSelect = (sound: SoundOption | MusicFile) => {
    const soundId = 'uri' in sound ? `music_${sound.id}` : sound.id;
    onSoundChange(soundId);
    setModalVisible(false);
    stopCurrentSound();
  };

  const playPreview = (item: SoundOption | MusicFile) => {
    const itemId = 'uri' in item ? `music_${item.id}` : item.id;
    
    if (playingSound === itemId) {
      stopCurrentSound();
    } else {
      stopCurrentSound();
      setPlayingSound(itemId);
      
      if ('uri' in item) {
        // 음악 파일 재생
        playMusicFile(item.uri);
      } else {
        // 기본 사운드 재생
        playSound(item.id);
      }
      
      // 10초 후 자동 정지
      setTimeout(() => {
        if (playingSound === itemId) {
          stopCurrentSound();
        }
      }, 10000);
    }
  };

  const stopCurrentSound = () => {
    if (playingSound) {
      if (playingSound.startsWith('music_')) {
        stopMusicFile();
      } else {
        stopSound();
      }
      setPlayingSound(null);
    }
  };

  const handleAddMusicFile = async () => {
    setIsLoading(true);
    try {
      const musicFile = await addCustomMusicFile();
      if (musicFile) {
        const updatedFiles = [...musicFiles, musicFile];
        setMusicFiles(updatedFiles);
        await saveSelectedMusicFiles(updatedFiles);
        
        showCustomAlert(
          '🎵 음악 추가 완료',
          `"${musicFile.name}" 파일이 추가되었습니다.`,
          [{ text: '확인', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('음악 파일 추가 실패:', error);
      showCustomAlert('⚠️ 오류', '음악 파일 추가 중 오류가 발생했습니다.', [
        { text: '확인', style: 'default' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMusicFile = async (fileId: string) => {
    const defaultMusicIds = getDefaultMusicList().map(music => music.id);
    if (defaultMusicIds.includes(fileId)) {
      showCustomAlert('ℹ️ 알림', '기본 제공 음악은 삭제할 수 없습니다.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    showCustomAlert(
      '🗑️ 음악 파일 삭제',
      '이 음악 파일을 목록에서 제거하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await removeMusicFile(fileId);
            const updatedFiles = musicFiles.filter(file => file.id !== fileId);
            setMusicFiles(updatedFiles);
          }
        }
      ]
    );
  };

  const handleResetToDefault = async () => {
    showCustomAlert(
      '🔄 기본 음악으로 초기화',
      '음악 목록을 기본 제공 음악으로 초기화하시겠습니까?\n추가한 사용자 정의 음악은 모두 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            const defaultMusic = getDefaultMusicList();
            setMusicFiles(defaultMusic);
            await saveSelectedMusicFiles(defaultMusic);
            showCustomAlert('✅ 완료', '기본 음악 목록으로 초기화되었습니다.', [
              { text: '확인', style: 'default' }
            ]);
          }
        }
      ]
    );
  };

  const renderSoundItem = (sound: SoundOption) => (
    <TouchableOpacity
      key={sound.id}
      style={[
        styles.soundItem,
        selectedSoundId === sound.id && styles.selectedSoundItem
      ]}
      onPress={() => handleSoundSelect(sound)}
    >
      <View style={styles.soundInfo}>
        <Text style={[
          styles.soundName,
          selectedSoundId === sound.id && styles.selectedText
        ]}>
          {sound.name}
        </Text>
        <Text style={[
          styles.soundDescription,
          selectedSoundId === sound.id && styles.selectedText
        ]}>
          {sound.description}
        </Text>
        {sound.type !== 'builtin' && (
          <Text style={styles.soundType}>
            {sound.type === 'system' ? '시스템 사운드' : '사용자 지정'}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.playButton,
          playingSound === sound.id && styles.playingButton
        ]}
        onPress={() => playPreview(sound)}
      >
        <Text style={[
          styles.playButtonText,
          playingSound === sound.id && styles.playingButtonText
        ]}>
          {playingSound === sound.id ? '⏹' : '▶️'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMusicItem = (music: MusicFile) => {
    const musicId = `music_${music.id}`;
    const isSelected = selectedSoundId === musicId;
    const isDefaultMusic = getDefaultMusicList().some(defaultMusic => defaultMusic.id === music.id);
    
    return (
      <TouchableOpacity
        key={music.id}
        style={[
          styles.soundItem,
          isSelected && styles.selectedSoundItem
        ]}
        onPress={() => handleSoundSelect(music)}
      >
        <View style={styles.soundInfo}>
          <Text style={[
            styles.soundName,
            isSelected && styles.selectedText
          ]}>
            {music.name}
          </Text>
          <Text style={[
            styles.soundDescription,
            isSelected && styles.selectedText
          ]}>
            {isDefaultMusic ? '기본 제공' : '사용자 추가'} • {(music.size / 1024 / 1024).toFixed(1)}MB
          </Text>
          <Text style={styles.soundType}>
            내 음악
          </Text>
        </View>
        
        <View style={styles.musicControls}>
          <TouchableOpacity
            style={[
              styles.playButton,
              playingSound === musicId && styles.playingButton
            ]}
            onPress={() => playPreview(music)}
          >
            <Text style={[
              styles.playButtonText,
              playingSound === musicId && styles.playingButtonText
            ]}>
              {playingSound === musicId ? '⏹' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          {!isDefaultMusic && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMusicFile(music.id)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getSectionData = () => {
    const builtin = allSounds.filter(s => s.type === 'builtin');
    const system = allSounds.filter(s => s.type === 'system');
    
    return { builtin, system };
  };

  const { builtin, system } = getSectionData();

  // 선택된 항목 정보 가져오기
  const getSelectedItemInfo = () => {
    if (selectedSoundId.startsWith('music_')) {
      const musicId = selectedSoundId.replace('music_', '');
      const music = musicFiles.find(m => m.id === musicId);
      return {
        name: music?.name || '선택된 음악',
        description: '내 음악'
      };
    } else {
      return {
        name: selectedSound?.name || '선택된 사운드',
        description: selectedSound?.description || '사운드를 선택해주세요'
      };
    }
  };

  const selectedInfo = getSelectedItemInfo();

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>소리</Text>
        
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.selectorContent}>
            <Text style={styles.selectedSoundName}>
              {selectedInfo.name}
            </Text>
            <Text style={styles.selectedSoundDesc}>
              {selectedInfo.description}
            </Text>
          </View>
          <View style={styles.selectorIcon}>
            <View style={styles.headphonesIcon}>
              <View style={styles.headband} />
              <View style={styles.leftEarpiece} />
              <View style={styles.rightEarpiece} />
              <View style={styles.phone} />
            </View>
          </View>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setModalVisible(false);
            stopCurrentSound();
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  stopCurrentSound();
                }}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>알람음 선택</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToDefault}
              >
                <Text style={styles.resetButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.soundsList}>
              {/* 내 음악 */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>내 음악 ({musicFiles.length})</Text>
                  <TouchableOpacity
                    style={[styles.addButton, isLoading && styles.addButtonDisabled]}
                    onPress={handleAddMusicFile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.addButtonText}>+ 추가</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {musicFiles.map(renderMusicItem)}
              </View>

              {/* 기본 사운드 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>기본 사운드</Text>
                {builtin.map(renderSoundItem)}
              </View>

              {/* 시스템 사운드 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>시스템 사운드</Text>
                {system.map(renderSoundItem)}
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFAB7A',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#8B4513',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A0522D',
  },
  selectorContent: {
    flex: 1,
  },
  selectedSoundName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFD4B3',
  },
  selectedSoundDesc: {
    fontSize: 12,
    color: '#FFAB7A',
    marginTop: 2,
  },
  selectorIcon: {
    marginLeft: 15,
  },
  headphonesIcon: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  headband: {
    position: 'absolute',
    top: 5,
    left: 8,
    right: 8,
    height: 4,
    backgroundColor: '#FF7F50',
    borderRadius: 2,
  },
  leftEarpiece: {
    position: 'absolute',
    left: 2,
    top: 8,
    width: 12,
    height: 16,
    backgroundColor: '#FF6347',
    borderRadius: 6,
  },
  rightEarpiece: {
    position: 'absolute',
    right: 2,
    top: 8,
    width: 12,
    height: 16,
    backgroundColor: '#FF6347',
    borderRadius: 6,
  },
  phone: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 16,
    height: 12,
    backgroundColor: '#4682B4',
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#2D1B14',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4A2C1A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFD4B3',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 30,
  },
  soundsList: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFAB7A',
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FF7F50',
    borderRadius: 15,
    minWidth: 60,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  selectedSoundItem: {
    backgroundColor: '#4A2C1A',
  },
  soundInfo: {
    flex: 1,
    paddingRight: 15,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFD4B3',
  },
  soundDescription: {
    fontSize: 12,
    color: '#FFAB7A',
    marginTop: 2,
  },
  soundType: {
    fontSize: 10,
    color: '#A67C61',
    marginTop: 2,
  },
  selectedText: {
    color: '#FF7F50',
  },
  musicControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B4E37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playingButton: {
    backgroundColor: '#FF7F50',
  },
  playButtonText: {
    fontSize: 16,
  },
  playingButtonText: {
    color: '#fff',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CD5C5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
  },
});

export default SoundSelector;