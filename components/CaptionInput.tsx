import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CaptionInputProps {
  visible: boolean;
  initialCaption: string;
  onSave: (caption: string) => void;
  onCancel: () => void;
}

const CaptionInput: React.FC<CaptionInputProps> = ({
  visible,
  initialCaption,
  onSave,
  onCancel,
}) => {
  const [caption, setCaption] = useState(initialCaption);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setCaption(initialCaption);
    checkSpeechSupport();
  }, [initialCaption]);

  const checkSpeechSupport = async () => {
    try {
      // Check if speech is available on the platform
      if (Platform.OS === 'web') {
        // Check for Web Speech API support
        setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
      } else {
        // For mobile, we'll use a simulated voice input for now
        // In a real app, you'd use expo-speech or react-native-voice
        setSpeechSupported(true);
      }
    } catch (error) {
      console.error('Error checking speech support:', error);
      setSpeechSupported(false);
    }
  };

  const startVoiceInput = async () => {
    try {
      setIsListening(true);

      if (Platform.OS === 'web') {
        // Web Speech API implementation
        if ('webkitSpeechRecognition' in window) {
          const recognition = new (window as any).webkitSpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setCaption(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            Alert.alert('Error', 'Failed to recognize speech. Please try again.');
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
        } else {
          throw new Error('Speech recognition not supported');
        }
      } else {
        // Mobile platforms - simulate voice input for now
        // In a real implementation, you would use react-native-voice or similar
        setTimeout(() => {
          Alert.alert(
            'Voice Input Simulation',
            'This is a simulated voice input. In a real app, this would use the device microphone.',
            [
              {
                text: 'Add Sample Text',
                onPress: () => {
                  setCaption(prev => prev + (prev ? ' ' : '') + 'Beautiful sunset at the beach');
                  setIsListening(false);
                },
              },
              {
                text: 'Cancel',
                onPress: () => setIsListening(false),
                style: 'cancel',
              },
            ]
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error starting voice input:', error);
      Alert.alert('Error', 'Voice input is not available on this device.');
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
  };

  const handleSave = () => {
    onSave(caption.trim());
  };

  const handleCancel = () => {
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
        Alert.alert('Error', 'Failed to speak caption.');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Caption</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton]}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Text Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Enter caption or use voice input..."
              multiline
              textAlignVertical="top"
              autoFocus
            />
            
            {/* Input Actions */}
            <View style={styles.inputActions}>
              {caption.length > 0 && (
                <TouchableOpacity onPress={clearCaption} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color="#666" />
                </TouchableOpacity>
              )}
              
              {caption.length > 0 && (
                <TouchableOpacity onPress={speakCaption} style={styles.actionButton}>
                  <Ionicons name="volume-high-outline" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Voice Input Section */}
          {speechSupported && (
            <View style={styles.voiceSection}>
              <Text style={styles.voiceSectionTitle}>Voice Input</Text>
              
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive,
                ]}
                onPress={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isListening && Platform.OS !== 'web'}
              >
                {isListening ? (
                  <View style={styles.listeningContainer}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.voiceButtonText}>Listening...</Text>
                  </View>
                ) : (
                  <View style={styles.voiceButtonContent}>
                    <Ionicons name="mic" size={24} color="#FFFFFF" />
                    <Text style={styles.voiceButtonText}>Tap to speak</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.voiceHint}>
                {Platform.OS === 'web'
                  ? 'Tap and speak to add text to your caption'
                  : 'Voice input simulation - tap to add sample text'}
              </Text>
            </View>
          )}

          {/* Character Count */}
          <View style={styles.footer}>
            <Text style={styles.characterCount}>
              {caption.length} characters
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    borderRadius: 6,
  },
  saveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    minHeight: 80,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  voiceSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  voiceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  voiceButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
  },
  voiceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listeningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default CaptionInput;