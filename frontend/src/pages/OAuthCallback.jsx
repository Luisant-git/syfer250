import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/UI/ToastContainer/ToastContainer';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const success = urlParams.get('success');
      const email = urlParams.get('email');
      
      // Handle backend redirect with success/error
      if (success === 'gmail_connected' && email) {
        showSuccess(`Gmail account (${decodeURIComponent(email)}) connected successfully!`);
        localStorage.removeItem('pendingProvider');
        setTimeout(() => navigate('/campaigns/new'), 2000);
        setProcessing(false);
        return;
      }
      
      if (error) {
        const errorMessages = {
          'no_code': 'No authorization code received',
          'missing_config': 'Server configuration error',
          'token_exchange_failed': 'Failed to exchange authorization code',
          'token_verification_failed': 'Failed to verify OAuth token',
          'oauth_failed': 'OAuth authentication failed'
        };
        showError(errorMessages[error] || 'OAuth authorization failed');
        localStorage.removeItem('pendingProvider');
        setTimeout(() => navigate('/campaigns/new'), 2000);
        setProcessing(false);
        return;
      }
      
      // Fallback: Handle direct code exchange (for POST endpoints)
      if (code) {
        console.log('OAuth code received:', code);
        
        const pendingProvider = localStorage.getItem('pendingProvider');
        
        try {
          let response;
          let providerName = '';
          
          if (pendingProvider === 'gmail') {
            console.log('Processing Gmail OAuth...');
            providerName = 'Gmail';
            response = await apiService.exchangeGmailCode(code);
            console.log('Gmail response:', response);
          } else if (pendingProvider === 'outlook') {
            console.log('Processing Outlook OAuth...');
            providerName = 'Outlook';
            response = await apiService.exchangeOutlookCode(code);
            console.log('Outlook response:', response);
          }
          
          if (response && response.success && response.data.email) {
            const senderData = {
              name: response.data.email.split('@')[0],
              email: response.data.email,
              isVerified: true // OAuth accounts are considered verified
            };
            
            const senderResponse = await apiService.createSender(senderData);
            
            if (senderResponse.success) {
              showSuccess(`${providerName} account connected successfully! Sender added.`);
              
              // Store success message for the next page
              localStorage.setItem('oauthSuccess', `${providerName} sender added successfully`);
            } else {
              throw new Error(senderResponse.error || 'Failed to create sender');
            }
          } else {
            throw new Error('Failed to get email from OAuth response');
          }
          
          localStorage.removeItem('pendingProvider');
          
          // Navigate after showing success message
          setTimeout(() => {
            navigate('/campaigns/new');
          }, 2000);
          
        } catch (error) {
          console.error('OAuth error:', error);
          showError(error.message || 'Failed to connect email account');
          localStorage.removeItem('pendingProvider');
          
          setTimeout(() => {
            navigate('/campaigns/new');
          }, 2000);
        }
      } else {
        showError('No authorization code received');
        setTimeout(() => navigate('/campaigns/new'), 2000);
      }
      
      setProcessing(false);
    };

    handleCallback();
  }, [navigate, showSuccess, showError]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {processing ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <h2>Processing OAuth callback...</h2>
          <p>Please wait while we connect your email account.</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>Processing Complete</h2>
          <p>Redirecting you back to the campaign setup...</p>
        </div>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;