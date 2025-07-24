import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlarm } from '../../context/AlarmContext';
import CustomAlert from '../../components/CustomAlert';

const AlarmHistoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { getAlarmHistory, clearAlarmHistory, getAlarmHistoryStats, alarmGroups } = useAlarm();
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | undefined>();

  const history = useMemo(() => 
    getAlarmHistory(selectedAlarmId, selectedDays), 
    [selectedAlarmId, selectedDays]
  );

  const stats = useMemo(() => 
    getAlarmHistoryStats(), 
    [history]
  );

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as any[]
  });

  const showCustomAlert = (title: string, message: string, buttons: any[]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) button.onPress();
        }
      }))
    });
  };

  const handleClearHistory = () => {
    showCustomAlert(
      '��️ 히스토리 삭제',
      '모든 알람 히스토리를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            clearAlarmHistory();
            showCustomAlert('✅ 완료', '히스토리가 삭제되었습니다.', [
              { text: '확인' }
            ]);
          }
        }
      ]
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'triggered': return '🔔';
      case 'snoozed': return '⏰';
      case 'dismissed': return '❌';
      default: return '📝';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'triggered': return '울림';
      case 'snoozed': return '다시 울림';
      case 'dismissed': return '해제';
      default: return '알 수 없음';
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const group = alarmGroups.find(g => g.id === item.groupId);
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyIcon}>
            {getActionIcon(item.action)}
          </Text>
          <View style={styles.historyInfo}>
            <Text style={styles.historyLabel}>{item.alarmLabel}</Text>
            <Text style={styles.historyTime}>
              {item.triggeredAt.toLocaleString('ko-KR')}
            </Text>
          </View>
          <Text style={styles.historyAction}>
            {getActionText(item.action)}
          </Text>
        </View>
        
        {item.responseTime !== undefined && (
          <Text style={styles.responseTime}>
            응답 시간: {item.responseTime}초
          </Text>
        )}
        
        {group && (
          <View style={[styles.groupTag, { backgroundColor: group.color }]}>
            <Text style={styles.groupText}>{group.icon} {group.name}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>📊 히스토리 통계</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>전체</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.triggered}</Text>
          <Text style={styles.statLabel}>울림</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.snoozed}</Text>
          <Text style={styles.statLabel}>다시 울림</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.dismissed}</Text>
          <Text style={styles.statLabel}>해제</Text>
        </View>
      </View>
      {stats.averageResponseTime > 0 && (
        <Text style={styles.avgResponseTime}>
          평균 응답 시간: {stats.averageResponseTime.toFixed(1)}초
        </Text>
      )}
    </View>
  );

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📝 알람 히스토리</Text>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Text style={styles.clearButtonText}>🗑️ 삭제</Text>
          </TouchableOpacity>
        </View>

        {renderStats()}

        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>�� 히스토리가 없습니다</Text>
              <Text style={styles.emptySubtext}>
                알람이 울리면 여기에 기록됩니다
              </Text>
            </View>
          }
        />
      </View>

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
    flex: 1,
    backgroundColor: '#2D1B14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#8B6341',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  clearButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFD4B3',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#4A2C1A',
    margin: 20,
    borderRadius: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFAB7A',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFD4B3',
    marginTop: 5,
  },
  avgResponseTime: {
    fontSize: 14,
    color: '#FFAB7A',
    textAlign: 'center',
    marginTop: 15,
  },
  list: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: '#4A2C1A',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  historyInfo: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
  },
  historyTime: {
    fontSize: 12,
    color: '#FFAB7A',
    marginTop: 2,
  },
  historyAction: {
    fontSize: 12,
    color: '#FF7F50',
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 12,
    color: '#FFAB7A',
    marginTop: 8,
  },
  groupTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  groupText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFD4B3',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#FFAB7A',
    textAlign: 'center',
  },
});

export default AlarmHistoryScreen; 