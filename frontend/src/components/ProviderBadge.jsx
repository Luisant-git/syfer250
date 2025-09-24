import React from 'react';

const ProviderBadge = ({ provider, showIcon = true, size = 'sm' }) => {
  const getProviderConfig = (provider) => {
    switch (provider) {
      case 'GMAIL':
        return {
          name: 'Gmail',
          color: '#34a853',
          bgColor: '#e8f5e8',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )
        };
      case 'OUTLOOK':
        return {
          name: 'Outlook',
          color: '#0078d4',
          bgColor: '#e3f2fd',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0078d4">
              <path d="M7 4c-1.5 0-3 .5-3 2.5v11c0 2 1.5 2.5 3 2.5h10c1.5 0 3-.5 3-2.5v-11c0-2-1.5-2.5-3-2.5H7zm5 2c2.5 0 4.5 2 4.5 4.5S14.5 15 12 15s-4.5-2-4.5-4.5S9.5 6 12 6z"/>
            </svg>
          )
        };
      case 'SMTP':
        return {
          name: 'SMTP',
          color: '#666',
          bgColor: '#f5f5f5',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          )
        };
      case 'IMAP':
        return {
          name: 'IMAP',
          color: '#7c3aed',
          bgColor: '#f3e8ff',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M22 6l-10 7L2 6"/>
            </svg>
          )
        };
      case 'POP3':
        return {
          name: 'POP3',
          color: '#dc2626',
          bgColor: '#fee2e2',
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M22 6l-10 7L2 6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          )
        };
      default:
        return {
          name: 'Unknown',
          color: '#666',
          bgColor: '#f5f5f5',
          icon: null
        };
    }
  };

  const config = getProviderConfig(provider);
  const fontSize = size === 'lg' ? '0.875rem' : '0.75rem';
  const padding = size === 'lg' ? '0.25rem 0.75rem' : '0.125rem 0.5rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: showIcon ? '0.25rem' : '0',
      fontSize,
      padding,
      borderRadius: '12px',
      backgroundColor: config.bgColor,
      color: config.color,
      fontWeight: 'bold',
      border: `1px solid ${config.color}20`
    }}>
      {showIcon && config.icon}
      {config.name}
    </span>
  );
};

export default ProviderBadge;