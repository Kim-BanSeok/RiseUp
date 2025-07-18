import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { getAllSounds, SoundOption, playSound, stopSound, getSoundById, pickSoundFromDevice, addCustomSound } from '../utils/sounds';

interface SoundSelectorProps {
  selectedSoundId: string;
  onSoundChange: (soundId: string) => void;
}

const SoundSelector: React.FC<SoundSelectorProps> = ({ selectedSoundId, onSoundChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  const selectedSound = getSoundById(selectedSoundId);
  const allSounds = getAllSounds();

  const handleSoundSelect = (sound: SoundOption) => {
    onSoundChange(sound.id);
    setModalVisible(false);
    stopCurrentSound();
  };

  const playPreview = (soundId: string) => {
    if (playingSound === soundId) {
      stopCurrentSound();
    } else {
      stopCurrentSound();
      setPlayingSound(soundId);
      playSound(soundId);
      
      // 5초 후 자동 정지
      setTimeout(() => {
        if (playingSound === soundId) {
          stopCurrentSound();
        }
      }, 5000);
    }
  };

  const stopCurrentSound = () => {
    if (playingSound) {
      stopSound();
      setPlayingSound(null);
    }
  };

  const handleAddCustomSound = async () => {
    const customSound = await pickSoundFromDevice();
    if (customSound) {
      addCustomSound(customSound);
      handleSoundSelect(customSound);
    }
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
        onPress={() => playPreview(sound.id)}
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

  const getSectionData = () => {
    const builtin = allSounds.filter(s => s.type === 'builtin');
    const system = allSounds.filter(s => s.type === 'system');
    const custom = allSounds.filter(s => s.type === 'custom');
    
    return { builtin, system, custom };
  };

  const { builtin, system, custom } = getSectionData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>소리</Text>
      
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectedSoundName}>음악</Text>
          <Text style={styles.selectedSoundDesc}>향후을 찾지 못함</Text>
        </View>
        <View style={styles.selectorIcon}>
          {/* 헤드폰 아이콘을 나타내는 이미지나 텍스트 */}
          <View style={styles.headphonesIcon}>
            <View style={styles.headband} />
            <View style={styles.leftEarpiece} />
            <View style={styles.rightEarpiece} />
            <View style={styles.phone} />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
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
            <Text style={styles.modalTitle}>미리 보기 저장</Text>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.soundsList}>
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

            {/* 사용자 지정 사운드 */}
            {custom.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>사용자 지정</Text>
                {custom.map(renderSoundItem)}
              </View>
            )}

            {/* 파일 추가 버튼 */}
            <TouchableOpacity
              style={styles.addFileButton}
              onPress={handleAddCustomSound}
            >
              <Text style={styles.addFileText}>+ 파일에서 사운드 추가</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
    color: '#FFAB7A', // 따뜻한 오렌지
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#8B4513', // 브라운 배경
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
    color: '#FFD4B3', // 밝은 피치
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
    backgroundColor: '#2D1B14', // 어두운 브라운
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
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#FFD4B3',
    fontWeight: 'bold',
  },
  soundsList: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFAB7A',
    marginBottom: 15,
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
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B4E37',
    justifyContent: 'center',
    alignItems: 'center',
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
  addFileButton: {
    padding: 20,
    backgroundColor: '#4A2C1A',
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8B6341',
    alignItems: 'center',
    marginTop: 20,
  },
  addFileText: {
    fontSize: 16,
    color: '#FFAB7A',
    fontWeight: '500',
  },
});

export default SoundSelector;