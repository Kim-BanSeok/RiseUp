// 기상청 공공데이터 API 설정
export const WEATHER_CONFIG = {
  // 실제 서비스 키 (공공데이터포털에서 발급받은 키)
  KMA_API_KEY: '5AixXeDNsKuyZ6zDiEY2sB5yTjp6RMUt0g%2Bcrj1vwJ8JZDDnkJ31fLeOg2rqahoBsyf1meC4oS2UlV4aggcgyg%3D%3D',
  
  // API 엔드포인트
  KMA_BASE_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
  
  // 기본 위치 좌표 (서울시)
  DEFAULT_COORDINATES: {
    nx: 60, // 서울 격자 X
    ny: 127, // 서울 격자 Y
    name: '서울시'
  },
  
  // API 호출 설정
  REQUEST_CONFIG: {
    timeout: 10000, // 10초 타임아웃
    retryCount: 3, // 재시도 횟수
    retryDelay: 1000, // 재시도 간격 (ms)
  },
  
  // 지역별 좌표 맵핑
  LOCATION_COORDINATES: {
    '서울': { nx: 60, ny: 127 },
    '부산': { nx: 98, ny: 76 },
    '대구': { nx: 89, ny: 90 },
    '인천': { nx: 55, ny: 124 },
    '광주': { nx: 58, ny: 74 },
    '대전': { nx: 67, ny: 100 },
    '울산': { nx: 102, ny: 84 },
    '세종': { nx: 66, ny: 103 },
    '경기': { nx: 60, ny: 120 },
    '강원': { nx: 73, ny: 134 },
    '충북': { nx: 69, ny: 107 },
    '충남': { nx: 68, ny: 100 },
    '전북': { nx: 63, ny: 89 },
    '전남': { nx: 51, ny: 67 },
    '경북': { nx: 87, ny: 106 },
    '경남': { nx: 91, ny: 77 },
    '제주': { nx: 52, ny: 38 },
  }
};

export const WEATHER_CONSTANTS = {
  // API 응답 카테고리
  CATEGORIES: {
    T1H: '기온',
    REH: '습도',
    WSD: '풍속',
    VEC: '풍향',
    RN1: '1시간 강수량',
    PTY: '강수형태',
    UUU: '동서바람성분',
    VVV: '남북바람성분',
    LGT: '낙뢰',
  },
  
  // 강수형태
  PRECIPITATION_TYPES: {
    0: '없음',
    1: '비',
    2: '비/눈',
    3: '눈',
    4: '소나기',
    5: '빗방울',
    6: '빗방울눈날림',
    7: '눈날림',
  },
  
  // 날씨 아이콘
  WEATHER_ICONS: {
    '맑음': '☀️',
    '구름많음': '⛅',
    '흐림': '☁️',
    '비': '🌧️',
    '비/눈': '🌨️',
    '눈': '❄️',
    '소나기': '🌦️',
    '빗방울': '🌦️',
    '빗방울눈날림': '🌨️',
    '눈날림': '❄️',
    '없음': '🌤️',
  },
  
  // 풍향
  WIND_DIRECTIONS: ['북', '북동', '동', '남동', '남', '남서', '서', '북서'],
};

// API 키 검증
export const validateApiKey = (apiKey: string): boolean => {
  return !!(apiKey && apiKey.length > 50 && apiKey.includes('%'));
};

// 좌표 유효성 검증
export const validateCoordinates = (nx: number, ny: number): boolean => {
  return nx >= 1 && nx <= 149 && ny >= 1 && ny <= 253;
}; 