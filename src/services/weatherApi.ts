import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  WEATHER_CONFIG, 
  WEATHER_CONSTANTS, 
  validateApiKey, 
  validateCoordinates 
} from './weatherConfig';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  icon: string;
  description: string;
  precipitation: number;
  windDirection: string;
}

export interface KMAUltraSrtNcstResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: Array<{
          baseDate: string;
          baseTime: string;
          category: string;
          nx: string;
          ny: string;
          obsrValue: string;
        }>;
      };
    };
  };
}

class KMAWeatherService {
  private async getStoredLocation(): Promise<string> {
    try {
      const location = await AsyncStorage.getItem('weather_location');
      return location || '서울'; // 기본값
    } catch (error) {
      console.error('위치 정보 불러오기 실패:', error);
      return '서울';
    }
  }

  private async setStoredLocation(location: string): Promise<void> {
    try {
      await AsyncStorage.setItem('weather_location', location);
    } catch (error) {
      console.error('위치 정보 저장 실패:', error);
    }
  }

  // 현재 시간 기준 정확한 API 호출 시간 계산
  private getCurrentTime(): { baseDate: string; baseTime: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    console.log('현재 시간:', { year, month, day, hour, minute });
    
    // 초단기실황은 매시각 정시에 생성되고 10분 이후 제공
    let baseHour = hour;
    
    // 현재 시간이 해당 시간의 10분 이전이면 이전 시간 데이터 사용
    if (minute < 10) {
      baseHour = hour - 1;
      if (baseHour < 0) {
        baseHour = 23;
        // 전날로 변경
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayYear = yesterday.getFullYear();
        const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
        const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
        return {
          baseDate: `${yesterdayYear}${yesterdayMonth}${yesterdayDay}`,
          baseTime: String(baseHour).padStart(2, '0') + '00'
        };
      }
    }
    
    const result = {
      baseDate: `${year}${month}${day}`,
      baseTime: String(baseHour).padStart(2, '0') + '00'
    };
    
    console.log('계산된 API 호출 시간:', result);
    return result;
  }

