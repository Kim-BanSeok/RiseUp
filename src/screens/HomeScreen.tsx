import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useAlarm, Alarm } from '../context/AlarmContext';
import { getSoundById } from '../utils/sounds';
import NotificationManager from '../notifications/NotificationManager';
import AlarmTest from '../components/AlarmTest';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AlarmHistoryScreen from '../screens/AlarmHistoryScreen';
import BackupRestoreScreen from '../screens/BackupRestoreScreen';
import AlarmStatsScreen from '../screens/AlarmStatsScreen';

// 필터 타입 정의
type FilterType = 'all' | 'weekdays' | 'weekend' | 'daily' | 'once' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { alarms, deleteAlarm, toggleAlarm, isLoading } = useAlarm();
  const notificationManager = NotificationManager.getInstance();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 필터 옵션 정의
  const filterOptions = [
    { key: 'all', label: '전체', icon: '📋' },
    { key: 'weekdays', label: '평일', icon: '💼' },
    { key: 'weekend', label: '주말', icon: '🏖️' },
    { key: 'daily', label: '매일', icon: '🔄' },
    { key: 'once', label: '한번만', icon: '⏰' },
    { key: 'monday', label: '월요일', icon: '1️⃣' },
    { key: 'tuesday', label: '화요일', icon: '2️⃣' },
    { key: 'wednesday', label: '수요일', icon: '3️⃣' },
    { key: 'thursday', label: '목요일', icon: '4️⃣' },
    { key: 'friday', label: '금요일', icon: '5️⃣' },
    { key: 'saturday', label: '토요일', icon: '6️⃣' },
    { key: 'sunday', label: '일요일', icon: '7️⃣' },
  ];

  // 필터링된 알람 목록
  const filteredAlarms = useMemo(() => {
    if (selectedFilter === 'all') {
      return alarms;
    }

    return alarms.filter(alarm => {
      const repeatDays = alarm.repeatDays || [];
      
      switch (selectedFilter) {
        case 'weekdays':
          return repeatDays.includes(1) && repeatDays.includes(2) && 
                 repeatDays.includes(3) && repeatDays.includes(4) && 
                 repeatDays.includes(5) && repeatDays.length === 5;
        case 'weekend':
          return repeatDays.includes(0) && repeatDays.includes(6) && 
                 repeatDays.length === 2;
        case 'daily':
          return repeatDays.length === 7;
        case 'once':
          return repeatDays.length === 0;
        case 'monday':
          return repeatDays.includes(1);
        case 'tuesday':
          return repeatDays.includes(2);
        case 'wednesday':
          return repeatDays.includes(3);
        case 'thursday':
          return repeatDays.includes(4);
        case 'friday':
          return repeatDays.includes(5);
        case 'saturday':
          return repeatDays.includes(6);
        case 'sunday':
          return repeatDays.includes(0);
        default:
          return true;
      }
    });
  }, [alarms, selectedFilter]);

  // 현재 선택된 필터 정보
  const currentFilter = filterOptions.find(option => option.key === selectedFilter);

  // navigation 안전성 체크
  const handleAddAlarm = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('AddAlarm');
    } else {
      console.error('❌ navigation이 undefined입니다');
      // 대체 방법: CustomAlert로 알림
      Alert.alert('오류', '알람 추가 기능을 사용할 수 없습니다.');
    }
  };

  const formatRepeatDays = (repeatDays?: number[]) => {
    if (!repeatDays || repeatDays.length === 0) return '한번만';
    if (repeatDays.length === 7) return '매일';
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const sortedDays = [...repeatDays].sort();
    
    // 평일 체크
    if (JSON.stringify(sortedDays) === JSON.stringify([1, 2, 3, 4, 5])) {
      return '평일';
    }
    
    // 주말 체크
    if (JSON.stringify(sortedDays) === JSON.stringify([0, 6])) {
      return '주말';
    }
    
    return sortedDays.map(day => dayNames[day]).join(', ');
  };

  const getNextAlarmTime = (alarm: Alarm) => {
    if (!alarm.isActive) return null;
    
    const now = new Date();
    const alarmTime = new Date(alarm.time);
    
    if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
      // 한번만 울리는 알람
      if (alarmTime.getTime() > now.getTime()) {
        return alarmTime;
      }
      return null;
    }
    
    // 반복 알람의 경우 다음 울릴 시간 계산
    const todayDay = now.getDay();
    let nextDay = alarm.repeatDays.find(day => {
      if (day > todayDay) return true;
      if (day === todayDay) {
        const todayAlarmTime = new Date(now);
        todayAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
        return todayAlarmTime.getTime() > now.getTime();
      }
      return false;
    });
    
    if (!nextDay) {
      nextDay = alarm.repeatDays[0]; // 다음 주 첫 번째 요일
    }
    
    const nextAlarmTime = new Date(now);
    const dayDiff = nextDay <= todayDay ? 7 - todayDay + nextDay : nextDay - todayDay;
    nextAlarmTime.setDate(now.getDate() + dayDiff);
    nextAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
    
    return nextAlarmTime;
  };

  const formatNextAlarmTime = (nextTime: Date | null) => {
    if (!nextTime) return null;
    
    const now = new Date();
    const diffMs = nextTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000); // 초 추가
    
    if (diffDays > 0) {
      return `${diffDays}일 ${diffHours}시간 ${diffMinutes}분 후`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 ${diffMinutes}분 ${diffSeconds}초 후`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 ${diffSeconds}초 후`;
    } else {
      return `${diffSeconds}초 후`;
    }
  };

  const renderAlarmItem = ({ item }: { item: Alarm }) => {
    const nextAlarmTime = getNextAlarmTime(item);
    const selectedSound = getSoundById(item.soundId || 'default');
    
    return (
      <View style={[styles.alarmItem, !item.isActive && styles.alarmItemDisabled]}>
        <View style={styles.alarmInfo}>
          <Text style={[styles.timeText, !item.isActive && styles.disabledText]}>
            {item.time.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit', // 초 추가
              hour12: false 
            })}
          </Text>
          <Text style={[styles.labelText, !item.isActive && styles.disabledText]}>
            {item.label}
          </Text>
          <Text style={[styles.repeatText, !item.isActive && styles.disabledText]}>
            {formatRepeatDays(item.repeatDays)} • 🔊 {selectedSound.name}
          </Text>
          {nextAlarmTime && item.isActive && (
            <Text style={styles.nextTimeText}>
              {formatNextAlarmTime(nextAlarmTime)}
            </Text>
          )}
        </View>
        <View style={styles.alarmControls}>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleAlarm(item.id)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.isActive ? '#f5dd4b' : '#f4f3f4'}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteAlarm(item.id)}
          >
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>알람을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      {/* 헤더 - 타이머 화면과 동일한 구조 */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>🌅 RiseUp</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAlarm}
        >
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>
      
      {/* 고급 기능 버튼들을 한 줄로 배치 */}
      <View style={styles.advancedButtonsContainer}>
        <TouchableOpacity 
          style={styles.advancedButton} 
          onPress={() => navigation.navigate('AlarmHistory')}
        >
          <Text style={styles.advancedButtonText}>📝 히스토리</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.advancedButton} 
          onPress={() => navigation.navigate('BackupRestore')}
        >
          <Text style={styles.advancedButtonText}>💾 백업</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.advancedButton} 
          onPress={() => navigation.navigate('AlarmStats')}
        >
          <Text style={styles.advancedButtonText}>📊 통계</Text>
        </TouchableOpacity>
      </View>

      {/* 필터 섹션 */}
      <View style={styles.filterSection}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {currentFilter?.icon} {currentFilter?.label} ({filteredAlarms.length})
          </Text>
          <Text style={styles.filterArrow}>{showFilters ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      {/* 필터 옵션들 */}
      {showFilters && (
        <View style={styles.filterOptionsContainer}>
          <FlatList
            data={filterOptions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilter === item.key && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setSelectedFilter(item.key as FilterType);
                  setShowFilters(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === item.key && styles.filterOptionTextSelected
                ]}>
                  {item.icon} {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterOptionsList}
          />
        </View>
      )}
      
      {alarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text style={styles.emptyText}>설정된 알람이 없습니다</Text>
          <Text style={styles.emptySubText}>첫 알람을 추가해보세요!</Text>
        </View>
      ) : filteredAlarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}></Text>
          <Text style={styles.emptyText}>해당하는 알람이 없습니다</Text>
          <Text style={styles.emptySubText}>다른 필터를 선택해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAlarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item) => item.id}
          style={styles.alarmList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#2D1B14',
  },
  title: {
    color: '#FFD4B3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D1B14',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFAB7A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFAB7A',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#A67C61',
    marginBottom: 30,
  },
  alarmList: {
    flex: 1,
    marginBottom: 20,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7F50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // 전체 너비 사용
    marginLeft: 20,
    marginRight: 20,
    marginTop: 1,
  },
  alarmItemDisabled: {
    backgroundColor: '#3A241A',
    borderLeftColor: '#8B6341',
  },
  alarmInfo: {
    flex: 1,
    marginRight: 10, // 오른쪽 컨트롤과의 간격
  },
  timeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  labelText: {
    fontSize: 14,
    color: '#FFAB7A',
    marginTop: 2,
  },
  repeatText: {
    fontSize: 12,
    color: '#A67C61',
    marginTop: 2,
  },
  nextTimeText: {
    fontSize: 11,
    color: '#FF7F50',
    marginTop: 3,
    fontWeight: '500',
  },
  disabledText: {
    color: '#6B4E37',
  },
  alarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 80, // 최소 너비 보장
  },
  deleteButton: {
    marginLeft: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#CD5C5C',
    borderRadius: 6,
  },
  deleteText: {
    color: '#FFF8DC',
    fontSize: 12,
    fontWeight: '500',
  },
  advancedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  advancedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF7F50',
  },
  advancedButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: '#4A2C1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B6341',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#FFD4B3',
    fontWeight: '600',
    fontSize: 14,
  },
  filterArrow: {
    color: '#FFAB7A',
    fontSize: 12,
  },
  filterOptionsContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterOptionsList: {
    paddingHorizontal: 10,
  },
  filterOption: {
    backgroundColor: '#4A2C1A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginHorizontal: 5,
  },
  filterOptionSelected: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  filterOptionText: {
    color: '#FFD4B3',
    fontWeight: '500',
    fontSize: 12,
  },
  filterOptionTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default HomeScreen;