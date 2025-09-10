const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID;
const GMAIL_REDIRECT_URI = import.meta.env.VITE_GMAIL_REDIRECT_URI;
const OUTLOOK_CLIENT_ID = import.meta.env.VITE_OUTLOOK_CLIENT_ID;
const OUTLOOK_REDIRECT_URI = import.meta.env.VITE_OUTLOOK_REDIRECT_URI;

class OAuthService {
  // Gmail OAuth
  initiateGmailAuth() {
    const scope = 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GMAIL_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GMAIL_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  }

  // Outlook OAuth
  initiateOutlookAuth() {
    const scope = 'https://graph.microsoft.com/mail.read https://graph.microsoft.com/mail.send https://graph.microsoft.com/user.read';
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${OUTLOOK_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(OUTLOOK_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_mode=query`;
    
    window.location.href = authUrl;
  }

  // Extract authorization code from URL
  getAuthCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }

  // Check if current URL contains OAuth callback
  isOAuthCallback() {
    return window.location.search.includes('code=');
  }
}

export default new OAuthService();