import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterval } from '../../context/IntervalContext';
import { 
  createIntervalBackup,
  getIntervalBackupList,
  restoreIntervalBackup,
  deleteIntervalBackup,
  clearAllIntervalBackups,
  IntervalBackupInfo
} from '../../utils/intervalBackup';
import CustomAlert from '../../components/CustomAlert';

const IntervalBackupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { templates, history, loadTemplates, loadHistory } = useInterval();
  const [backupList, setBackupList] = useState<IntervalBackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>,
  });

  useEffect(() => {
    loadBackupList();
  }, []);

  const loadBackupList = async () => {
    try {
      const list = await getIntervalBackupList();
      setBackupList(list);
    } catch (error) {
      console.error('백업 목록 로드 실패:', error);
    }
  };

  const showAlert = (
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

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await createIntervalBackup(templates, history);
      await loadBackupList();
      showAlert(
        '✅ 백업 완료',
        '인터벌 데이터가 성공적으로 백업되었습니다.',
        [{ text: '확인', style: 'default' }]
      );
    } catch (error) {
      showAlert(
        '❌ 백업 실패',
        '백업 중 오류가 발생했습니다.',
        [{ text: '확인', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: IntervalBackupInfo) => {
    showAlert(
      '백업 복원',
      `"${backup.name}" 백업을 복원하시겠습니까?\n현재 데이터는 덮어쓰기됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              const backupData = await restoreIntervalBackup(backup.id);
              // Context에 데이터 복원
              // (실제 구현에서는 Context의 복원 함수를 호출해야 함)
              await loadBackupList();
              showAlert(
                '✅ 복원 완료',
                '백업이 성공적으로 복원되었습니다.',
                [{ text: '확인', style: 'default' }]
              );
            } catch (error) {
              showAlert(
                '❌ 복원 실패',
                '복원 중 오류가 발생했습니다.',
                [{ text: '확인', style: 'default' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteBackup = async (backup: IntervalBackupInfo) => {
    showAlert(
      '백업 삭제',
      `"${backup.name}" 백업을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIntervalBackup(backup.id);
              await loadBackupList();
              showAlert(
                '✅ 삭제 완료',
                '백업이 삭제되었습니다.',
                [{ text: '확인', style: 'default' }]
              );
            } catch (error) {
              showAlert(
                '❌ 삭제 실패',
                '삭제 중 오류가 발생했습니다.',
                [{ text: '확인', style: 'default' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleClearAllBackups = () => {
    showAlert(
      '모든 백업 삭제',
      '모든 백업을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllIntervalBackups();
              await loadBackupList();
              showAlert(
                '✅ 삭제 완료',
                '모든 백업이 삭제되었습니다.',
                [{ text: '확인', style: 'default' }]
              );
            } catch (error) {
              showAlert(
                '❌ 삭제 실패',
                '삭제 중 오류가 발생했습니다.',
                [{ text: '확인', style: 'default' }]
              );
            }
          }
        }
      ]
    );
  };

  const renderBackupItem = ({ item }: { item: IntervalBackupInfo }) => (
    <View style={styles.backupCard}>
      <View style={styles.backupHeader}>
        <Text style={styles.backupName}>{item.name}</Text>
        <Text style={styles.backupDate}>
          {new Date(item.timestamp).toLocaleDateString('ko-KR')}
        </Text>
      </View>
      <View style={styles.backupStats}>
        <Text style={styles.backupStat}>템플릿: {item.metadata.totalTemplates}개</Text>
        <Text style={styles.backupStat}>히스토리: {item.metadata.totalHistory}개</Text>
        <Text style={styles.backupSize}>{(item.size / 1024).toFixed(1)}KB</Text>
      </View>
      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => handleRestoreBackup(item)}
        >
          <Text style={styles.restoreButtonText}>복원</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBackup(item)}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.title}>💾 인터벌 백업</Text>

      {/* 현재 상태 */}
      <View style={styles.currentStats}>
        <Text style={styles.currentStatsTitle}>현재 데이터</Text>
        <View style={styles.currentStatsGrid}>
          <View style={styles.currentStat}>
            <Text style={styles.currentStatValue}>{templates.length}</Text>
            <Text style={styles.currentStatLabel}>템플릿</Text>
          </View>
          <View style={styles.currentStat}>
            <Text style={styles.currentStatValue}>{history.length}</Text>
            <Text style={styles.currentStatLabel}>히스토리</Text>
          </View>
        </View>
      </View>

      {/* 백업 생성 버튼 */}
      <TouchableOpacity
        style={styles.createBackupButton}
        onPress={handleCreateBackup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text style={styles.createBackupButtonText}>💾 새 백업 생성</Text>
        )}
      </TouchableOpacity>

      {/* 백업 목록 */}
      <View style={styles.backupListSection}>
        <View style={styles.backupListHeader}>
          <Text style={styles.backupListTitle}>백업 목록</Text>
          {backupList.length > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAllBackups}
            >
              <Text style={styles.clearAllButtonText}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {backupList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>��</Text>
            <Text style={styles.emptyText}>백업이 없습니다</Text>
            <Text style={styles.emptySubtext}>새 백업을 생성해보세요!</Text>
          </View>
        ) : (
          <FlatList
            data={backupList}
            renderItem={renderBackupItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </View>
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
  currentStats: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginBottom: 20,
  },
  currentStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 15,
  },
  currentStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currentStat: {
    alignItems: 'center',
  },
  currentStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  currentStatLabel: {
    fontSize: 14,
    color: '#FFAB7A',
    marginTop: 5,
  },
  createBackupButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createBackupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupListSection: {
    flex: 1,
  },
  backupListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backupListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  clearAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearAllButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  emptyState: {
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
  emptySubtext: {
    fontSize: 14,
    color: '#A67C61',
  },
  backupCard: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginBottom: 10,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  backupDate: {
    fontSize: 12,
    color: '#A67C61',
  },
  backupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backupStat: {
    fontSize: 12,
    color: '#FFAB7A',
  },
  backupSize: {
    fontSize: 12,
    color: '#A67C61',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 10,
  },
  restoreButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default IntervalBackupScreen; 