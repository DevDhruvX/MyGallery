# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of MyGallery seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email us at: [your-email@domain.com] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### What to Expect

- **Response Time**: We will acknowledge your report within 48 hours
- **Investigation**: We will investigate and validate the issue
- **Updates**: We will keep you informed of our progress
- **Resolution**: We will work to resolve verified vulnerabilities promptly

### Responsible Disclosure

- We request that you do not publicly disclose the vulnerability until we have had time to address it
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We may offer a token of appreciation for significant discoveries

## Security Best Practices

### For Users
- Keep your app updated to the latest version
- Use strong passwords for your account
- Enable two-factor authentication when available
- Be cautious about granting app permissions

### For Developers
- Follow secure coding practices
- Regularly update dependencies
- Use environment variables for sensitive data
- Implement proper input validation
- Follow the principle of least privilege

## Security Features

MyGallery implements several security measures:

- **Data Encryption**: All data transmission is encrypted using HTTPS/TLS
- **Authentication**: Secure user authentication via Supabase Auth
- **Database Security**: Row-level security (RLS) policies
- **API Security**: Secure API endpoints with proper authorization
- **Environment Variables**: Sensitive configuration stored securely

## Third-Party Security

We rely on trusted third-party services:

- **Supabase**: Enterprise-grade security with SOC 2 compliance
- **Expo**: Secure build and deployment infrastructure
- **React Native**: Regular security updates from Facebook/Meta

Thank you for helping keep MyGallery secure!