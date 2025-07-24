import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../context/ThemeContext';

const ThemeSettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { theme, themeMode, availableThemes, setTheme, isSystemDark } = useTheme();

  const renderThemeOption = (themeOption: Theme) => {
    const isSelected = theme.id === themeOption.id || 
      (themeMode === 'auto' && ((isSystemDark && themeOption.id === 'dark') || (!isSystemDark && themeOption.id === 'light')));

    return (
      <TouchableOpacity
        key={themeOption.id}
        style={[
          styles.themeOption,
          { 
            backgroundColor: theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => setTheme(themeOption.id as any)}
      >
        <View style={styles.themeHeader}>
          <View
            style={[
              styles.themePreview,
              { backgroundColor: themeOption.colors.background }
            ]}
          >
            <View
              style={[
                styles.themePreviewSurface,
                { backgroundColor: themeOption.colors.surface }
              ]}
            >
              <View
                style={[
                  styles.themePreviewPrimary,
                  { backgroundColor: themeOption.colors.primary }
                ]}
              />
              <View
                style={[
                  styles.themePreviewText,
                  { backgroundColor: themeOption.colors.text }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.themeInfo}>
            <Text style={[styles.themeName, { color: theme.colors.text }]}>
              {themeOption.name}
            </Text>
            <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
              {themeOption.isDark ? '다크 테마' : '라이트 테마'}
            </Text>
          </View>
          
          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.selectedIcon}>✓</Text>
            </View>
          )}
        </View>

        {/* 테마 색상 팔레트 */}
        <View style={styles.colorPalette}>
          <View style={[styles.colorSwatch, { backgroundColor: themeOption.colors.primary }]} />
          <View style={[styles.colorSwatch, { backgroundColor: themeOption.colors.accent }]} />
          <View style={[styles.colorSwatch, { backgroundColor: themeOption.colors.success }]} />
          <View style={[styles.colorSwatch, { backgroundColor: themeOption.colors.warning }]} />
          <View style={[styles.colorSwatch, { backgroundColor: themeOption.colors.error }]} />
        </View>
      </TouchableOpacity>
    );
  };

  const autoThemeOption = (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { 
          backgroundColor: theme.colors.card,
          borderColor: themeMode === 'auto' ? theme.colors.primary : theme.colors.border,
          borderWidth: themeMode === 'auto' ? 2 : 1,
        }
      ]}
      onPress={() => setTheme('auto')}
    >
      <View style={styles.themeHeader}>
        <View style={styles.autoThemePreview}>
          {/* 반반으로 나뉜 라이트/다크 프리뷰 */}
          <View style={styles.autoThemeHalf}>
            <View
              style={[
                styles.autoThemeSection,
                { backgroundColor: '#FFFFFF' }
              ]}
            />
          </View>
          <View style={styles.autoThemeHalf}>
            <View
              style={[
                styles.autoThemeSection,
                { backgroundColor: '#121212' }
              ]}
            />
          </View>
        </View>
        
        <View style={styles.themeInfo}>
          <Text style={[styles.themeName, { color: theme.colors.text }]}>
            시스템 설정 따라가기
          </Text>
          <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
            현재: {isSystemDark ? '다크 모드' : '라이트 모드'}
          </Text>
        </View>
        
        {themeMode === 'auto' && (
          <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.selectedIcon}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>테마 설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 자동 테마 옵션 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🤖 자동 테마
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            시스템 설정에 따라 자동으로 테마가 변경됩니다
          </Text>
          {autoThemeOption}
        </View>

        {/* 라이트 테마들 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ☀️ 라이트 테마
          </Text>
          {availableThemes
            .filter(t => !t.isDark)
            .map(renderThemeOption)
          }
        </View>

        {/* 다크 테마들 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🌙 다크 테마
          </Text>
          {availableThemes
            .filter(t => t.isDark)
            .map(renderThemeOption)
          }
        </View>

        {/* 테마 정보 */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              💡 테마 정보
            </Text>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              • 시스템 설정 따라가기: 디바이스의 다크 모드 설정에 따라 자동 변경{'\n'}
              • OLED 다크: 완전한 검은색으로 배터리 절약 효과{'\n'}
              • 커스텀 테마: 다양한 색상 조합으로 개성 표현{'\n'}
              • 설정은 자동으로 저장되며 앱 재시작 시에도 유지됩니다
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  themeOption: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themePreview: {
    width: 50,
    height: 40,
    borderRadius: 8,
    padding: 4,
    marginRight: 16,
  },
  themePreviewSurface: {
    flex: 1,
    borderRadius: 4,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themePreviewPrimary: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  themePreviewText: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  autoThemePreview: {
    width: 50,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginRight: 16,
  },
  autoThemeHalf: {
    flex: 1,
  },
  autoThemeSection: {
    flex: 1,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ThemeSettingsScreen; 