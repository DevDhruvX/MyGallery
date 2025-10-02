# Production Deployment Guide

## 🔒 Security Checklist

### Environment Configuration

- [x] Supabase keys moved to environment variables
- [x] .env files added to .gitignore
- [x] Debug logging disabled in production
- [x] Development files removed

### Pre-Deployment Steps

1. **Update app.json for production:**

```json
{
  "expo": {
    "name": "MyGallery",
    "slug": "mygallery",
    "version": "1.0.0",
    "orientation": "portrait",
    "privacy": "public",
    "platforms": ["ios", "android"],
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

2. **Verify environment variables:**

```bash
# Check your .env file
cat .env
```

3. **Build for production:**

```bash
# Android APK
npx expo build:android --type apk

# Android AAB (for Play Store)
npx expo build:android --type app-bundle

# iOS (requires Apple Developer account)
npx expo build:ios
```

## 🚀 Deployment Options

### Expo Application Services (EAS)

```bash
npm install -g @expo/eas-cli
eas login
eas build --platform android
eas submit --platform android
```

### Manual Build

```bash
npx expo export --public-url https://your-cdn.com
```

## 📱 Store Submission

### Google Play Store

1. Generate signed AAB
2. Upload to Play Console
3. Fill store listing
4. Submit for review

### Apple App Store

1. Generate IPA with valid certificate
2. Upload via App Store Connect
3. Fill app information
4. Submit for review

## 🔍 Final Checks

- [ ] All API keys are environment variables
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] App icon and splash screen are optimized
- [ ] App permissions are correctly configured
- [ ] Database RLS policies are secure
- [ ] Backup functionality is tested
- [ ] Performance is optimized

## 📊 Monitoring

Consider adding:

- Crash reporting (Sentry, Bugsnag)
- Analytics (Expo Analytics, Firebase)
- Performance monitoring
- User feedback system

---

Your app is now production-ready! 🎉
