import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log('OAuth code received:', code);
        
        const pendingProvider = localStorage.getItem('pendingProvider');
        
        try {
          if (pendingProvider === 'gmail') {
            console.log('Processing Gmail OAuth...');
            const response = await apiService.exchangeGmailCode(code);
            console.log('Gmail response:', response);
            
            if (response.success && response.data.email) {
              const senderData = {
                name: response.data.email.split('@')[0],
                email: response.data.email
              };
              await apiService.createSender(senderData);
            }
          } else if (pendingProvider === 'outlook') {
            console.log('Processing Outlook OAuth...');
            const response = await apiService.exchangeOutlookCode(code);
            console.log('Outlook response:', response);
            
            if (response.success && response.data.email) {
              const senderData = {
                name: response.data.email.split('@')[0],
                email: response.data.email
              };
              await apiService.createSender(senderData);
            }
          }
          
          localStorage.removeItem('pendingProvider');
        } catch (error) {
          console.error('OAuth error:', error);
        }
      }
      
      navigate('/campaigns/new');
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing OAuth callback...</div>;
};

export default OAuthCallback;