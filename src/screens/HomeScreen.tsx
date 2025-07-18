import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
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

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { alarms, deleteAlarm, toggleAlarm, isLoading } = useAlarm();
  const notificationManager = NotificationManager.getInstance();

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
    if (!nextTime) return '';

    const now = new Date();
    const diffMs = nextTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}일 ${diffHours}시간 후`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 ${diffMinutes}분 후`;
    } else {
      return `${diffMinutes}분 후`;
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
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      <Text style={styles.title}>🌅 RiseUp</Text>
      
      {/* 개발용 테스트 버튼 */}
      {__DEV__ && <AlarmTest />}
      
      {alarms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⏰</Text>
          <Text style={styles.emptyText}>설정된 알람이 없습니다</Text>
          <Text style={styles.emptySubText}>첫 알람을 추가해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item) => item.id}
          style={styles.alarmList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAlarm')}
      >
        <Text style={styles.addButtonText}>+ 알람 추가</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2D1B14', // 어두운 브라운 배경
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
    color: '#FFAB7A', // 따뜻한 오렌지
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFD4B3', // 밝은 피치 색상
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
    color: '#A67C61', // 밝은 브라운
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
    backgroundColor: '#4A2C1A', // 중간 톤 브라운
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7F50', // 코랄 오렌지
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  alarmItemDisabled: {
    backgroundColor: '#3A241A', // 더 어두운 비활성 색상
    borderLeftColor: '#8B6341',
  },
  alarmInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '', // 밝은 피치
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
    color: '#FF7F50', // 코랄 오렌지
    marginTop: 3,
    fontWeight: '500',
  },
  disabledText: {
    color: '#6B4E37', // 어두운 브라운
  },
  alarmControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#CD5C5C', // 부드러운 레드
    borderRadius: 6,
  },
  deleteText: {
    color: '#FFF8DC', // 크림 화이트
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;