import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlarm } from '../../context/AlarmContext';
import { 
  getBackupList, 
  saveBackup, 
  loadBackup, 
  deleteBackup, 
  validateBackup,
  formatBackupSize,
  BackupInfo,
  BackupData
} from '../../utils/backup';
import CustomAlert from '../../components/CustomAlert';

const BackupRestoreScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { alarms, alarmGroups, alarmHistory, restoreFromBackup } = useAlarm(); // restoreFromBackup 추가
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupName, setBackupName] = useState('');

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

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const backupList = await getBackupList();
      setBackups(backupList);
    } catch (error) {
      console.error('백업 목록 로드 실패:', error);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      showCustomAlert('⚠️ 입력 오류', '백업 이름을 입력해주세요.', [
        { text: '확인' }
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const { createBackup } = await import('../../utils/backup');
      const backupData = await createBackup(alarms, alarmGroups, alarmHistory);
      await saveBackup(backupData, backupName.trim());
      
      showCustomAlert('✅ 백업 완료', '백업이 성공적으로 저장되었습니다.', [
        { text: '확인', onPress: () => {
          setBackupName('');
          loadBackups();
        }}
      ]);
    } catch (error) {
      showCustomAlert('❌ 백업 실패', '백업 중 오류가 발생했습니다.', [
        { text: '확인' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupInfo) => {
    showCustomAlert(
      '⚠️ 복원 확인',
      `"${backup.name}" 백업을 복원하시겠습니까?\n현재 데이터는 덮어쓰기됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '복원', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const backupData = await loadBackup(backup.id);
              
              if (!validateBackup(backupData)) {
                throw new Error('백업 데이터가 손상되었습니다');
              }

              // 실제 데이터 복원
              const success = await restoreFromBackup(backupData);
              
              if (success) {
                showCustomAlert('✅ 복원 완료', '백업이 성공적으로 복원되었습니다.', [
                  { text: '확인', onPress: () => navigation.goBack() }
                ]);
              } else {
                throw new Error('복원 중 오류가 발생했습니다');
              }
            } catch (error) {
              showCustomAlert('❌ 복원 실패', '백업 복원 중 오류가 발생했습니다.', [
                { text: '확인' }
              ]);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteBackup = async (backup: BackupInfo) => {
    showCustomAlert(
      '🗑️ 삭제 확인',
      `"${backup.name}" 백업을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBackup(backup.id);
              showCustomAlert('✅ 삭제 완료', '백업이 삭제되었습니다.', [
                { text: '확인', onPress: () => loadBackups() }
              ]);
            } catch (error) {
              showCustomAlert('❌ 삭제 실패', '백업 삭제 중 오류가 발생했습니다.', [
                { text: '확인' }
              ]);
            }
          }
        }
      ]
    );
  };

  const renderBackupItem = ({ item }: { item: BackupInfo }) => (
    <View style={styles.backupItem}>
      <View style={styles.backupHeader}>
        <Text style={styles.backupName}>{item.name}</Text>
        <Text style={styles.backupSize}>{formatBackupSize(item.size)}</Text>
      </View>
      
      <Text style={styles.backupDate}>
        {item.timestamp.toLocaleString('ko-KR')}
      </Text>
      
      <View style={styles.backupStats}>
        <Text style={styles.backupStat}>알람: {item.metadata.totalAlarms}</Text>
        <Text style={styles.backupStat}>그룹: {item.metadata.totalGroups}</Text>
        <Text style={styles.backupStat}>히스토리: {item.metadata.totalHistory}</Text>
      </View>
      
      <View style={styles.backupActions}>
        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={() => handleRestoreBackup(item)}
        >
          <Text style={styles.restoreButtonText}>🔄 복원</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteBackup(item)}
        >
          <Text style={styles.deleteButtonText}>��️ 삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>💾 백업 & 복원</Text>
        </View>

        {/* 새 백업 생성 */}
        <View style={styles.createBackupSection}>
          <Text style={styles.sectionTitle}>새 백업 생성</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={backupName}
              onChangeText={setBackupName}
              placeholder="백업 이름을 입력하세요"
              placeholderTextColor="#A67C61"
              maxLength={30}
            />
            <TouchableOpacity 
              style={[styles.createButton, isLoading && styles.disabledButton]}
              onPress={handleCreateBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.createButtonText}>💾 백업 생성</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 백업 목록 */}
        <View style={styles.backupListSection}>
          <Text style={styles.sectionTitle}>저장된 백업</Text>
          <FlatList
            data={backups}
            renderItem={renderBackupItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>�� 저장된 백업이 없습니다</Text>
                <Text style={styles.emptySubtext}>
                  백업을 생성하면 여기에 표시됩니다
                </Text>
              </View>
            }
          />
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#8B6341',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  createBackupSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFAB7A',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8B6341',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#4A2C1A',
    color: '#FFD4B3',
  },
  createButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  backupListSection: {
    flex: 1,
    padding: 20,
  },
  list: {
    flex: 1,
  },
  backupItem: {
    backgroundColor: '#4A2C1A',
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
  },
  backupSize: {
    fontSize: 12,
    color: '#FFAB7A',
  },
  backupDate: {
    fontSize: 12,
    color: '#FFAB7A',
    marginBottom: 10,
  },
  backupStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  backupStat: {
    fontSize: 12,
    color: '#FFAB7A',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 10,
  },
  restoreButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
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

export default BackupRestoreScreen; 