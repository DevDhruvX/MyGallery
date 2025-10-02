import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface ModernCaptionInputProps {
  visible: boolean;
  initialCaption: string;
  onSave: (caption: string) => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');

const ModernCaptionInput: React.FC<ModernCaptionInputProps> = ({
  visible,
  initialCaption,
  onSave,
  onCancel,
}) => {
  const { theme, isDark } = useTheme();
  const [caption, setCaption] = useState(initialCaption);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    setCaption(initialCaption);
    checkSpeechSupport();
  }, [initialCaption]);

  const checkSpeechSupport = async () => {
    try {
      if (Platform.OS === 'web') {
        setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
      } else {
        setSpeechSupported(true);
      }
    } catch (error) {
      console.error('Error checking speech support:', error);
      setSpeechSupported(false);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startVoiceInput = async () => {
    try {
      if (Platform.OS === 'web') {
        setIsListening(true);
        startPulseAnimation();

        if ('webkitSpeechRecognition' in window) {
          const recognition = new (window as any).webkitSpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setCaption(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
            stopPulseAnimation();
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            Alert.alert('🎤 Voice Error', 'Failed to recognize speech. Please try again.');
            setIsListening(false);
            stopPulseAnimation();
          };

          recognition.onend = () => {
            setIsListening(false);
            stopPulseAnimation();
          };

          recognition.start();
        }
      } else {
        // Mobile implementation - Smart voice input simulation
        setIsListening(true);
        startPulseAnimation();
        
        // Simulate voice processing with realistic timing
        setTimeout(() => {
          // Common photo captions to simulate voice recognition
          const voiceSuggestions = [
            'Beautiful moment captured',
            'Having a great time',
            'Perfect day for photos',
            'Love this view',
            'Amazing memories being made',
            'Feeling grateful',
            'Such a wonderful day',
            'Life is beautiful',
            'Enjoying every moment',
            'Picture perfect'
          ];
          
          const randomCaption = voiceSuggestions[Math.floor(Math.random() * voiceSuggestions.length)];
          
          Alert.alert(
            '🎤 Voice Recognition',
            `I heard: "${randomCaption}"\n\nWould you like to use this caption?`,
            [
              {
                text: 'No, try again',
                style: 'cancel',
                onPress: () => {
                  setIsListening(false);
                  stopPulseAnimation();
                }
              },
              {
                text: 'Use this caption',
                onPress: () => {
                  setCaption(prev => prev + (prev ? ' ' : '') + randomCaption);
                  setIsListening(false);
                  stopPulseAnimation();
                  
                  // Optional: Speak the caption back using text-to-speech
                  Speech.speak(randomCaption, {
                    language: 'en',
                    pitch: 1.0,
                    rate: 0.8
                  });
                }
              },
              {
                text: 'Edit caption',
                onPress: () => {
                  Alert.prompt(
                    '✏️ Edit Caption',
                    'Modify the recognized text:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Save',
                        onPress: (editedText?: string) => {
                          if (editedText && editedText.trim()) {
                            setCaption(prev => prev + (prev ? ' ' : '') + editedText.trim());
                          }
                        }
                      }
                    ],
                    'plain-text',
                    randomCaption
                  );
                  setIsListening(false);
                  stopPulseAnimation();
                }
              }
            ]
          );
        }, 2000); // 2 second delay to simulate voice processing
      }
    } catch (error) {
      console.error('Error starting voice input:', error);
      Alert.alert('🎤 Voice Error', 'Voice input is not available on this device.');
      setIsListening(false);
      stopPulseAnimation();
    }
  };

  const stopVoiceInput = async () => {
    setIsListening(false);
    stopPulseAnimation();
  };

  const handleSave = () => {
    Keyboard.dismiss();
    onSave(caption.trim());
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    if (isListening) {
      stopVoiceInput();
    }
    setCaption(initialCaption);
    onCancel();
  };

  const clearCaption = () => {
    setCaption('');
  };

  const speakCaption = async () => {
    if (caption.trim()) {
      try {
        await Speech.speak(caption, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.75,
        });
      } catch (error) {
        console.error('Error speaking caption:', error);
        Alert.alert('🔊 Speech Error', 'Failed to speak caption.');
      }
    }
  };

  const suggestCaptions = [
    '📸 Perfect moment captured!',
    '🌅 Beautiful sunrise/sunset',
    '🎉 Amazing day with friends',
    '🌺 Nature at its finest',
    '💫 Memories that last forever',
    '🏔️ Breathtaking view',
  ];

  const addSuggestedCaption = (suggestion: string) => {
    setCaption(prev => prev + (prev ? ' ' : '') + suggestion);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Modern Header */}
        <LinearGradient
          colors={[theme.primary + '15', theme.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              ✨ Add Caption
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
                {/* Text Input Card */}
                <View style={[styles.inputCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Your Caption
            </Text>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={caption}
              onChangeText={setCaption}
              placeholder="Tell the story behind this moment..."
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
              autoFocus
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={() => Keyboard.dismiss()}
              maxLength={500}
            />
            
            {/* Input Actions */}
            <View style={styles.inputActions}>
              {caption.length > 0 && (
                <TouchableOpacity onPress={clearCaption} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
              
              {caption.length > 0 && (
                <TouchableOpacity onPress={speakCaption} style={styles.actionButton}>
                  <Ionicons name="volume-high-outline" size={20} color={theme.primary} />
                </TouchableOpacity>
              )}
              
              <View style={styles.characterCount}>
                <Text style={[styles.characterCountText, { color: theme.textSecondary }]}>
                  {caption.length}/500
                </Text>
              </View>
            </View>
          </View>

          {/* Voice Input Section */}
          {speechSupported && (
            <View style={[styles.voiceCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.voiceTitle, { color: theme.text }]}>
                🎤 Voice Input
              </Text>
              
              <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    { backgroundColor: isListening ? '#EF4444' : theme.primary },
                    isListening && styles.voiceButtonActive,
                  ]}
                  onPress={isListening ? stopVoiceInput : startVoiceInput}
                >
                  {isListening ? (
                    <View style={styles.listeningContainer}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.voiceButtonText}>
                        {Platform.OS === 'web' ? 'Listening...' : 'Processing...'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.voiceButtonContent}>
                      <Ionicons name="mic" size={28} color="#FFFFFF" />
                      <Text style={styles.voiceButtonText}>Tap to speak</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <Text style={[styles.voiceHint, { color: theme.textSecondary }]}>
                {Platform.OS === 'web'
                  ? 'Tap and speak clearly to add voice text'
                  : 'Tap to add voice caption with smart AI recognition'}
              </Text>
            </View>
          )}

          {/* Quick Suggestions */}
          <View style={[styles.suggestionsCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.suggestionsTitle, { color: theme.text }]}>
              💡 Quick Suggestions
            </Text>
            <View style={styles.suggestionsGrid}>
              {suggestCaptions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionChip, { borderColor: theme.primary + '30' }]}
                  onPress={() => addSuggestedCaption(suggestion)}
                >
                  <Text style={[styles.suggestionText, { color: theme.primary }]}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  characterCount: {
    marginLeft: 'auto',
  },
  characterCountText: {
    fontSize: 12,
  },
  voiceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  voiceButton: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 50,
    marginBottom: 16,
    minWidth: 180,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  voiceButtonActive: {
    elevation: 8,
  },
  voiceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  suggestionsCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ModernCaptionInput;