# Complete Setup Guide

This comprehensive guide covers setting up MyGallery on iOS, Android, and Web platforms.

## 📋 Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Expo CLI**: v6.0.0 or higher

### Development Tools

#### For iOS Development

- **macOS**: Required for iOS development
- **Xcode**: Latest version from Mac App Store
- **iOS Simulator**: Included with Xcode
- **Apple Developer Account**: For physical device testing and App Store deployment

#### For Android Development

- **Android Studio**: Latest version
- **Android SDK**: API level 33 or higher
- **Android Emulator**: Set up through Android Studio
- **Java Development Kit (JDK)**: v11 or higher

#### For Web Development

- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Web Server**: Built-in with Expo

## 🚀 Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/MyGallery.git
cd MyGallery

# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Supabase credentials
# You can use any text editor:
nano .env
# or
code .env
```

**Environment Variables Required:**

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_DEBUG=true
```

### 3. Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and API Key to `.env`
4. Set up database using [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## 📱 Platform-Specific Setup

### 🤖 Android Setup

#### Option 1: Android Emulator

1. **Install Android Studio**

   ```bash
   # Download from: https://developer.android.com/studio
   ```

2. **Set up Android SDK**

   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install Android 13 (API level 33) or higher
   - Install Android SDK Build-Tools

3. **Create Virtual Device**

   - Open AVD Manager in Android Studio
   - Create new virtual device (recommended: Pixel 7)
   - Start the emulator

4. **Run the app**
   ```bash
   npx expo start --android
   ```

#### Option 2: Physical Android Device

1. **Enable Developer Mode**

   - Go to Settings → About phone
   - Tap "Build number" 7 times
   - Go back to Settings → Developer options
   - Enable "USB Debugging"

2. **Install Expo Go**

   - Download from Google Play Store
   - Connect device via USB or same WiFi

3. **Run the app**
   ```bash
   npx expo start
   # Scan QR code with Expo Go app
   ```

### 🍎 iOS Setup

#### Option 1: iOS Simulator (macOS only)

1. **Install Xcode**

   ```bash
   # Download from Mac App Store
   # Requires macOS and Apple ID
   ```

2. **Accept Xcode License**

   ```bash
   sudo xcodebuild -license accept
   ```

3. **Run the app**
   ```bash
   npx expo start --ios
   ```

#### Option 2: Physical iOS Device

1. **Install Expo Go**

   - Download from App Store

2. **Run the app**
   ```bash
   npx expo start
   # Scan QR code with Camera app (iOS 11+) or Expo Go
   ```

### 🌐 Web Setup

**No additional setup required!**

```bash
# Start web development server
npx expo start --web

# Or access directly
npx expo export:web
```

## 🛠️ Development Workflow

### Starting Development

```bash
# Start development server
npx expo start

# Platform-specific start
npx expo start --ios
npx expo start --android
npx expo start --web

# Clear cache if needed
npx expo start --clear
```

### Code Quality Tools

```bash
# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx --fix

# Formatting
npx prettier --write .
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🏗️ Building for Production

### Pre-build Checklist

- [ ] Update version in `app.json`
- [ ] Set `EXPO_PUBLIC_ENV=production` in `.env`
- [ ] Test on all target platforms
- [ ] Verify all environment variables
- [ ] Run production build locally

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Initialize EAS
eas build:configure

# Build for specific platform
eas build --platform android
eas build --platform ios
eas build --platform all

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Classic Build

```bash
# Android APK
npx expo build:android --type apk

# Android App Bundle (for Play Store)
npx expo build:android --type app-bundle

# iOS Archive
npx expo build:ios --type archive

# Web build
npx expo export:web
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Metro bundler errors

```bash
# Clear Metro cache
npx expo start --clear

# Reset npm cache
npm start -- --reset-cache
```

#### 2. iOS Simulator issues

```bash
# Reset iOS Simulator
xcrun simctl erase all

# Rebuild iOS app
npx expo run:ios --device
```

#### 3. Android build issues

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Android emulator
emulator -avd YOUR_AVD_NAME -wipe-data
```

#### 4. Environment variable issues

```bash
# Verify environment variables are loaded
npx expo start
# Check terminal output for loaded variables
```

#### 5. Supabase connection issues

- Verify URL and API key in `.env`
- Check Supabase project status
- Ensure RLS policies are configured correctly

### Performance Optimization

#### Development

```bash
# Enable development mode optimizations
export NODE_ENV=development

# Use Flipper for debugging (Android)
npx expo install react-native-flipper
```

#### Production

```bash
# Enable production optimizations
export NODE_ENV=production

# Bundle analysis
npx expo export --dump-assetmap
```

## 📚 Additional Resources

### Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)

### Community

- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)
- [Supabase Discord](https://discord.supabase.com/)

### Tools

- [Expo Snack](https://snack.expo.dev/) - Online playground
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Mobile app debugger

## 🎯 Next Steps

After successful setup:

1. **Explore the App**: Test all features on your target platforms
2. **Customize**: Modify colors, icons, and branding in `constants/theme.ts`
3. **Deploy**: Follow the production build guide above
4. **Monitor**: Set up analytics and crash reporting
5. **Iterate**: Gather feedback and improve the app

---

**Happy coding! 🚀** Your MyGallery app is ready for development and deployment across all platforms.
