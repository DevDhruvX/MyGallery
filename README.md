# MyGallery - Advanced Photo Organization App

<div align="center">
  <img src="./assets/images/icon.png" alt="MyGallery Logo" width="120" height="120">
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-SDK%2050-black.svg)](https://expo.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
  
  [![GitHub issues](https://img.shields.io/github/issues/DevDhruvX/MyGallery)](https://github.com/DevDhruvX/MyGallery/issues)
  [![GitHub stars](https://img.shields.io/github/stars/DevDhruvX/MyGallery)](https://github.com/DevDhruvX/MyGallery/stargazers)
  [![GitHub license](https://img.shields.io/github/license/DevDhruvX/MyGallery)](https://github.com/DevDhruvX/MyGallery/blob/main/LICENSE)
  [![GitHub release](https://img.shields.io/github/v/release/DevDhruvX/MyGallery)](https://github.com/DevDhruvX/MyGallery/releases)
</div>

A modern, feature-rich React Native gallery app with advanced photo organization, cloud backup, and seamless cross-platform experience. Built with Expo and Supabase for production-ready deployment.

## 🌟 Key Features

### 📸 **Photo Management**

- **Camera Integration**: Take photos directly within the app
- **Gallery Import**: Import existing photos from device gallery
- **Smart Organization**: Intuitive photo management and viewing
- **Full-Screen Viewer**: Immersive photo viewing experience

### 📁 **Advanced Folder System**

- **Custom Folders**: Create folders with custom names, colors, and icons
- **Drag & Drop**: Move photos between folders effortlessly
- **Smart Filtering**: View photos by folder or show all unorganized photos
- **Visual Hierarchy**: Color-coded folders with meaningful icons

### ☁️ **Cloud Backup & Sync**

- **Hybrid Storage**: Local-first with cloud backup using Supabase
- **Real-time Sync**: Automatic synchronization across devices
- **Offline Support**: Full functionality without internet connection
- **Recycle Bin**: Restore accidentally deleted photos

### 🎨 **Modern User Experience**

- **Responsive Design**: Optimized for all screen sizes
- **Dark/Light Themes**: Automatic theme switching
- **Smooth Animations**: 60fps performance throughout
- **Search Functionality**: Find photos by captions instantly

### 🔐 **Security & Privacy**

- **User Authentication**: Secure login with Supabase Auth
- **Data Encryption**: Secure data transmission and storage
- **Privacy Controls**: Your photos, your control
- **Environment-based Configuration**: Secure API key management

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **Expo CLI**: `npm install -g @expo/cli`
- **Supabase Account**: [Create free account](https://supabase.com)
- **Development Environment**: iOS Simulator, Android Emulator, or Expo Go app

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/MyGallery.git
cd MyGallery
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

```bash
cp .env.example .env
```

4. **Configure Supabase**
   - Create a new project in [Supabase Dashboard](https://app.supabase.com)
   - Copy your project URL and anon key to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_ENV=development
```

5. **Database Setup**

   - Go to SQL Editor in Supabase Dashboard
   - Create the required tables (see [Database Schema](#database-schema))

6. **Start Development Server**

```bash
npx expo start
```

## 📱 Platform-Specific Setup

### 🤖 Android

```bash
# Install Android Studio and set up emulator
# Then run:
npx expo start --android
```

### 🍎 iOS

```bash
# Install Xcode (macOS only)
# Then run:
npx expo start --ios
```

### 🌐 Web

```bash
npx expo start --web
```

### 📲 Physical Device

1. Install **Expo Go** from App Store/Play Store
2. Scan QR code from `npx expo start`

## 🏗️ Architecture & Design Choices

### **Tech Stack Rationale**

| Technology              | Why Chosen                                          | Trade-offs                          |
| ----------------------- | --------------------------------------------------- | ----------------------------------- |
| **React Native + Expo** | Rapid development, cross-platform, great ecosystem  | Limited native modules, bundle size |
| **Supabase**            | Full-stack solution, real-time features, PostgreSQL | Vendor lock-in, learning curve      |
| **TypeScript**          | Type safety, better developer experience            | Additional compilation step         |
| **React Navigation**    | Industry standard, flexible routing                 | Complex deep linking setup          |
| **AsyncStorage**        | Simple, fast local storage                          | Limited storage capacity            |

### **Design Patterns**

#### **Hybrid Storage Strategy**

```
Local Storage (Primary) → Cloud Backup (Secondary)
- Immediate response for users
- Offline-first functionality
- Background sync when online
```

#### **Component Architecture**

```
Screens/ → Business Logic
Components/ → Reusable UI Elements
Utils/ → Shared Services
Context/ → Global State Management
```

#### **Folder System Design**

- **Local-first**: Folders stored locally for instant access
- **Visual Customization**: 10 colors × 15 icons = 150 combinations
- **Smart Organization**: "All Photos" view for unorganized content

## ⚖️ Trade-offs & Limitations

### **Current Limitations**

1. **Storage Limits**: Dependent on device storage and Supabase limits
2. **Offline Sync**: Large files may delay sync when back online
3. **Platform Differences**: Some features may vary between iOS/Android
4. **File Formats**: Currently supports common image formats (JPG, PNG)

### **Design Trade-offs**

1. **Performance vs Features**: Chose smooth UX over advanced editing features
2. **Simplicity vs Customization**: Limited folder customization for ease of use
3. **Security vs Convenience**: Automatic login vs manual authentication
4. **Bundle Size vs Functionality**: Included essential features only

## 🎁 Bonus Features Implemented

### ✨ **Advanced Features**

- [x] **Smart Folder Management**: Visual folder creation with colors/icons
- [x] **Hybrid Cloud Sync**: Best of local and cloud storage
- [x] **Responsive UI**: Works perfectly on tablets and phones
- [x] **Theme System**: Automatic dark/light mode switching
- [x] **Search & Filter**: Real-time photo search capabilities
- [x] **Recycle Bin**: Photo recovery system
- [x] **Production Ready**: Environment-based configuration

### 🚀 **Performance Optimizations**

- [x] **Image Caching**: Efficient memory management
- [x] **Lazy Loading**: Load images on demand
- [x] **Background Sync**: Non-blocking cloud operations
- [x] **Smooth Animations**: 60fps throughout the app

## 📱 Build for Production

### **EAS Build (Recommended)**

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### **Classic Build**

```bash
# Android APK
npx expo build:android --type apk

# iOS Archive
npx expo build:ios

# Web Bundle
npx expo export:web
```

## 🗄️ Database Schema

<details>
<summary>Click to view SQL schema</summary>

```sql
-- Gallery Items Table
CREATE TABLE gallery_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  folder_id TEXT,
  is_deleted_locally BOOLEAN DEFAULT FALSE,
  is_permanently_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own items" ON gallery_items
  FOR ALL USING (auth.uid() = user_id);
```

</details>

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npx tsc --noEmit

# Linting
npx eslint . --ext .ts,.tsx
```

## 📂 Project Structure

```
MyGallery/
├── app/                      # App router (Expo Router)
├── assets/                   # Images, fonts, static files
├── components/               # Reusable UI components
│   ├── CreateFolderModal.tsx
│   ├── FolderGrid.tsx
│   └── ...
├── constants/                # App constants, themes
├── context/                  # React Context providers
├── navigation/               # Navigation configuration
├── screens/                  # App screens
│   ├── ModernGalleryScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ...
├── utils/                    # Utilities, services
│   ├── folderStorage.ts
│   ├── backupStorageService.ts
│   └── ...
├── .env.example             # Environment template
├── app.json                 # Expo configuration
└── package.json             # Dependencies
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Roadmap

### **Known Issues**

- Large image uploads may timeout on slow connections
- iOS simulator may have performance differences from real device

### **Future Enhancements**

- [ ] Video support
- [ ] Advanced photo editing
- [ ] Social sharing features
- [ ] AI-powered photo tagging
- [ ] Multi-device real-time sync

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/MyGallery/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/MyGallery/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/MyGallery/wiki)

---

<div align="center">
  <strong>Made with ❤️ using React Native and Expo</strong>
  <br>
  <em>A modern solution for photo organization and cloud backup</em>
</div>
