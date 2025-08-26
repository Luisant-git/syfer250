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
        
        const pendingGmailEmail = localStorage.getItem('pendingGmailEmail');
        const pendingOutlookEmail = localStorage.getItem('pendingOutlookEmail');
        
        try {
          if (pendingGmailEmail) {
            console.log('Processing Gmail OAuth...');
            const response = await apiService.exchangeGmailCode(code);
            console.log('Gmail response:', response);
            localStorage.removeItem('pendingGmailEmail');
          } else if (pendingOutlookEmail) {
            console.log('Processing Outlook OAuth...');
            const response = await apiService.exchangeOutlookCode(code);
            console.log('Outlook response:', response);
            localStorage.removeItem('pendingOutlookEmail');
          }
        } catch (error) {
          console.error('OAuth error:', error);
        }
      }
      
      navigate('/new-campaign');
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing OAuth callback...</div>;
};

export default OAuthCallback;