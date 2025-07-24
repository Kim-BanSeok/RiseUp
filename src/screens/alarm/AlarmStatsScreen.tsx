import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlarm } from '../../context/AlarmContext';

const { width } = Dimensions.get('window');

const AlarmStatsScreen = () => {
  const insets = useSafeAreaInsets();
  const { getAlarmStats, getAlarmHistoryStats, alarmGroups, alarms } = useAlarm();

  const stats = useMemo(() => getAlarmStats(), [alarms]);
  const historyStats = useMemo(() => getAlarmHistoryStats(), []);

  // 그룹별 통계
  const groupStats = useMemo(() => {
    const groupData = alarmGroups.map(group => {
      const groupAlarms = alarms.filter(alarm => alarm.groupId === group.id);
      const activeAlarms = groupAlarms.filter(alarm => alarm.isActive);
      
      return {
        ...group,
        totalAlarms: groupAlarms.length,
        activeAlarms: activeAlarms.length,
        percentage: groupAlarms.length > 0 
          ? Math.round((activeAlarms.length / groupAlarms.length) * 100)
          : 0
      };
    });

    return groupData.sort((a, b) => b.totalAlarms - a.totalAlarms);
  }, [alarms, alarmGroups]);

  // 우선순위별 통계
  const priorityStats = useMemo(() => {
    const priorityData = {
      high: alarms.filter(a => a.priority === 'high'),
      medium: alarms.filter(a => a.priority === 'medium'),
      low: alarms.filter(a => a.priority === 'low')
    };

    return {
      high: {
        total: priorityData.high.length,
        active: priorityData.high.filter(a => a.isActive).length,
        percentage: priorityData.high.length > 0 
          ? Math.round((priorityData.high.filter(a => a.isActive).length / priorityData.high.length) * 100)
          : 0
      },
      medium: {
        total: priorityData.medium.length,
        active: priorityData.medium.filter(a => a.isActive).length,
        percentage: priorityData.medium.length > 0 
          ? Math.round((priorityData.medium.filter(a => a.isActive).length / priorityData.medium.length) * 100)
          : 0
      },
      low: {
        total: priorityData.low.length,
        active: priorityData.low.filter(a => a.isActive).length,
        percentage: priorityData.low.length > 0 
          ? Math.round((priorityData.low.filter(a => a.isActive).length / priorityData.low.length) * 100)
          : 0
      }
    };
  }, [alarms]);

  // 시간대별 통계
  const timeStats = useMemo(() => {
    const timeSlots = {
      '새벽 (00:00-06:00)': 0,
      '아침 (06:00-12:00)': 0,
      '오후 (12:00-18:00)': 0,
      '저녁 (18:00-24:00)': 0
    };

    alarms.forEach(alarm => {
      const hour = alarm.time.getHours();
      if (hour >= 0 && hour < 6) {
        timeSlots['새벽 (00:00-06:00)']++;
      } else if (hour >= 6 && hour < 12) {
        timeSlots['아침 (06:00-12:00)']++;
      } else if (hour >= 12 && hour < 18) {
        timeSlots['오후 (12:00-18:00)']++;
      } else {
        timeSlots['저녁 (18:00-24:00)']++;
      }
    });

    return timeSlots;
  }, [alarms]);

  const renderStatCard = (title: string, value: string | number, subtitle?: string, color?: string) => (
    <View style={[styles.statCard, color && { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{percentage}%</Text>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>�� 알람 통계</Text>
      </View>

      {/* 전체 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 전체 통계</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('총 알람', stats.total, '개', '#FF7F50')}
          {renderStatCard('활성 알람', stats.active, '개', '#32CD32')}
          {renderStatCard('비활성 알람', stats.total - stats.active, '개', '#FF6B6B')}
          {renderStatCard('활성화율', `${Math.round((stats.active / stats.total) * 100)}%`, '', '#4A90E2')}
        </View>
      </View>

      {/* 히스토리 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 히스토리 통계</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('총 기록', historyStats.total, '개', '#FFD700')}
          {renderStatCard('울림', historyStats.triggered, '회', '#32CD32')}
          {renderStatCard('다시 울림', historyStats.snoozed, '회', '#FFA500')}
          {renderStatCard('해제', historyStats.dismissed, '회', '#FF6B6B')}
        </View>
        {historyStats.averageResponseTime > 0 && (
          <View style={styles.responseTimeCard}>
            <Text style={styles.responseTimeTitle}>평균 응답 시간</Text>
            <Text style={styles.responseTimeValue}>
              {historyStats.averageResponseTime.toFixed(1)}초
            </Text>
          </View>
        )}
      </View>

      {/* 그룹별 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📂 그룹별 통계</Text>
        {groupStats.map((group, index) => (
          <View key={group.id} style={styles.groupStatCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupCount}>
                  {group.activeAlarms}/{group.totalAlarms} 활성
                </Text>
              </View>
              <Text style={styles.groupPercentage}>{group.percentage}%</Text>
            </View>
            {renderProgressBar(group.percentage, group.color)}
          </View>
        ))}
      </View>

      {/* 우선순위별 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ 우선순위별 통계</Text>
        <View style={styles.priorityStats}>
          <View style={styles.priorityCard}>
            <Text style={styles.priorityTitle}>🔴 높음</Text>
            <Text style={styles.priorityCount}>
              {priorityStats.high.active}/{priorityStats.high.total}
            </Text>
            {renderProgressBar(priorityStats.high.percentage, '#FF6B6B')}
          </View>
          
          <View style={styles.priorityCard}>
            <Text style={styles.priorityTitle}>🟡 보통</Text>
            <Text style={styles.priorityCount}>
              {priorityStats.medium.active}/{priorityStats.medium.total}
            </Text>
            {renderProgressBar(priorityStats.medium.percentage, '#FFA500')}
          </View>
          
          <View style={styles.priorityCard}>
            <Text style={styles.priorityTitle}>🟢 낮음</Text>
            <Text style={styles.priorityCount}>
              {priorityStats.low.active}/{priorityStats.low.total}
            </Text>
            {renderProgressBar(priorityStats.low.percentage, '#32CD32')}
          </View>
        </View>
      </View>

      {/* 시간대별 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ 시간대별 통계</Text>
        {Object.entries(timeStats).map(([timeSlot, count]) => (
          <View key={timeSlot} style={styles.timeStatCard}>
            <Text style={styles.timeSlot}>{timeSlot}</Text>
            <Text style={styles.timeCount}>{count}개</Text>
            <View style={styles.timeBar}>
              <View 
                style={[
                  styles.timeBarFill, 
                  { 
                    width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                    backgroundColor: '#FF7F50'
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#8B6341',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFAB7A',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    width: (width - 50) / 2,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: '#FFAB7A',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#FFAB7A',
    marginTop: 2,
  },
  responseTimeCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginTop: 10,
    alignItems: 'center',
  },
  responseTimeTitle: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 5,
  },
  responseTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  groupStatCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
  },
  groupCount: {
    fontSize: 12,
    color: '#FFAB7A',
  },
  groupPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#8B6341',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFAB7A',
    minWidth: 30,
    textAlign: 'right',
  },
  priorityStats: {
    gap: 10,
  },
  priorityCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
    marginBottom: 5,
  },
  priorityCount: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 10,
  },
  timeStatCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginBottom: 10,
  },
  timeSlot: {
    fontSize: 14,
    color: '#FFD4B3',
    marginBottom: 5,
  },
  timeCount: {
    fontSize: 12,
    color: '#FFAB7A',
    marginBottom: 8,
  },
  timeBar: {
    height: 6,
    backgroundColor: '#8B6341',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timeBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default AlarmStatsScreen; 