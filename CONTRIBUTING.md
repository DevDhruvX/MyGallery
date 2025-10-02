# Contributing to MyGallery

Thank you for your interest in contributing to MyGallery! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new functionality
- 📝 **Documentation**: Improve guides and documentation
- 🔧 **Code Contributions**: Submit bug fixes and new features
- 🎨 **Design**: UI/UX improvements and suggestions

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/yourusername/MyGallery.git
cd MyGallery

# Add upstream remote
git remote add upstream https://github.com/originaluser/MyGallery.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npx expo start
```

### 3. Create a Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Format code using Prettier
- **Naming Conventions**: Use camelCase for variables, PascalCase for components

### File Structure

```
components/
├── ComponentName.tsx     # Main component file
├── ComponentName.test.tsx # Tests (if applicable)
└── index.ts             # Export file

screens/
├── ScreenName.tsx       # Screen component
└── ScreenName.test.tsx  # Screen tests

utils/
├── utilityName.ts       # Utility functions
└── utilityName.test.ts  # Utility tests
```

### Component Guidelines

```tsx
// Good component structure
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MyComponent;
```

### Testing Guidelines

- Write tests for new functionality
- Maintain or improve test coverage
- Use Jest and React Native Testing Library

```tsx
// Example test
import { render, fireEvent } from "@testing-library/react-native";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    const { getByText } = render(<MyComponent title="Test Title" />);
    expect(getByText("Test Title")).toBeTruthy();
  });
});
```

## 🐛 Bug Reports

### Before Submitting

- Search existing issues to avoid duplicates
- Test on multiple platforms if possible
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- Platform: [iOS/Android/Web]
- Device: [iPhone 12, Pixel 5, etc.]
- OS Version: [iOS 15, Android 12, etc.]
- App Version: [1.0.0]

**Additional context**
Any other context about the problem.
```

## ✨ Feature Requests

### Before Submitting

- Check if the feature already exists
- Consider if it fits the app's scope
- Think about implementation complexity

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Screenshots, mockups, or examples.
```

## 🔧 Code Contributions

### Pull Request Process

1. **Update Documentation**

   - Update README if adding features
   - Add or update code comments
   - Include relevant documentation

2. **Test Your Changes**

   ```bash
   # Run tests
   npm test

   # Type checking
   npx tsc --noEmit

   # Linting
   npx eslint . --ext .ts,.tsx

   # Test on platforms
   npx expo start --ios
   npx expo start --android
   npx expo start --web
   ```

3. **Commit Guidelines**

   ```bash
   # Use conventional commits
   git commit -m "feat: add photo sharing functionality"
   git commit -m "fix: resolve folder creation bug"
   git commit -m "docs: update setup instructions"
   ```

4. **Submit Pull Request**
   - Fill out the PR template
   - Reference related issues
   - Add screenshots for UI changes
   - Request review from maintainers

### PR Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web

## Screenshots (if applicable)

Add screenshots to show the change.

## Checklist

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

## 📱 Platform-Specific Considerations

### iOS

- Test on multiple iOS versions if possible
- Consider iPhone and iPad layouts
- Verify accessibility features work
- Test with iOS-specific features (Face ID, etc.)

### Android

- Test on different Android versions
- Consider various screen sizes and densities
- Test with Android-specific features
- Verify Material Design compliance

### Web

- Test on major browsers (Chrome, Firefox, Safari, Edge)
- Ensure responsive design works
- Test keyboard navigation
- Verify web-specific optimizations

## 🎨 Design Contributions

### UI/UX Guidelines

- Follow the existing design system
- Maintain consistency across platforms
- Consider accessibility (color contrast, font sizes)
- Provide mockups or prototypes for major changes

### Assets

- Use vector graphics when possible
- Provide multiple resolutions for raster images
- Follow platform-specific icon guidelines
- Optimize file sizes

## 📚 Documentation Contributions

### Types of Documentation

- **Code Comments**: Inline documentation
- **README Updates**: Feature descriptions and setup
- **Guides**: Setup, deployment, troubleshooting
- **API Documentation**: Function and component docs

### Documentation Standards

- Use clear, concise language
- Include code examples
- Provide screenshots for UI elements
- Keep information up-to-date

## 🚫 What Not to Contribute

- Breaking changes without discussion
- Features that don't align with app goals
- Code that doesn't follow project standards
- Large refactoring without prior approval
- Dependencies that significantly increase bundle size

## 🏆 Recognition

Contributors will be recognized in:

- README contributors section
- Release notes for significant contributions
- Special mentions in project updates

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Discord/Slack**: Real-time chat (if available)
- **Email**: For private/sensitive matters

## 📄 License

By contributing to MyGallery, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to MyGallery! 🎉 Your efforts help make this project better for everyone.