  async getCurrentWeather(location?: string): Promise<WeatherData> {
    try {
      const targetLocation = location || await this.getStoredLocation();
      
      // 현재 시간 기준으로 정확한 API 호출
      const { baseDate, baseTime } = this.getCurrentTime();
      
      console.log('🌤️ 현재 시간 기준 API 호출:', { baseDate, baseTime, location: targetLocation });
      
      // 정확한 API 키와 현재 시간으로 URL 구성
      const url = `${WEATHER_CONFIG.KMA_BASE_URL}/getUltraSrtNcst?` +
        `serviceKey=${WEATHER_CONFIG.KMA_API_KEY}&` +
        `pageNo=1&` +
        `numOfRows=1000&` +
        `dataType=JSON&` + // JSON 응답 명시
        `base_date=${baseDate}&` +
        `base_time=${baseTime}&` +
        `nx=55&ny=127`;
      
      console.log('📡 수정된 API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 API 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 응답 에러:', errorText);
        throw new Error(`기상청 API 오류: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('✅ API 응답 성공:', responseText.substring(0, 500));
      
      // 에러 응답 확인
      if (responseText.includes('HTTP ROUTING ERROR') || responseText.includes('SERVICE ERROR')) {
        console.error('❌ API 에러:', responseText);
        throw new Error('API 에러 발생');
      }
      
      // JSON 파싱
      const data: KMAUltraSrtNcstResponse = JSON.parse(responseText);
      
      console.log('✅ JSON 파싱 성공:', JSON.stringify(data, null, 2));
      
      if (data.response.header.resultCode !== '00') {
        throw new Error(`기상청 API 오류: ${data.response.header.resultMsg}`);
      }

      // 데이터 파싱
      const weatherData = this.parseUltraSrtNcstData(data.response.body.items.item);
      
      // 위치 저장
      if (!location) {
        await this.setStoredLocation(targetLocation);
      }

      return weatherData;
    } catch (error) {
      console.error('❌ 날씨 데이터 가져오기 실패:', error);
      throw error;
    }
  }

  private parseUltraSrtNcstData(items: Array<any>): WeatherData {
    console.log('🔍 JSON 데이터 파싱 시작...');
    
    let temperature = 0;
    let humidity = 0;
    let windSpeed = 0;
    let windDirection = '북';
    let precipitation = 0;
    let precipitationType = 0;

    console.log('📝 파싱할 항목들:', items);

    items.forEach(item => {
      const category = item.category;
      const value = parseFloat(item.obsrValue);
      
      console.log(`📊 ${category}: ${value}`);
      
      switch (category) {
        case 'T1H': // 기온
          temperature = value;
          break;
        case 'REH': // 습도
          humidity = value;
          break;
        case 'WSD': // 풍속
          windSpeed = value;
          break;
        case 'VEC': // 풍향
          windDirection = this.getWindDirection(value);
          break;
        case 'RN1': // 1시간 강수량
          precipitation = value;
          break;
        case 'PTY': // 강수형태
          precipitationType = value;
          break;
      }
    });

    // 날씨 상태 결정
    const condition = this.getWeatherCondition(precipitationType, precipitation, humidity);

    const weatherData = {
      temperature,
      condition,
      humidity,
      windSpeed: Math.round(windSpeed),
      location: '서울시',
      feelsLike: this.calculateFeelsLike(temperature, humidity, windSpeed),
      pressure: 1013, // 초단기실황에는 기압 정보가 없음
      visibility: 10, // 가시거리는 별도 API 필요
      icon: this.getWeatherIcon(condition),
      description: condition,
      precipitation,
      windDirection
    };

    console.log('🌤️ 파싱된 날씨 데이터:', weatherData);
    return weatherData;
  }

  private getWeatherCondition(pty: number, precipitation: number, humidity: number): string {
    // 강수형태에 따른 날씨 상태 결정
    switch (pty) {
      case 1: return '비';
      case 2: return '비/눈';
      case 3: return '눈';
      case 4: return '소나기';
      case 5: return '빗방울';
      case 6: return '빗방울눈날림';
      case 7: return '눈날림';
      default:
        // 강수형태가 없으면 습도로 판단
        if (precipitation > 0) {
          return '비';
        } else if (humidity > 80) {
          return '흐림';
        } else if (humidity > 60) {
          return '구름많음';
        } else {
          return '맑음';
        }
    }
  }

  private calculateFeelsLike(temperature: number, humidity: number, windSpeed: number): number {
    // 체감온도 계산 (간단한 공식)
    let feelsLike = temperature;
    
    // 습도 영향
    if (humidity > 80) {
      feelsLike += 2;
    } else if (humidity > 60) {
      feelsLike += 1;
    }
    
    // 바람 영향
    if (windSpeed > 5) {
      feelsLike -= 1;
    }
    
    return Math.round(feelsLike);
  }

  private getWindDirection(angle: number): string {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  }

  private getWeatherIcon(condition: string): string {
    const icons: { [key: string]: string } = {
      '맑음': '☀️',
      '구름많음': '⛅',
      '흐림': '☁️',
      '비': '🌧️',
      '비/눈': '🌨️',
      '눈': '❄️',
      '소나기': '🌦️',
      '빗방울': '🌦️',
      '빗방울눈날림': '🌨️',
      '눈날림': '❄️'
    };
    return icons[condition] || '🌤️';
  }

  // API 키 등록 상태 확인
  async checkApiKeyStatus(): Promise<boolean> {
    try {
      const { baseDate, baseTime } = this.getCurrentTime();
      const url = `${WEATHER_CONFIG.KMA_BASE_URL}/getUltraSrtNcst?` +
        `serviceKey=${WEATHER_CONFIG.KMA_API_KEY}&` +
        `pageNo=1&` +
        `numOfRows=1&` +
        `dataType=JSON&` +
        `base_date=${baseDate}&` +
        `base_time=${baseTime}&` +
        `nx=55&ny=127`;
      
      console.log('🎯 API 키 테스트 URL:', url);
      
      const response = await fetch(url);
      const responseText = await response.text();
      
      console.log('📋 API 응답:', responseText.substring(0, 200));
      
      if (responseText.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
        console.log('❌ API 키가 등록되지 않았습니다.');
        return false;
      }
      
      if (responseText.includes('NORMAL_SERVICE') || responseText.includes('resultCode":"00')) {
        console.log('✅ API 키 승인 완료 - 실제 데이터 사용 가능');
        return true;
      }
      
      console.log('❓ API 응답 상태 확인 중:', responseText);
      return false;
    } catch (error) {
      console.error('❌ API 키 테스트 실패:', error);
      return false;
    }
  }

  // 네트워크 연결 테스트
  async testNetworkConnection(): Promise<boolean> {
    try {
      console.log('🌐 네트워크 연결 테스트 중...');
      
      // 간단한 HTTP 요청 테스트
      await fetch('http://httpbin.org/get');
      console.log('✅ HTTP 연결 성공');
      
      // HTTPS 요청 테스트
      await fetch('https://httpbin.org/get');
      console.log('✅ HTTPS 연결 성공');
      
      return true;
    } catch (error) {
      console.error('❌ 네트워크 연결 실패:', error);
      return false;
    }
  }

  // 직접 테스트용 메서드 (제거)
  async testDirectApiCall(): Promise<void> {
    // 제거하거나 주석 처리
    console.log('직접 테스트는 제거되었습니다.');
  }
}

export const kmaWeatherService = new KMAWeatherService(); 