import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../context/TimerContext';
import CustomAlert from '../components/CustomAlert';

const TimerHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { 
    getTimerHistory, 
    clearTimerHistory, 
    getTimerHistoryStats, 
    timerTemplates 
  } = useTimer();
  
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedTimerId, setSelectedTimerId] = useState<string | undefined>();

  const history = useMemo(() => 
    getTimerHistory(selectedTimerId, selectedDays), 
    [selectedTimerId, selectedDays]
  );

  const stats = useMemo(() => 
    getTimerHistoryStats(), 
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
      '모든 타이머 히스토리를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            clearTimerHistory();
            showCustomAlert('✅ 완료', '히스토리가 삭제되었습니다.', [
              { text: '확인' }
            ]);
          }
        }
      ]
    );
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${remainingMinutes}분`;
    }
    return `${minutes}분`;
  };

  const getTemplateName = (templateId?: string) => {
    if (!templateId) return '커스텀';
    const template = timerTemplates.find(t => t.id === templateId);
    return template ? template.name : '커스텀';
  };

  const getCategoryName = (category?: string) => {
    const categories: Record<string, string> = {
      'productivity': '생산성',
      'health': '건강',
      'education': '교육',
      'daily': '일상',
      'custom': '커스텀'
    };
    return category ? categories[category] || category : '기타';
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyIcon}>⏲️</Text>
        <View style={styles.historyInfo}>
          <Text style={styles.historyName}>{item.timerName}</Text>
          <Text style={styles.historyDate}>
            {item.completedAt.toLocaleString('ko-KR')}
          </Text>
        </View>
        <Text style={styles.historyEfficiency}>
          {item.efficiency}%
        </Text>
      </View>
      
      <View style={styles.historyDetails}>
        <Text style={styles.historyDetail}>
          설정: {formatDuration(item.duration)}
        </Text>
        <Text style={styles.historyDetail}>
          실제: {formatDuration(item.actualDuration)}
        </Text>
        <Text style={styles.historyDetail}>
          템플릿: {getTemplateName(item.templateId)}
        </Text>
        {item.category && (
          <Text style={styles.historyDetail}>
            카테고리: {getCategoryName(item.category)}
          </Text>
        )}
      </View>
      
      {item.pauseCount > 0 && (
        <Text style={styles.pauseInfo}>
          일시정지: {item.pauseCount}회 ({formatDuration(item.totalPauseTime)})
        </Text>
      )}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>📊 히스토리 통계</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>총 타이머</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatDuration(stats.totalDuration)}</Text>
          <Text style={styles.statLabel}>총 시간</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.averageEfficiency.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>평균 효율</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📝 타이머 히스토리</Text>
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
                타이머를 완료하면 여기에 기록됩니다
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFD4B3',
    marginTop: 5,
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
    marginBottom: 10,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
  },
  historyDate: {
    fontSize: 12,
    color: '#FFAB7A',
    marginTop: 2,
  },
  historyEfficiency: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  historyDetails: {
    marginBottom: 8,
  },
  historyDetail: {
    fontSize: 12,
    color: '#FFAB7A',
    marginBottom: 2,
  },
  pauseInfo: {
    fontSize: 11,
    color: '#A67C61',
    fontStyle: 'italic',
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

export default TimerHistoryScreen; 