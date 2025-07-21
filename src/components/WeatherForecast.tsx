import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { kmaWeatherService } from '../services/weatherApi';

interface ForecastData {
  date: string;
  day: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
  precipitation: number;
}

interface WeatherForecastProps {
  visible: boolean;
  onClose: () => void;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ visible, onClose }) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadForecastData();
    }
  }, [visible]);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      // 임시 모의 예보 데이터 (실제로는 단기예보 API 호출)
      const mockForecast: ForecastData[] = [
        {
          date: '07/21',
          day: '오늘',
          minTemp: 24,
          maxTemp: 29,
          condition: '흐림',
          icon: '☁️',
          precipitation: 10,
        },
        {
          date: '07/22',
          day: '내일',
          minTemp: 22,
          maxTemp: 27,
          condition: '비',
          icon: '🌧️',
          precipitation: 60,
        },
        {
          date: '07/23',
          day: '모레',
          minTemp: 23,
          maxTemp: 28,
          condition: '구름많음',
          icon: '⛅',
          precipitation: 20,
        },
        {
          date: '07/24',
          day: '목',
          minTemp: 25,
          maxTemp: 31,
          condition: '맑음',
          icon: '☀️',
          precipitation: 0,
        },
        {
          date: '07/25',
          day: '금',
          minTemp: 26,
          maxTemp: 32,
          condition: '맑음',
          icon: '☀️',
          precipitation: 0,
        },
      ];
      
      setForecastData(mockForecast);
    } catch (error) {
      console.error('예보 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderForecastItem = (item: ForecastData, index: number) => (
    <View key={index} style={styles.forecastItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.day}>{item.day}</Text>
      </View>
      
      <View style={styles.weatherContainer}>
        <Text style={styles.weatherIcon}>{item.icon}</Text>
        <Text style={styles.condition}>{item.condition}</Text>
      </View>
      
      <View style={styles.tempContainer}>
        <Text style={styles.maxTemp}>{item.maxTemp}°</Text>
        <Text style={styles.minTemp}>{item.minTemp}°</Text>
      </View>
      
      <View style={styles.precipitationContainer}>
        <Text style={styles.precipitation}>{item.precipitation}%</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>5일 일기예보</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7F50" />
            <Text style={styles.loadingText}>예보 데이터 로딩 중...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.forecastHeader}>
              <Text style={styles.headerText}>날짜</Text>
              <Text style={styles.headerText}>날씨</Text>
              <Text style={styles.headerText}>온도</Text>
              <Text style={styles.headerText}>강수</Text>
            </View>
            
            {forecastData.map((item, index) => renderForecastItem(item, index))}
            
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                📍 예보는 기상청 공식 데이터를 기반으로 합니다.{'\n'}
                🔄 실제 단기예보 API 연동 예정
              </Text>
            </View>
          </ScrollView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 10,
  },
  headerText: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  date: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  day: {
    color: '#A67C61',
    fontSize: 12,
    marginTop: 2,
  },
  weatherContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  condition: {
    color: 'white',
    fontSize: 12,
  },
  tempContainer: {
    flex: 1,
    alignItems: 'center',
  },
  maxTemp: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  minTemp: {
    color: '#A67C61',
    fontSize: 14,
  },
  precipitationContainer: {
    flex: 1,
    alignItems: 'center',
  },
  precipitation: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  notice: {
    marginTop: 20,
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
  },
  noticeText: {
    color: '#A67C61',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default WeatherForecast; 