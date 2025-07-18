// RiseUp/src/screens/WorldClockScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  TIMEZONES, 
  CONTINENTS, 
  getTimezonesByContinent, 
  DEFAULT_WORLD_CLOCKS,
  TimezoneOption 
} from '../utils/timezones';
import CustomAlert from '../components/CustomAlert';

interface WorldClock {
  id: string;
  timezone: string;
  city: string;
  country: string;
  offset: number;
}

const WORLD_CLOCKS_STORAGE_KEY = '@RiseUp:world_clocks';

const WorldClockScreen = () => {
  const insets = useSafeAreaInsets();
  const [clocks, setClocks] = useState<WorldClock[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimezones, setShowTimezones] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<string>('전체');
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

  useEffect(() => {
    loadClocks();
    initializeDefaultClocks();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (clocks.length > 0) {
      saveClocks();
    }
  }, [clocks]);

  const loadClocks = async () => {
    try {
      const saved = await AsyncStorage.getItem(WORLD_CLOCKS_STORAGE_KEY);
      if (saved) {
        const loadedClocks = JSON.parse(saved);
        // 서울/대한민국 카드 제거 (현재시간에서 이미 표시되므로)
        const filteredClocks = loadedClocks.filter((clock: WorldClock) => 
          clock.timezone !== 'Asia/Seoul'
        );
        setClocks(filteredClocks);
      }
    } catch (error) {
      console.error('세계시계 로드 실패:', error);
    }
  };

  const saveClocks = async () => {
    try {
      // 저장할 때도 서울 제외
      const clocksToSave = clocks.filter(clock => clock.timezone !== 'Asia/Seoul');
      await AsyncStorage.setItem(WORLD_CLOCKS_STORAGE_KEY, JSON.stringify(clocksToSave));
    } catch (error) {
      console.error('세계시계 저장 실패:', error);
    }
  };

  const initializeDefaultClocks = async () => {
    try {
      const saved = await AsyncStorage.getItem(WORLD_CLOCKS_STORAGE_KEY);
      if (!saved) {
        // DEFAULT_WORLD_CLOCKS에서도 서울 제외하고 설정
        const defaultWithoutSeoul = DEFAULT_WORLD_CLOCKS.filter(clock => 
          clock.timezone !== 'Asia/Seoul'
        );
        setClocks(defaultWithoutSeoul);
      }
    } catch (error) {
      console.error('기본 세계시계 초기화 실패:', error);
    }
  };

  const getTimeForTimezone = (offset: number): Date => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    return new Date(utc + (offset * 3600000));
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const clockDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffDays = Math.floor((clockDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '내일';
    } else if (diffDays === -1) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

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

  const addClock = (timezone: TimezoneOption) => {
    // 서울 추가 방지
    if (timezone.timezone === 'Asia/Seoul') {
      showCustomAlert('알림', '서울 시간은 상단 현재시간에서 확인할 수 있습니다.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    const exists = clocks.some(clock => clock.timezone === timezone.timezone);
    if (exists) {
      showCustomAlert('알림', '이미 추가된 시간대입니다.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    const newClock: WorldClock = {
      id: Date.now().toString(),
      timezone: timezone.timezone,
      city: timezone.city,
      country: timezone.country,
      offset: timezone.offset
    };

    setClocks(prev => [...prev, newClock]);
    setShowTimezones(false);
    
    // 성공 알림
    showCustomAlert('✅ 추가 완료', `${timezone.city} 시계가 추가되었습니다.`, [
      { text: '확인', style: 'default' }
    ]);
  };

  const removeClock = (id: string) => {
    const clock = clocks.find(c => c.id === id);
    if (!clock) return;

    showCustomAlert(
      '🗑️ 시계 삭제',
      `"${clock.city}" 세계시계를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setClocks(prev => prev.filter(c => c.id !== id));
            showCustomAlert('✅ 삭제 완료', '세계시계가 삭제되었습니다.', [
              { text: '확인', style: 'default' }
            ]);
          }
        }
      ]
    );
  };

  const getFilteredTimezones = () => {
    return getTimezonesByContinent(selectedContinent);
  };

  const renderContinentTab = (continent: string) => (
    <TouchableOpacity
      key={continent}
      style={[
        styles.continentTab,
        selectedContinent === continent && styles.selectedContinentTab
      ]}
      onPress={() => setSelectedContinent(continent)}
    >
      <Text style={[
        styles.continentTabText,
        selectedContinent === continent && styles.selectedContinentTabText
      ]}>
        {continent}
      </Text>
    </TouchableOpacity>
  );

  const renderClockItem = ({ item: clock }: { item: WorldClock }) => {
    const localTime = getTimeForTimezone(clock.offset);
    const isCurrentTimezone = clock.timezone === 'Asia/Seoul';
    
    return (
      <View style={[
        styles.clockCard,
        isCurrentTimezone && styles.currentTimezoneCard
      ]}>
        {/* 첫 번째 줄: 도시명 + 삭제 버튼 */}
        <View style={styles.clockFirstRow}>
          <View style={styles.cityInfo}>
            <Text style={styles.cityName}>
              {clock.city}
              {isCurrentTimezone && ' 🇰🇷'}
            </Text>
            <Text style={styles.countryName}>{clock.country}</Text>
          </View>
          
          {!isCurrentTimezone && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeClock(clock.id)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 두 번째 줄: 시간 */}
        <Text style={[
          styles.clockTime,
          isCurrentTimezone && styles.currentTimezoneTime
        ]}>
          {formatTime(localTime)}
        </Text>

        {/* 세 번째 줄: 날짜 + UTC 오프셋 */}
        <View style={styles.clockThirdRow}>
          <Text style={styles.clockDate}>
            {formatDate(localTime)}
          </Text>
          <Text style={styles.timeDiffText}>
            UTC{clock.offset >= 0 ? '+' : ''}{clock.offset}
          </Text>
        </View>
      </View>
    );
  };

  const renderTimezoneItem = (timezone: TimezoneOption) => (
    <TouchableOpacity
      key={timezone.timezone}
      style={styles.timezoneItem}
      onPress={() => addClock(timezone)}
    >
      <View style={styles.timezoneInfo}>
        <Text style={styles.timezoneCityName}>
          {timezone.city}
        </Text>
        <Text style={styles.timezoneCountryName}>
          {timezone.country}
        </Text>
      </View>
      <Text style={styles.timezoneOffset}>
        UTC{timezone.offset >= 0 ? '+' : ''}{timezone.offset}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>🌍 세계시계</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            console.log('시간대 추가 버튼 클릭');
            setShowTimezones(true);
          }}
        >
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 현재 시간 표시 */}
      <View style={styles.currentTimeContainer}>
        <Text style={styles.currentTimeLabel}>현재 시간</Text>
        <Text style={styles.currentTimeDisplay}>
          {formatTime(currentTime)}
        </Text>
        <Text style={styles.currentDateDisplay}>
          {currentTime.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Text>
      </View>

      {/* 세계시계 목록 */}
      <FlatList
        data={clocks}
        renderItem={renderClockItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.clocksList}
        showsVerticalScrollIndicator={false}
      />

      {/* 시간대 추가 모달 */}
      <Modal
        visible={showTimezones}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimezones(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingTop: insets.top + 10 }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTimezones(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>시간대 추가</Text>
              <View style={styles.placeholder} />
            </View>

            {/* 대륙 탭 */}
            <ScrollView 
              horizontal 
              style={styles.continentTabs}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continentTabsContent}
            >
              {CONTINENTS.map(renderContinentTab)}
            </ScrollView>

            <ScrollView 
              style={styles.timezonesList}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.timezonesContainer}>
                {getFilteredTimezones().map(renderTimezoneItem)}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 커스텀 Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD4B3',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  currentTimeContainer: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  currentTimeLabel: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 8,
  },
  currentTimeDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF7F50',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  currentDateDisplay: {
    fontSize: 14,
    color: '#FFD4B3',
  },
  clocksList: {
    paddingBottom: 20,
  },
  clockCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 15, // 패딩 감소
    marginBottom: 10, // 마진 감소
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  currentTimezoneCard: {
    borderColor: '#FF7F50',
    backgroundColor: '#5A3C2A',
  },
  clockFirstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16, // 폰트 크기 감소
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 2,
  },
  countryName: {
    fontSize: 12, // 폰트 크기 감소
    color: '#FFAB7A',
  },
  deleteButton: {
    width: 22, // 크기 감소
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFD4B3',
    fontSize: 12, // 폰트 크기 감소
    fontWeight: 'bold',
  },
  clockTime: {
    fontSize: 28, // 폰트 크기 감소
    fontWeight: 'bold',
    color: '#FFD4B3',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  currentTimezoneTime: {
    color: '#FF7F50',
  },
  clockThirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockDate: {
    fontSize: 12,
    color: '#FFAB7A',
  },
  timeDiffText: {
    fontSize: 11,
    color: '#A67C61',
    backgroundColor: '#3A241A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-start', // 변경: flex-end에서 flex-start로
  },
  modalContainer: {
    flex: 1, // 변경: 화면 전체 차지
    backgroundColor: '#2D1B14',
    borderTopLeftRadius: 0, // 변경: 모서리 둥글기 제거
    borderTopRightRadius: 0, // 변경: 모서리 둥글기 제거
    borderRadius: 0, // 추가: 모든 모서리 직각
    minHeight: '100%', // 변경: 화면 전체 높이
    maxHeight: '100%', // 변경: 화면 전체 높이
    borderWidth: 0, // 변경: 테두리 제거
    borderColor: 'transparent',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15, // 변경: 패딩 조정
    borderBottomWidth: 2,
    borderBottomColor: '#4A2C1A',
    backgroundColor: '#2D1B14', // 추가: 배경색 명시
  },
  modalCloseButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7F50',
    borderRadius: 17,
  },
  modalCloseText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFD4B3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 35,
  },
  continentTabs: {
    maxHeight: 70, // 높이 증가
    marginBottom: 10,
    backgroundColor: '#2D1B14',
  },
  continentTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center', // 세로 정렬
  },
  continentTab: {
    paddingHorizontal: 20, // 가로 패딩 증가
    paddingVertical: 12, // 세로 패딩 증가
    marginRight: 12, // 간격 증가
    borderRadius: 25, // 모서리 더 둥글게
    backgroundColor: '#4A2C1A',
    borderWidth: 1,
    borderColor: '#8B6341',
    minWidth: 80, // 최소 너비 설정
    alignItems: 'center', // 텍스트 중앙 정렬
    justifyContent: 'center', // 텍스트 중앙 정렬
  },
  selectedContinentTab: {
    backgroundColor: '#FF7F50',
    borderColor: '#FFD4B3',
  },
  continentTabText: {
    color: '#FFAB7A',
    fontSize: 15, // 폰트 크기 증가
    fontWeight: '600', // 폰트 굵기 증가
    textAlign: 'center',
  },
  selectedContinentTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  timezonesList: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#2D1B14', // 추가: 배경색 명시
  },
  timezonesContainer: {
    paddingBottom: 20,
  },
  timezoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#8B6341',
  },
  timezoneInfo: {
    flex: 1,
  },
  timezoneCityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 4,
  },
  timezoneCountryName: {
    fontSize: 14,
    color: '#FFAB7A',
  },
  timezoneOffset: {
    fontSize: 16,
    color: '#FF7F50',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#3A241A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export default WorldClockScreen;