import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeatherSettingsProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingsData {
  autoRefresh: boolean;
  refreshInterval: number;
  showFeelsLike: boolean;
  showWindInfo: boolean;
  showPrecipitation: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: boolean;
}

const WeatherSettings: React.FC<WeatherSettingsProps> = ({ visible, onClose }) => {
  const [settings, setSettings] = useState<SettingsData>({
    autoRefresh: true,
    refreshInterval: 30,
    showFeelsLike: true,
    showWindInfo: true,
    showPrecipitation: true,
    temperatureUnit: 'celsius',
    notifications: false,
  });

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('weather_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('설정 로딩 실패:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    try {
      await AsyncStorage.setItem('weather_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetSettings = () => {
    Alert.alert(
      '설정 초기화',
      '모든 설정을 초기값으로 되돌리시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: SettingsData = {
              autoRefresh: true,
              refreshInterval: 30,
              showFeelsLike: true,
              showWindInfo: true,
              showPrecipitation: true,
              temperatureUnit: 'celsius',
              notifications: false,
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const refreshIntervals = [
    { label: '15분', value: 15 },
    { label: '30분', value: 30 },
    { label: '1시간', value: 60 },
    { label: '2시간', value: 120 },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>날씨 설정</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>완료</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* 자동 새로고침 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자동 새로고침</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>자동 새로고침 사용</Text>
              <Switch
                value={settings.autoRefresh}
                onValueChange={(value) => updateSetting('autoRefresh', value)}
                trackColor={{ false: '#333', true: '#FF7F5080' }}
                thumbColor={settings.autoRefresh ? '#FF7F50' : '#666'}
              />
            </View>

            {settings.autoRefresh && (
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>새로고침 간격</Text>
                <View style={styles.intervalContainer}>
                  {refreshIntervals.map((interval) => (
                    <TouchableOpacity
                      key={interval.value}
                      style={[
                        styles.intervalButton,
                        settings.refreshInterval === interval.value && styles.intervalButtonActive
                      ]}
                      onPress={() => updateSetting('refreshInterval', interval.value)}
                    >
                      <Text style={[
                        styles.intervalButtonText,
                        settings.refreshInterval === interval.value && styles.intervalButtonTextActive
                      ]}>
                        {interval.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* 표시 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>표시 정보</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>체감온도 표시</Text>
              <Switch
                value={settings.showFeelsLike}
                onValueChange={(value) => updateSetting('showFeelsLike', value)}
                trackColor={{ false: '#333', true: '#FF7F5080' }}
                thumbColor={settings.showFeelsLike ? '#FF7F50' : '#666'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>바람 정보 표시</Text>
              <Switch
                value={settings.showWindInfo}
                onValueChange={(value) => updateSetting('showWindInfo', value)}
                trackColor={{ false: '#333', true: '#FF7F5080' }}
                thumbColor={settings.showWindInfo ? '#FF7F50' : '#666'}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>강수 정보 표시</Text>
              <Switch
                value={settings.showPrecipitation}
                onValueChange={(value) => updateSetting('showPrecipitation', value)}
                trackColor={{ false: '#333', true: '#FF7F5080' }}
                thumbColor={settings.showPrecipitation ? '#FF7F50' : '#666'}
              />
            </View>
          </View>

          {/* 온도 단위 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>온도 단위</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>온도 표시 단위</Text>
              <View style={styles.unitContainer}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    settings.temperatureUnit === 'celsius' && styles.unitButtonActive
                  ]}
                  onPress={() => updateSetting('temperatureUnit', 'celsius')}
                >
                  <Text style={[
                    styles.unitButtonText,
                    settings.temperatureUnit === 'celsius' && styles.unitButtonTextActive
                  ]}>
                    °C
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    settings.temperatureUnit === 'fahrenheit' && styles.unitButtonActive
                  ]}
                  onPress={() => updateSetting('temperatureUnit', 'fahrenheit')}
                >
                  <Text style={[
                    styles.unitButtonText,
                    settings.temperatureUnit === 'fahrenheit' && styles.unitButtonTextActive
                  ]}>
                    °F
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 알림 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알림</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>날씨 알림</Text>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: '#333', true: '#FF7F5080' }}
                thumbColor={settings.notifications ? '#FF7F50' : '#666'}
              />
            </View>
          </View>

          {/* 초기화 버튼 */}
          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.resetButtonText}>설정 초기화</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF7F50',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FF7F50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
  },
  settingLabel: {
    color: 'white',
    fontSize: 16,
  },
  intervalContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  intervalButtonActive: {
    backgroundColor: '#FF7F50',
  },
  intervalButtonText: {
    color: '#A67C61',
    fontSize: 12,
  },
  intervalButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  unitContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#FF7F50',
  },
  unitButtonText: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WeatherSettings; 