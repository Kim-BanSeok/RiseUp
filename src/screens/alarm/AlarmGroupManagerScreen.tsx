import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  // Alert, // 사용하지 않으므로 제거
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlarm, AlarmGroup } from '../../context/AlarmContext';
import CustomAlert from '../../components/CustomAlert';

const AlarmGroupManagerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { alarmGroups, addAlarmGroup, deleteAlarmGroup, updateAlarmGroup, getAlarmStats } = useAlarm();
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#FF7F50');
  const [newGroupIcon, setNewGroupIcon] = useState('📅');

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('#FF7F50');
  const [editGroupIcon, setEditGroupIcon] = useState('📅');

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

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      showCustomAlert('오류', '그룹 이름을 입력해주세요.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    addAlarmGroup(
      newGroupName.trim(),
      newGroupDescription.trim() || undefined,
      newGroupColor,
      newGroupIcon
    );

    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor('#FF7F50');
    setNewGroupIcon('📅');
    setIsAddingGroup(false);

    showCustomAlert('성공', '새 그룹이 추가되었습니다!', [
      { text: '확인', style: 'default' }
    ]);
  };

  const handleDeleteGroup = (group: AlarmGroup) => {
    showCustomAlert(
      '그룹 삭제',
      `"${group.name}" 그룹을 삭제하시겠습니까?\n이 그룹의 알람들은 '개인' 그룹으로 이동됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteAlarmGroup(group.id);
            showCustomAlert('완료', '그룹이 삭제되었습니다.', [
              { text: '확인', style: 'default' }
            ]);
          }
        }
      ]
    );
  };

  const startEditGroup = (group: AlarmGroup) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
    setEditGroupColor(group.color || '#FF7F50');
    setEditGroupIcon(group.icon || '📅');
  };

  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setEditGroupName('');
    setEditGroupDescription('');
    setEditGroupColor('#FF7F50');
    setEditGroupIcon('📅');
  };

  const handleEditGroupSave = (group: AlarmGroup) => {
    if (!editGroupName.trim()) {
      showCustomAlert('오류', '그룹 이름을 입력해주세요.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }
    updateAlarmGroup(group.id, {
      name: editGroupName.trim(),
      description: editGroupDescription.trim() || undefined,
      color: editGroupColor,
      icon: editGroupIcon
    });
    setEditingGroupId(null);
    showCustomAlert('성공', '그룹 정보가 수정되었습니다!', [
      { text: '확인', style: 'default' }
    ]);
  };

  const renderGroupItem = ({ item: group }: { item: AlarmGroup }) => {
    const stats = getAlarmStats();
    const alarmCount = stats.byGroup[group.id] || 0;
    const isEditing = editingGroupId === group.id;

    if (isEditing) {
      return (
        <View style={styles.groupItem}>
          <View style={styles.groupHeader}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupIcon}>{editGroupIcon}</Text>
              <View style={styles.groupDetails}>
                <TextInput
                  style={styles.textInput}
                  value={editGroupName}
                  onChangeText={setEditGroupName}
                  placeholder="그룹 이름"
                  placeholderTextColor="#A67C61"
                />
                <TextInput
                  style={styles.textInput}
                  value={editGroupDescription}
                  onChangeText={setEditGroupDescription}
                  placeholder="설명 (선택)"
                  placeholderTextColor="#A67C61"
                />
                <TextInput
                  style={styles.textInput}
                  value={editGroupIcon}
                  onChangeText={setEditGroupIcon}
                  placeholder="아이콘"
                  placeholderTextColor="#A67C61"
                />
              </View>
            </View>
            <View style={styles.groupStats}>
              <Text style={styles.alarmCount}>{alarmCount}개</Text>
            </View>
          </View>
          <View style={styles.groupActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={() => handleEditGroupSave(group)}
            >
              <Text style={styles.actionButtonText}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={cancelEditGroup}
            >
              <Text style={styles.actionButtonText}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.groupItem}>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupIcon}>{group.icon}</Text>
            <View style={styles.groupDetails}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.description && (
                <Text style={styles.groupDescription}>{group.description}</Text>
              )}
            </View>
          </View>
          <View style={styles.groupStats}>
            <Text style={styles.alarmCount}>{alarmCount}개</Text>
          </View>
        </View>
        <View style={styles.groupActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => startEditGroup(group)}
          >
            <Text style={styles.actionButtonText}>편집</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteGroup(group)}
          >
            <Text style={styles.actionButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>알람 그룹 관리</Text>
          <TouchableOpacity onPress={() => setIsAddingGroup(true)}>
            <Text style={styles.addButton}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isAddingGroup && (
            <View style={styles.addGroupForm}>
              <Text style={styles.formTitle}>새 그룹 추가</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>그룹 이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  placeholder="그룹 이름을 입력하세요"
                  placeholderTextColor="#A67C61"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>설명 (선택사항)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGroupDescription}
                  onChangeText={setNewGroupDescription}
                  placeholder="그룹 설명을 입력하세요"
                  placeholderTextColor="#A67C61"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>아이콘</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGroupIcon}
                  onChangeText={setNewGroupIcon}
                  placeholder="📅"
                  placeholderTextColor="#A67C61"
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddGroup}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsAddingGroup(false);
                    setNewGroupName('');
                    setNewGroupDescription('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={alarmGroups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#4A2C1A',
  },
  backButton: {
    color: '#A67C61',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    color: '#FF7F50',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addGroupForm: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  formTitle: {
    color: '#FFD4B3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#FFAB7A',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#8B6341',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#2D1B14',
    color: '#FFD4B3',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#228B22',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupItem: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupDescription: {
    color: '#A67C61',
    fontSize: 12,
    marginTop: 2,
  },
  groupStats: {
    alignItems: 'flex-end',
  },
  alarmCount: {
    color: '#FF7F50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  groupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#CD5C5C',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AlarmGroupManagerScreen; 