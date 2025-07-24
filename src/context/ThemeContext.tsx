import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

console.log('=== ThemeContext.tsx loaded ===');

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Component specific
  tabBackground: string;
  tabActiveBackground: string;
  modalBackground: string;
  shadowColor: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

// Light Theme
const lightTheme: Theme = {
  id: 'light',
  name: '라이트 모드',
  isDark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    
    text: '#212529',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    
    primary: '#007BFF',
    primaryLight: '#66B2FF',
    primaryDark: '#0056B3',
    
    accent: '#17A2B8',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    
    border: '#DEE2E6',
    borderLight: '#E9ECEF',
    
    tabBackground: '#FFFFFF',
    tabActiveBackground: '#F8F9FA',
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    shadowColor: '#000000',
  },
};

// Dark Theme
const darkTheme: Theme = {
  id: 'dark',
  name: '다크 모드',
  isDark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2D2D2D',
    
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    
    primary: '#4FC3F7',
    primaryLight: '#8BF5FF',
    primaryDark: '#0093C4',
    
    accent: '#26C6DA',
    success: '#66BB6A',
    warning: '#FFCA28',
    error: '#EF5350',
    info: '#29B6F6',
    
    border: '#404040',
    borderLight: '#2D2D2D',
    
    tabBackground: '#1E1E1E',
    tabActiveBackground: '#2D2D2D',
    modalBackground: 'rgba(0, 0, 0, 0.8)',
    shadowColor: '#000000',
  },
};

// OLED Dark Theme (완전한 검은색)
const oledTheme: Theme = {
  id: 'oled',
  name: 'OLED 다크',
  isDark: true,
  colors: {
    background: '#000000',
    surface: '#0A0A0A',
    card: '#1A1A1A',
    
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    
    primary: '#00D4AA',
    primaryLight: '#4DFFCC',
    primaryDark: '#00A087',
    
    accent: '#FF6B6B',
    success: '#51CF66',
    warning: '#FFD43B',
    error: '#FF6B6B',
    info: '#74C0FC',
    
    border: '#333333',
    borderLight: '#1A1A1A',
    
    tabBackground: '#000000',
    tabActiveBackground: '#1A1A1A',
    modalBackground: 'rgba(0, 0, 0, 0.9)',
    shadowColor: '#FFFFFF',
  },
};

// 커스텀 테마들
const customThemes = {
  sunset: {
    id: 'sunset',
    name: '선셋',
    isDark: false,
    colors: {
      ...lightTheme.colors,
      primary: '#FF6B35',
      primaryLight: '#FF9F70',
      primaryDark: '#E55A2B',
      accent: '#FFB347',
      background: '#FFF8F0',
      surface: '#FFEDE0',
    },
  } as Theme,
  
  ocean: {
    id: 'ocean',
    name: '오션',
    isDark: false,
    colors: {
      ...lightTheme.colors,
      primary: '#0077BE',
      primaryLight: '#4DA8DA',
      primaryDark: '#005A8B',
      accent: '#00BCD4',
      background: '#F0F8FF',
      surface: '#E6F3FF',
    },
  } as Theme,
  
  forest: {
    id: 'forest',
    name: '포레스트',
    isDark: true,
    colors: {
      ...darkTheme.colors,
      primary: '#4CAF50',
      primaryLight: '#81C784',
      primaryDark: '#2E7D32',
      accent: '#8BC34A',
      background: '#0D1B0D',
      surface: '#1B2F1B',
      card: '#2C5F2C',
    },
  } as Theme,
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
  oled: oledTheme,
  ...customThemes,
};

type ThemeMode = 'light' | 'dark' | 'oled' | 'sunset' | 'ocean' | 'forest' | 'auto';

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  availableThemes: Theme[];
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isSystemDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('=== ThemeProvider loaded ===');
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isSystemDark, setIsSystemDark] = useState<boolean>(false);

  // 시스템 다크 모드 감지
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsSystemDark(colorScheme === 'dark');
    });

    // 초기 시스템 테마 설정
    setIsSystemDark(Appearance.getColorScheme() === 'dark');

    return () => subscription?.remove();
  }, []);

  // 저장된 테마 설정 로드
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme && themes[savedTheme as keyof typeof themes]) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('테마 설정 로드 실패:', error);
    }
  };

  const saveTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('app_theme', mode);
    } catch (error) {
      console.error('테마 설정 저장 실패:', error);
    }
  };

  // 현재 테마 결정
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'auto') {
      return isSystemDark ? themes.dark : themes.light;
    }
    return themes[themeMode] || themes.light;
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await saveTheme(mode);
  };

  const toggleTheme = () => {
    const currentTheme = getCurrentTheme();
    const newMode = currentTheme.isDark ? 'light' : 'dark';
    setTheme(newMode);
  };

  const value: ThemeContextValue = {
    theme: getCurrentTheme(),
    themeMode,
    availableThemes: Object.values(themes),
    setTheme,
    toggleTheme,
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 테마 기반 스타일 생성 헬퍼
export const createThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: Theme) => T
) => {
  return (theme: Theme): T => styleFactory(theme);
};

export default ThemeContext; 