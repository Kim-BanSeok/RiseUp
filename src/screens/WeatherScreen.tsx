import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { kmaWeatherService, WeatherData } from '../services/weatherApi';
import LocationSelector from '../components/LocationSelector';
import WeatherForecast from '../components/WeatherForecast';
import WeatherSettings from '../components/WeatherSettings';

const WeatherScreen = () => {
  const insets = useSafeAreaInsets();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('서울');

  useEffect(() => {
    // 직접 API 테스트
    kmaWeatherService.testDirectApiCall();
    
    // 기존 로직
    checkApiKeyAndLoadData();
  }, []);

  const checkApiKeyAndLoadData = async () => {
    try {
      console.log('🔍 API 키 등록 상태 확인 중...');
      const isRegistered = await kmaWeatherService.checkApiKeyStatus();
      
      if (isRegistered) {
        console.log('✅ API 키 등록 완료 - 실제 데이터 로딩');
        await loadWeatherData();
      } else {
        console.log('❌ API 키 미등록 - 모의 데이터 표시');
        setError('기상청 API 키 등록이 필요합니다.\n\n 등록 방법:\n1. 공공데이터포털 로그인\n2. 마이페이지 → 서비스 관리 → 서비스 등록\n3. "단기예보 조회서비스" 검색 후 등록\n4. 활성화 대기 후 재시도');
        loadMockData();
      }
    } catch (error) {
      console.error('API 키 확인 실패:', error);
      loadMockData();
    }
  };

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌤️ 실제 기상청 데이터 로딩 시작...');
      const data = await kmaWeatherService.getCurrentWeather();
      console.log('✅ 날씨 데이터 로딩 완료:', data);
      setWeatherData(data);
    } catch (error) {
      console.error('❌ 날씨 데이터 로딩 실패:', error);
      setError('기상청 API 연결에 실패했습니다. 모의 데이터로 표시됩니다.');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // 현재 시간에 맞는 현실적인 모의 데이터
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    
    let mockCondition = '맑음';
    let mockTemp = 20;
    let mockHumidity = 60;
    let mockWindSpeed = 5;
    
    // 계절별 온도 조정
    if (month >= 3 && month <= 5) {
      // 봄
      mockTemp = 15 + Math.floor(Math.random() * 10);
    } else if (month >= 6 && month <= 8) {
      // 여름
      mockTemp = 25 + Math.floor(Math.random() * 8);
      mockHumidity = 70 + Math.floor(Math.random() * 20);
    } else if (month >= 9 && month <= 11) {
      // 가을
      mockTemp = 15 + Math.floor(Math.random() * 10);
    } else {
      // 겨울
      mockTemp = 0 + Math.floor(Math.random() * 10);
    }
    
    // 시간대별 날씨 조정
    if (hour >= 6 && hour <= 18) {
      // 낮 시간
      mockTemp += 5;
      mockCondition = ['맑음', '구름많음', '흐림'][Math.floor(Math.random() * 3)];
    } else {
      // 밤 시간
      mockTemp -= 3;
      mockCondition = '맑음';
    }
    
    // 비 올 확률 (여름철)
    if (month >= 6 && month <= 8 && Math.random() < 0.3) {
      mockCondition = '비';
    }
    
    setWeatherData({
      temperature: mockTemp,
      condition: mockCondition,
      humidity: mockHumidity,
      windSpeed: mockWindSpeed + Math.floor(Math.random() * 8),
      location: '서울시',
      feelsLike: mockTemp + Math.floor(Math.random() * 3) - 1,
      pressure: 1010 + Math.floor(Math.random() * 10),
      visibility: 8 + Math.floor(Math.random() * 5),
      icon: getWeatherIcon(mockCondition),
      description: mockCondition,
      precipitation: mockCondition === '비' ? Math.floor(Math.random() * 5) : 0,
      windDirection: ['북', '동', '남', '서'][Math.floor(Math.random() * 4)]
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeatherData();
    setRefreshing(false);
  };

  const getWeatherIcon = (condition: string): string => {
    const icons: { [key: string]: string } = {
      '맑음': '☀️',
      '구름많음': '⛅',
      '흐림': '☁️',
      '비': '🌧️',
      '비/눈': '🌨️',
      '눈': '❄️',
      '소나기': '🌦️'
    };
    return icons[condition] || '🌤️';
  };

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case '맑음':
        return '#FFD700';
      case '흐림':
        return '#87CEEB';
      case '비':
        return '#4682B4';
      case '눈':
        return '#F0F8FF';
      case '안개':
        return '#D3D3D3';
      default:
        return '#FF7F50';
    }
  };

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    try {
      setLoading(true);
      // 새로운 위치의 날씨 데이터 로딩
      // 실제로는 위치별 좌표로 API 호출 필요
      await loadWeatherData();
    } catch (error) {
      console.error('위치 변경 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7F50" />
          <Text style={styles.loadingText}>실제 날씨 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>날씨</Text>
          <Text style={styles.location}>{weatherData?.location || '위치 확인 중...'}</Text>
        </View>

        {/* 에러 메시지 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.errorSubText}>모의 데이터로 표시됩니다.</Text>
          </View>
        )}

        {/* 현재 날씨 */}
        {weatherData && (
          <View style={[styles.currentWeather, { backgroundColor: getWeatherColor(weatherData.condition) + '20' }]}>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
            <Text style={styles.weatherIcon}>{weatherData.icon}</Text>
            <Text style={styles.feelsLike}>체감온도 {weatherData.feelsLike}°C</Text>
            {weatherData.precipitation > 0 && (
              <Text style={styles.precipitation}>강수량 {weatherData.precipitation}mm</Text>
            )}
          </View>
        )}

        {/* 날씨 상세 정보 */}
        {weatherData && (
          <View style={styles.weatherDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailLabel}>습도</Text>
                <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={styles.detailLabel}>풍속</Text>
                <Text style={styles.detailValue}>{weatherData.windSpeed}km/h</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🧭</Text>
                <Text style={styles.detailLabel}>풍향</Text>
                <Text style={styles.detailValue}>{weatherData.windDirection}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📊</Text>
                <Text style={styles.detailLabel}>기압</Text>
                <Text style={styles.detailValue}>{weatherData.pressure}hPa</Text>
              </View>
            </View>
          </View>
        )}

        {/* 추가 기능들 */}
        <View style={styles.additionalFeatures}>
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => setShowLocationSelector(true)}
          >
            <Text style={styles.featureIcon}>🌍</Text>
            <Text style={styles.featureText}>위치 변경</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => setShowForecast(true)}
          >
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>일기예보</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.featureIcon}>⚙️</Text>
            <Text style={styles.featureText}>설정</Text>
          </TouchableOpacity>
        </View>

        {/* API 상태 안내 */}
        <View style={styles.apiNotice}>
          <Text style={styles.noticeTitle}>🌤️ 실시간 날씨</Text>
          <Text style={styles.noticeText}>
            기상청 공공데이터 API 연동{'\n'}
            실시간 날씨 정보를 제공합니다.
          </Text>
        </View>
      </ScrollView>

      {/* 모달들 */}
      <LocationSelector
        visible={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        onLocationSelect={handleLocationChange}
        currentLocation={selectedLocation}
      />

      <WeatherForecast
        visible={showForecast}
        onClose={() => setShowForecast(false)}
      />

      <WeatherSettings
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'android' ? 140 : 160, // OS별 충분한 패딩
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 15,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  location: {
    color: '#A67C61',
    fontSize: 16,
  },
  currentWeather: {
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  temperature: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  condition: {
    color: '#A67C61',
    fontSize: 18,
    marginTop: 5,
  },
  weatherIcon: {
    fontSize: 64,
    marginTop: 10,
  },
  feelsLike: {
    color: '#A67C61',
    fontSize: 14,
    marginTop: 5,
  },
  weatherDetails: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  detailLabel: {
    color: '#A67C61',
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  additionalFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  featureButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    minWidth: 80,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    color: '#A67C61',
    fontSize: 12,
    textAlign: 'center',
  },
  apiNotice: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  noticeTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noticeText: {
    color: '#A67C61',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FF6B6B20',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorSubText: {
    color: '#A67C61',
    fontSize: 12,
  },
  precipitation: {
    color: '#A67C61',
    fontSize: 12,
    marginTop: 5,
  },
});

export default WeatherScreen; 