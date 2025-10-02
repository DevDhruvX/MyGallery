import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ThemeSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({ visible, onClose }) => {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(themeMode);

  const themeOptions = [
    {
      id: 'auto',
      title: 'Auto',
      subtitle: 'Follow system setting',
      icon: 'phone-portrait',
      description: 'Automatically switches between light and dark based on your device settings'
    },
    {
      id: 'light',
      title: 'Light',
      subtitle: 'Always light theme',
      icon: 'sunny',
      description: 'Clean, bright interface perfect for daytime use'
    },
    {
      id: 'dark',
      title: 'Dark',
      subtitle: 'Always dark theme',
      icon: 'moon',
      description: 'Eye-friendly dark interface perfect for low-light environments'
    }
  ];

  const handleThemeSelect = (themeId: 'light' | 'dark' | 'auto') => {
    setSelectedTheme(themeId);
    setThemeMode(themeId);
  };

  const ThemeOption = ({ option }: { option: typeof themeOptions[0] }) => {
    const isSelected = selectedTheme === option.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleThemeSelect(option.id as any)}
      >
        <View style={styles.themeOptionContent}>
          <View style={[
            styles.themeIconContainer,
            {
              backgroundColor: isSelected ? theme.primary + '20' : theme.backgroundSecondary
            }
          ]}>
            <Ionicons
              name={option.icon as any}
              size={24}
              color={isSelected ? theme.primary : theme.textSecondary}
            />
          </View>
          
          <View style={styles.themeTextContainer}>
            <Text style={[
              styles.themeTitle,
              {
                color: theme.text,
                fontWeight: isSelected ? '600' : '500'
              }
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.themeSubtitle,
              { color: theme.textSecondary }
            ]}>
              {option.subtitle}
            </Text>
            <Text style={[
              styles.themeDescription,
              { color: theme.textTertiary }
            ]}>
              {option.description}
            </Text>
          </View>
          
          {isSelected && (
            <View style={[
              styles.selectedIndicator,
              { backgroundColor: theme.primary }
            ]}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Theme Settings
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Choose your preferred appearance
            </Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.currentThemePreview}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Current Theme
            </Text>
            <View style={[
              styles.previewCard,
              { backgroundColor: theme.surface }
            ]}>
              <Text style={[styles.previewText, { color: theme.text }]}>
                {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Text>
              <Text style={[styles.previewSubtext, { color: theme.textSecondary }]}>
                Currently active theme
              </Text>
            </View>
          </View>

          <View style={styles.themeOptions}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Theme Options
            </Text>
            {themeOptions.map((option) => (
              <ThemeOption key={option.id} option={option} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    width: 60,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 60,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentThemePreview: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSubtext: {
    fontSize: 14,
  },
  themeOptions: {
    flex: 1,
  },
  themeOption: {
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  themeSubtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeSettingsModal;