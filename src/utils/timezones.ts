// RiseUp/src/utils/timezones.ts
export interface TimezoneOption {
    timezone: string;
    city: string;
    country: string;
    offset: number;
    continent: 'Asia' | 'Europe' | 'NorthAmerica' | 'SouthAmerica' | 'Africa' | 'Oceania';
  }
  
  export const TIMEZONES: TimezoneOption[] = [
    // 아시아
    { timezone: 'Asia/Seoul', city: '서울', country: '대한민국', offset: 9, continent: 'Asia' },
    { timezone: 'Asia/Pyongyang', city: '평양', country: '북한', offset: 9, continent: 'Asia' },
    { timezone: 'Asia/Tokyo', city: '도쿄', country: '일본', offset: 9, continent: 'Asia' },
    { timezone: 'Asia/Osaka', city: '오사카', country: '일본', offset: 9, continent: 'Asia' },
    { timezone: 'Asia/Shanghai', city: '상하이', country: '중국', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Beijing', city: '베이징', country: '중국', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Hong_Kong', city: '홍콩', country: '홍콩', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Macau', city: '마카오', country: '마카오', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Taipei', city: '타이베이', country: '대만', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Singapore', city: '싱가포르', country: '싱가포르', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Manila', city: '마닐라', country: '필리핀', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Kuala_Lumpur', city: '쿠알라룸푸르', country: '말레이시아', offset: 8, continent: 'Asia' },
    { timezone: 'Asia/Jakarta', city: '자카르타', country: '인도네시아', offset: 7, continent: 'Asia' },
    { timezone: 'Asia/Bangkok', city: '방콕', country: '태국', offset: 7, continent: 'Asia' },
    { timezone: 'Asia/Ho_Chi_Minh', city: '호치민', country: '베트남', offset: 7, continent: 'Asia' },
    { timezone: 'Asia/Yangon', city: '양곤', country: '미얀마', offset: 6.5, continent: 'Asia' },
    { timezone: 'Asia/Dhaka', city: '다카', country: '방글라데시', offset: 6, continent: 'Asia' },
    { timezone: 'Asia/Colombo', city: '콜롬보', country: '스리랑카', offset: 5.5, continent: 'Asia' },
    { timezone: 'Asia/Kolkata', city: '뭄바이', country: '인도', offset: 5.5, continent: 'Asia' },
    { timezone: 'Asia/Delhi', city: '뉴델리', country: '인도', offset: 5.5, continent: 'Asia' },
    { timezone: 'Asia/Karachi', city: '카라치', country: '파키스탄', offset: 5, continent: 'Asia' },
    { timezone: 'Asia/Tashkent', city: '타슈켄트', country: '우즈베키스탄', offset: 5, continent: 'Asia' },
    { timezone: 'Asia/Kabul', city: '카불', country: '아프가니스탄', offset: 4.5, continent: 'Asia' },
    { timezone: 'Asia/Tehran', city: '테헤란', country: '이란', offset: 4.5, continent: 'Asia' },
    { timezone: 'Asia/Dubai', city: '두바이', country: 'UAE', offset: 4, continent: 'Asia' },
    { timezone: 'Asia/Muscat', city: '무스카트', country: '오만', offset: 4, continent: 'Asia' },
    { timezone: 'Asia/Kuwait', city: '쿠웨이트', country: '쿠웨이트', offset: 3, continent: 'Asia' },
    { timezone: 'Asia/Riyadh', city: '리야드', country: '사우디아라비아', offset: 3, continent: 'Asia' },
    { timezone: 'Asia/Baghdad', city: '바그다드', country: '이라크', offset: 3, continent: 'Asia' },
    { timezone: 'Asia/Jerusalem', city: '예루살렘', country: '이스라엘', offset: 2, continent: 'Asia' },
    { timezone: 'Asia/Damascus', city: '다마스쿠스', country: '시리아', offset: 2, continent: 'Asia' },
    { timezone: 'Asia/Beirut', city: '베이루트', country: '레바논', offset: 2, continent: 'Asia' },
  
    // 유럽
    { timezone: 'Europe/London', city: '런던', country: '영국', offset: 0, continent: 'Europe' },
    { timezone: 'Europe/Dublin', city: '더블린', country: '아일랜드', offset: 0, continent: 'Europe' },
    { timezone: 'Europe/Lisbon', city: '리스본', country: '포르투갈', offset: 0, continent: 'Europe' },
    { timezone: 'Europe/Madrid', city: '마드리드', country: '스페인', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Barcelona', city: '바르셀로나', country: '스페인', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Paris', city: '파리', country: '프랑스', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Lyon', city: '리옹', country: '프랑스', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Brussels', city: '브뤼셀', country: '벨기에', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Amsterdam', city: '암스테르담', country: '네덜란드', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Berlin', city: '베를린', country: '독일', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Munich', city: '뮌헨', country: '독일', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Frankfurt', city: '프랑크푸르트', country: '독일', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Zurich', city: '취리히', country: '스위스', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Vienna', city: '빈', country: '오스트리아', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Rome', city: '로마', country: '이탈리아', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Milan', city: '밀라노', country: '이탈리아', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Prague', city: '프라하', country: '체코', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Budapest', city: '부다페스트', country: '헝가리', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Warsaw', city: '바르샤바', country: '폴란드', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Stockholm', city: '스톡홀름', country: '스웨덴', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Oslo', city: '오슬로', country: '노르웨이', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Copenhagen', city: '코펜하겐', country: '덴마크', offset: 1, continent: 'Europe' },
    { timezone: 'Europe/Helsinki', city: '헬싱키', country: '핀란드', offset: 2, continent: 'Europe' },
    { timezone: 'Europe/Athens', city: '아테네', country: '그리스', offset: 2, continent: 'Europe' },
    { timezone: 'Europe/Istanbul', city: '이스탄불', country: '터키', offset: 3, continent: 'Europe' },
    { timezone: 'Europe/Moscow', city: '모스크바', country: '러시아', offset: 3, continent: 'Europe' },
    { timezone: 'Europe/Kiev', city: '키예프', country: '우크라이나', offset: 2, continent: 'Europe' },
    { timezone: 'Europe/Bucharest', city: '부쿠레슈티', country: '루마니아', offset: 2, continent: 'Europe' },
  
    // 북미
    { timezone: 'America/New_York', city: '뉴욕', country: '미국', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Boston', city: '보스턴', country: '미국', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Miami', city: '마이애미', country: '미국', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Atlanta', city: '애틀랜타', country: '미국', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Detroit', city: '디트로이트', country: '미국', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Chicago', city: '시카고', country: '미국', offset: -6, continent: 'NorthAmerica' },
    { timezone: 'America/Dallas', city: '댈러스', country: '미국', offset: -6, continent: 'NorthAmerica' },
    { timezone: 'America/Houston', city: '휴스턴', country: '미국', offset: -6, continent: 'NorthAmerica' },
    { timezone: 'America/New_Orleans', city: '뉴올리언스', country: '미국', offset: -6, continent: 'NorthAmerica' },
    { timezone: 'America/Denver', city: '덴버', country: '미국', offset: -7, continent: 'NorthAmerica' },
    { timezone: 'America/Phoenix', city: '피닉스', country: '미국', offset: -7, continent: 'NorthAmerica' },
    { timezone: 'America/Los_Angeles', city: '로스앤젤레스', country: '미국', offset: -8, continent: 'NorthAmerica' },
    { timezone: 'America/San_Francisco', city: '샌프란시스코', country: '미국', offset: -8, continent: 'NorthAmerica' },
    { timezone: 'America/Seattle', city: '시애틀', country: '미국', offset: -8, continent: 'NorthAmerica' },
    { timezone: 'America/Las_Vegas', city: '라스베이거스', country: '미국', offset: -8, continent: 'NorthAmerica' },
    { timezone: 'America/Anchorage', city: '앵커리지', country: '미국', offset: -9, continent: 'NorthAmerica' },
    { timezone: 'Pacific/Honolulu', city: '호놀룰루', country: '미국', offset: -10, continent: 'NorthAmerica' },
    { timezone: 'America/Toronto', city: '토론토', country: '캐나다', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Montreal', city: '몬트리올', country: '캐나다', offset: -5, continent: 'NorthAmerica' },
    { timezone: 'America/Vancouver', city: '밴쿠버', country: '캐나다', offset: -8, continent: 'NorthAmerica' },
    { timezone: 'America/Calgary', city: '캘거리', country: '캐나다', offset: -7, continent: 'NorthAmerica' },
    { timezone: 'America/Mexico_City', city: '멕시코시티', country: '멕시코', offset: -6, continent: 'NorthAmerica' },
    { timezone: 'America/Cancun', city: '칸쿤', country: '멕시코', offset: -5, continent: 'NorthAmerica' },
  
    // 남미
    { timezone: 'America/Sao_Paulo', city: '상파울루', country: '브라질', offset: -3, continent: 'SouthAmerica' },
    { timezone: 'America/Rio_de_Janeiro', city: '리우데자네이루', country: '브라질', offset: -3, continent: 'SouthAmerica' },
    { timezone: 'America/Brasilia', city: '브라질리아', country: '브라질', offset: -3, continent: 'SouthAmerica' },
    { timezone: 'America/Manaus', city: '마나우스', country: '브라질', offset: -4, continent: 'SouthAmerica' },
    { timezone: 'America/Buenos_Aires', city: '부에노스아이레스', country: '아르헨티나', offset: -3, continent: 'SouthAmerica' },
    { timezone: 'America/Santiago', city: '산티아고', country: '칠레', offset: -3, continent: 'SouthAmerica' },
    { timezone: 'America/Lima', city: '리마', country: '페루', offset: -5, continent: 'SouthAmerica' },
    { timezone: 'America/Bogota', city: '보고타', country: '콜롬비아', offset: -5, continent: 'SouthAmerica' },
    { timezone: 'America/Caracas', city: '카라카스', country: '베네수엘라', offset: -4, continent: 'SouthAmerica' },
    { timezone: 'America/La_Paz', city: '라파스', country: '볼리비아', offset: -4, continent: 'SouthAmerica' },
    { timezone: 'America/Montevideo', city: '몬테비데오', country: '우루과이', offset: -3, continent: 'SouthAmerica' },
  
    // 아프리카
    { timezone: 'Africa/Cairo', city: '카이로', country: '이집트', offset: 2, continent: 'Africa' },
    { timezone: 'Africa/Lagos', city: '라고스', country: '나이지리아', offset: 1, continent: 'Africa' },
    { timezone: 'Africa/Nairobi', city: '나이로비', country: '케냐', offset: 3, continent: 'Africa' },
    { timezone: 'Africa/Johannesburg', city: '요하네스버그', country: '남아공', offset: 2, continent: 'Africa' },
    { timezone: 'Africa/Cape_Town', city: '케이프타운', country: '남아공', offset: 2, continent: 'Africa' },
    { timezone: 'Africa/Casablanca', city: '카사블랑카', country: '모로코', offset: 1, continent: 'Africa' },
    { timezone: 'Africa/Tunis', city: '튀니스', country: '튀니지', offset: 1, continent: 'Africa' },
    { timezone: 'Africa/Algiers', city: '알제', country: '알제리', offset: 1, continent: 'Africa' },
    { timezone: 'Africa/Addis_Ababa', city: '아디스아바바', country: '에티오피아', offset: 3, continent: 'Africa' },
    { timezone: 'Africa/Dar_es_Salaam', city: '다르에스살람', country: '탄자니아', offset: 3, continent: 'Africa' },
  
    // 오세아니아
    { timezone: 'Australia/Sydney', city: '시드니', country: '호주', offset: 10, continent: 'Oceania' },
    { timezone: 'Australia/Melbourne', city: '멜버른', country: '호주', offset: 10, continent: 'Oceania' },
    { timezone: 'Australia/Brisbane', city: '브리즈번', country: '호주', offset: 10, continent: 'Oceania' },
    { timezone: 'Australia/Perth', city: '퍼스', country: '호주', offset: 8, continent: 'Oceania' },
    { timezone: 'Australia/Adelaide', city: '애들레이드', country: '호주', offset: 9.5, continent: 'Oceania' },
    { timezone: 'Australia/Darwin', city: '다윈', country: '호주', offset: 9.5, continent: 'Oceania' },
    { timezone: 'Pacific/Auckland', city: '오클랜드', country: '뉴질랜드', offset: 12, continent: 'Oceania' },
    { timezone: 'Pacific/Wellington', city: '웰링턴', country: '뉴질랜드', offset: 12, continent: 'Oceania' },
    { timezone: 'Pacific/Fiji', city: '수바', country: '피지', offset: 12, continent: 'Oceania' },
    { timezone: 'Pacific/Tahiti', city: '타히티', country: '프랑스령 폴리네시아', offset: -10, continent: 'Oceania' },
    { timezone: 'Pacific/Guam', city: '괌', country: '괌', offset: 10, continent: 'Oceania' },
  ];
  
  export const CONTINENT_NAMES = {
    'Asia': '아시아',
    'Europe': '유럽', 
    'NorthAmerica': '북미',
    'SouthAmerica': '남미',
    'Africa': '아프리카',
    'Oceania': '오세아니아'
  } as const;
  
  export const CONTINENTS = ['전체', '아시아', '유럽', '북미', '남미', '아프리카', '오세아니아'] as const;
  
  // 대륙별 시간대 필터링 함수
  export const getTimezonesByContinent = (continent: string): TimezoneOption[] => {
    if (continent === '전체') {
      return TIMEZONES;
    }
  
    const continentMap: { [key: string]: string } = {
      '아시아': 'Asia',
      '유럽': 'Europe',
      '북미': 'NorthAmerica',
      '남미': 'SouthAmerica',
      '아프리카': 'Africa',
      '오세아니아': 'Oceania'
    };
  
    const englishContinent = continentMap[continent];
    if (!englishContinent) return [];
  
    return TIMEZONES.filter(timezone => timezone.continent === englishContinent);
  };
  
  // 기본 세계시계 설정 (서울 제거)
  export const DEFAULT_WORLD_CLOCKS = [
    {
      id: '1',
      timezone: 'America/New_York',
      city: '뉴욕',
      country: '미국',
      offset: -5
    },
    {
      id: '2',
      timezone: 'Europe/London',
      city: '런던',
      country: '영국',
      offset: 0
    }
  ];