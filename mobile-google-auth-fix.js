// Mobile Google Auth Fix for ResponsiveLoginScreen.tsx
// Replace the handleGoogleSignIn function with this implementation

const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);
    console.log('🔵 Starting Google sign-in...');
    console.log('🔵 Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      // Web: Use Supabase OAuth directly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      console.log('🟢 Web Google sign-in initiated');
    } else {
      // Mobile: Use expo-auth-session for proper mobile flow
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'mygallery',
        path: 'auth',
      });
      
      console.log('🔵 Mobile redirect URI:', redirectUri);
      
      // Create the Google OAuth URL that will redirect back to your app
      const authUrl = `https://zjciguygyrnwceymvsfn.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;
      
      console.log('🔵 Opening mobile auth URL:', authUrl);
      
      // Use WebBrowser.openAuthSessionAsync for proper mobile OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      
      console.log('🔵 Mobile auth result:', result);
      
      if (result.type === 'success' && result.url) {
        console.log('🟢 Mobile auth successful, processing callback...');
        
        // Parse the callback URL to extract tokens
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken) {
          console.log('🟢 Setting Supabase session with tokens...');
          
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) throw error;
          
          console.log('🟢 Mobile Google sign-in completed successfully!');
          Alert.alert('✅ Success', 'Signed in with Google successfully!');
        } else {
          throw new Error('No access token received from Google');
        }
      } else if (result.type === 'cancel') {
        console.log('🟡 User cancelled Google auth');
        return; // Don't show error for cancellation
      } else {
        throw new Error('Google authentication failed');
      }
    }
  } catch (error: any) {
    console.error('🔴 Google Sign-In Error:', error);
    Alert.alert(
      'Authentication Error',
      `Failed to sign in with Google: ${error.message || 'Unknown error'}`
    );
  } finally {
    setIsLoading(false);
  }
};