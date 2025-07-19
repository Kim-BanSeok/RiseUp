import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterval } from '../context/IntervalContext';

const { width: screenWidth } = Dimensions.get('window');

const IntervalStatsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { history, templates } = useInterval();

  // 전체 통계 계산
  const overallStats = useMemo(() => {
    const totalSessions = history.length;
    const totalTime = history.reduce((sum, session) => sum + session.totalDuration, 0);
    const totalCycles = history.reduce((sum, session) => sum + session.completedCycles, 0);
    const avgDuration = totalSessions > 0 ? totalTime / totalSessions : 0;
    const avgCycles = totalSessions > 0 ? totalCycles / totalSessions : 0;

    // 가장 많이 사용한 템플릿
    const templateCounts = history.reduce((acc, session) => {
      acc[session.templateName] = (acc[session.templateName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteTemplate = Object.entries(templateCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '없음';

    // 일별 통계
    const dailyStats = history.reduce((acc, session) => {
      const date = new Date(session.endTime).toDateString();
      if (!acc[date]) {
        acc[date] = { sessions: 0, time: 0, cycles: 0 };
      }
      acc[date].sessions += 1;
      acc[date].time += session.totalDuration;
      acc[date].cycles += session.completedCycles;
      return acc;
    }, {} as Record<string, { sessions: number; time: number; cycles: number }>);

    // 주간 통계
    const weeklyStats = history.reduce((acc, session) => {
      const date = new Date(session.endTime);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toDateString();
      
      if (!acc[weekKey]) {
        acc[weekKey] = { sessions: 0, time: 0, cycles: 0 };
      }
      acc[weekKey].sessions += 1;
      acc[weekKey].time += session.totalDuration;
      acc[weekKey].cycles += session.completedCycles;
      return acc;
    }, {} as Record<string, { sessions: number; time: number; cycles: number }>);

    return {
      totalSessions,
      totalTime,
      totalCycles,
      avgDuration,
      avgCycles,
      favoriteTemplate,
      dailyStats,
      weeklyStats,
    };
  }, [history]);

  // 시간 포맷팅
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  // 통계 카드 렌더링
  const renderStatCard = (title: string, value: string, subtitle?: string, icon?: string) => (
    <View style={styles.statCard}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  // 템플릿별 통계
  const templateStats = useMemo(() => {
    const stats = templates.map(template => {
      const templateHistory = history.filter(session => session.templateName === template.name);
      const sessions = templateHistory.length;
      const totalTime = templateHistory.reduce((sum, session) => sum + session.totalDuration, 0);
      const totalCycles = templateHistory.reduce((sum, session) => sum + session.completedCycles, 0);
      
      return {
        template,
        sessions,
        totalTime,
        totalCycles,
        avgTime: sessions > 0 ? totalTime / sessions : 0,
      };
    });

    return stats.sort((a, b) => b.sessions - a.sessions);
  }, [history, templates]);

  return (
    <ScrollView 
      style={[styles.container, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>📊 인터벌 통계</Text>

      {/* 전체 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>전체 통계</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            '총 세션',
            overallStats.totalSessions.toString(),
            '회',
            '📈'
          )}
          {renderStatCard(
            '총 시간',
            formatDuration(overallStats.totalTime),
            '누적',
            '⏱️'
          )}
          {renderStatCard(
            '총 사이클',
            overallStats.totalCycles.toString(),
            '회',
            '🔄'
          )}
          {renderStatCard(
            '평균 시간',
            formatDuration(overallStats.avgDuration),
            '세션당',
            '📊'
          )}
        </View>
      </View>

      {/* 인기 템플릿 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>인기 템플릿</Text>
        <View style={styles.favoriteCard}>
          <Text style={styles.favoriteIcon}>��</Text>
          <Text style={styles.favoriteTitle}>{overallStats.favoriteTemplate}</Text>
          <Text style={styles.favoriteSubtitle}>가장 많이 사용한 템플릿</Text>
        </View>
      </View>

      {/* 템플릿별 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>템플릿별 통계</Text>
        {templateStats.map((stat, index) => (
          <View key={stat.template.id} style={styles.templateStatCard}>
            <View style={styles.templateHeader}>
              <Text style={styles.templateIcon}>{stat.template.icon}</Text>
              <Text style={styles.templateName}>{stat.template.name}</Text>
              <Text style={styles.templateRank}>#{index + 1}</Text>
            </View>
            <View style={styles.templateStats}>
              <View style={styles.templateStat}>
                <Text style={styles.templateStatLabel}>세션</Text>
                <Text style={styles.templateStatValue}>{stat.sessions}회</Text>
              </View>
              <View style={styles.templateStat}>
                <Text style={styles.templateStatLabel}>총 시간</Text>
                <Text style={styles.templateStatValue}>{formatDuration(stat.totalTime)}</Text>
              </View>
              <View style={styles.templateStat}>
                <Text style={styles.templateStatLabel}>평균</Text>
                <Text style={styles.templateStatValue}>{formatDuration(stat.avgTime)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 최근 활동 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 활동</Text>
        {history.slice(0, 5).map((session, index) => (
          <View key={session.id} style={styles.recentCard}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentIcon}>🎯</Text>
              <Text style={styles.recentTemplate}>{session.templateName}</Text>
              <Text style={styles.recentTime}>
                {new Date(session.endTime).toLocaleDateString('ko-KR')}
              </Text>
            </View>
            <View style={styles.recentStats}>
              <Text style={styles.recentStat}>
                {formatDuration(session.totalDuration)}
              </Text>
              <Text style={styles.recentStat}>
                {session.completedCycles} 사이클
              </Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFD4B3',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    alignItems: 'center',
    width: (screenWidth - 60) / 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#FFAB7A',
    textAlign: 'center',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#A67C61',
    textAlign: 'center',
    marginTop: 2,
  },
  favoriteCard: {
    backgroundColor: '#4A2C1A',
    padding: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF7F50',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  favoriteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 5,
  },
  favoriteSubtitle: {
    fontSize: 14,
    color: '#FFAB7A',
  },
  templateStatCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginBottom: 10,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD4B3',
    flex: 1,
  },
  templateRank: {
    fontSize: 12,
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateStat: {
    alignItems: 'center',
  },
  templateStatLabel: {
    fontSize: 12,
    color: '#FFAB7A',
    marginBottom: 2,
  },
  templateStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  recentCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginBottom: 8,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  recentTemplate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD4B3',
    flex: 1,
  },
  recentTime: {
    fontSize: 12,
    color: '#A67C61',
  },
  recentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentStat: {
    fontSize: 12,
    color: '#FFAB7A',
  },
});

export default IntervalStatsScreen; 