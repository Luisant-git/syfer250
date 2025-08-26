import React, { useState, useEffect } from 'react';
import { Plus, Mail, Shield, AlertCircle, CheckCircle, Settings, User, Building, Edit, Trash2 } from 'lucide-react';
import Button from '../../../components/UI/Button/Button';
import apiService from '../../../services/api';
import oauthService from '../../../services/oauth';
import useToast from '../../../hooks/useToast';

const SelectSender = ({ data, onUpdate, campaignData }) => {
  const { showSuccess, showError } = useToast();
  const [senders, setSenders] = useState([]);

  const [selectedSender, setSelectedSender] = useState(data || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSMTPModal, setShowSMTPModal] = useState(false);
  const [newSender, setNewSender] = useState({ name: '', email: '' });
  const [gmailEmail, setGmailEmail] = useState('');
  const [outlookEmail, setOutlookEmail] = useState('');
  const [newAccountProvider, setNewAccountProvider] = useState('Gmail');
  const [smtpConfig, setSMTPConfig] = useState({
    email: '',
    host: '',
    port: 587,
    username: '',
    password: '',
    secure: false
  });
  console.log("-----------VIEW-SMTP-----------",smtpConfig);
  
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingSender, setEditingSender] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [senderToDelete, setSenderToDelete] = useState(null);

  // Initialize data if not provided
  React.useEffect(() => {
    if (data === undefined) {
      onUpdate('');
    }
  }, []);

  useEffect(() => {
    fetchSenders();
  }, []);

  const fetchSenders = async () => {
    try {
      const response = await apiService.getSenders();
      if (response.success) {
        setSenders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch senders:', error);
    }
  };



  const handleSenderSelect = (senderId) => {
    setSelectedSender(senderId);
    onUpdate(senderId);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getSenderRecommendation = () => {
    const recipientCount = campaignData?.import?.recipients?.length || 0;
    if (recipientCount > 1000) {
      return {
        type: 'warning',
        message: 'For large campaigns (1000+ recipients), consider using a verified sender to improve deliverability.'
      };
    }
    return null;
  };

  const recommendation = getSenderRecommendation();

  const addNewSender = async () => {
    if (!newSender.name || !newSender.email) return;
    
    setLoading(true);
    try {
      const response = await apiService.createSender(newSender);
      if (response.success) {
        setSenders([...senders, response.data]);
        setSelectedSender(response.data.id);
        onUpdate(response.data.id);
        setNewSender({ name: '', email: '', replyTo: '', organization: '', signature: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to create sender:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (code) => {
    try {
      const pendingGmailEmail = localStorage.getItem('pendingGmailEmail');
      const pendingOutlookEmail = localStorage.getItem('pendingOutlookEmail');
      
      if (pendingGmailEmail) {
        const response = await apiService.exchangeGmailCode(code);
        if (response.success) {
          await apiService.addEmailAccount(pendingGmailEmail, 'Gmail', response.data);
          localStorage.removeItem('pendingGmailEmail');
          showSuccess('Gmail account connected successfully');
          fetchEmailAccounts();
        }
      } else if (pendingOutlookEmail) {
        const response = await apiService.exchangeOutlookCode(code);
        if (response.success) {
          await apiService.addEmailAccount(pendingOutlookEmail, 'Outlook', response.data);
          localStorage.removeItem('pendingOutlookEmail');
          showSuccess('Outlook account connected successfully');
          fetchEmailAccounts();
        }
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback error:', error);
      showError('Failed to connect email account');
    }
  };

  const handleAddEmailAccount = async () => {
    if (!newAccountEmail) {
      showError('Email address is required');
      return;
    }

    try {
      const response = await apiService.createSender({
        name: newAccountEmail.split('@')[0],
        email: newAccountEmail
      });
      if (response.success) {
        showSuccess('Email account connected successfully');
        setNewAccountEmail('');
        setShowConnectModal(false);
        fetchSenders();
      }
    } catch (error) {
      console.error('Failed to add email account:', error);
      showError(error.message || 'Failed to connect email account');
    }
  };

  const handleEditSender = (sender) => {
    setEditingSender(sender);
    setNewSender({
      name: sender.name,
      email: sender.email,
      replyTo: sender.replyTo || '',
      organization: sender.organization || '',
      signature: sender.signature || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateSender = async () => {
    if (!newSender.name || !newSender.email) return;
    
    setLoading(true);
    try {
      const response = await apiService.updateSender(editingSender.id, newSender);
      if (response.success) {
        setSenders(senders.map(s => s.id === editingSender.id ? response.data : s));
        showSuccess('Sender updated successfully');
        setNewSender({ name: '', email: '', replyTo: '', organization: '', signature: '' });
        setEditingSender(null);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to update sender:', error);
      showError(error.message || 'Failed to update sender');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSender = async () => {
    if (!senderToDelete) return;
    
    setLoading(true);
    try {
      await apiService.deleteSender(senderToDelete.id);
      setSenders(senders.filter(s => s.id !== senderToDelete.id));
      if (selectedSender === senderToDelete.id) {
        setSelectedSender('');
        onUpdate('');
      }
      showSuccess('Sender deleted successfully');
      setShowDeleteModal(false);
      setSenderToDelete(null);
    } catch (error) {
      console.error('Failed to delete sender:', error);
      showError(error.message || 'Failed to delete sender');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (sender) => {
    setSenderToDelete(sender);
    setShowDeleteModal(true);
  };

  const cancelEdit = () => {
    setEditingSender(null);
    setNewSender({ name: '', email: '', replyTo: '', organization: '', signature: '' });
    setShowAddForm(false);
  };

  return (
    <div className="select-sender">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Select Sender</h2>
        <p style={{ margin: 0 }}>Choose who the email will be sent from with advanced sender management</p>
      </div>

      {/* Sender Recommendation */}
      {recommendation && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          backgroundColor: recommendation.type === 'warning' ? '#fff3cd' : '#d1ecf1', 
          border: `1px solid ${recommendation.type === 'warning' ? '#ffeaa7' : '#bee5eb'}`, 
          borderRadius: '8px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {recommendation.type === 'warning' ? (
              <AlertCircle size={16} color="#856404" />
            ) : (
              <Shield size={16} color="#0c5460" />
            )}
            <span style={{ 
              color: recommendation.type === 'warning' ? '#856404' : '#0c5460',
              fontSize: '0.9rem'
            }}>
              {recommendation.message}
            </span>
          </div>
        </div>
      )}

      {/* No Sender Option */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '1rem', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          cursor: 'pointer',
          backgroundColor: selectedSender === '' ? '#e3f2fd' : 'white'
        }}>
          <input
            type="radio"
            name="sender"
            value=""
            checked={selectedSender === ''}
            onChange={() => handleSenderSelect('')}
            style={{ marginRight: '0.75rem' }}
          />
          <User size={20} style={{ marginRight: '0.5rem', color: '#6c757d' }} />
          <div>
            <strong>Default System Sender</strong>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Use platform default sender (recommended for testing)</div>
          </div>
        </label>
      </div>

      {/* Existing Senders */}
      {senders.map((sender) => (
        <div key={sender.id} style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            cursor: 'pointer',
            backgroundColor: selectedSender === sender.id ? '#e3f2fd' : 'white'
          }}>
            <input
              type="radio"
              name="sender"
              value={sender.id}
              checked={selectedSender === sender.id}
              onChange={() => handleSenderSelect(sender.id)}
              style={{ marginRight: '0.75rem' }}
            />
            <Mail size={20} style={{ marginRight: '0.5rem', color: sender.isVerified ? '#28a745' : '#6c757d' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <strong>{sender.name}</strong>
                {sender.isVerified ? (
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    color: '#28a745', 
                    fontSize: '0.8rem',
                    backgroundColor: '#d4edda',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '12px'
                  }}>
                    <CheckCircle size={12} />
                    Verified
                  </span>
                ) : (
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    color: '#856404', 
                    fontSize: '0.8rem',
                    backgroundColor: '#fff3cd',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '12px'
                  }}>
                    <AlertCircle size={12} />
                    Unverified
                  </span>
                )}
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{sender.email}</div>
              {sender.organization && (
                <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Building size={12} />
                  {sender.organization}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openDeleteModal(sender);
                }}
                style={{
                  background: 'none',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Delete Sender"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </label>
        </div>
      ))}



      {/* Add New Sender */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Button variant="primary" onClick={() => setShowConnectModal(true)}>
          <Plus size={16} />
          Connect Email Account
        </Button>
      </div>
      
      {/* Sender Performance Insights */}
      {selectedSender && selectedSender !== '' && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #c3e6c3' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#2d5a2d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} />
            Sender Best Practices
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.9rem', color: '#2d5a2d' }}>
            <li>Use a consistent sender name and email for better recognition</li>
            <li>Verify your sender domain to improve deliverability</li>
            <li>Include a professional email signature</li>
            <li>Set up a dedicated reply-to address for better engagement</li>
            <li>Monitor sender reputation and engagement metrics</li>
          </ul>
        </div>
      )}

      {/* Connect Email Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>Connect Your Email Account</h3>
              <Button variant="ghost" onClick={() => setShowConnectModal(false)} style={{ fontSize: '24px', padding: '8px 16px' }}>×</Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ marginRight: '1rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Google / Gmail</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Connect your Gmail account</p>
                  <input
                    type="email"
                    placeholder="Gmail"
                    value={gmailEmail}
                    onChange={(e) => setGmailEmail(e.target.value)}
                    style={{ width: '60%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <Button variant="primary" onClick={() => { 
                  console.log('Gmail OAuth clicked:', gmailEmail);
                  localStorage.setItem('pendingGmailEmail', gmailEmail);
                  oauthService.initiateGmailAuth();
                }} disabled={!gmailEmail}>Connect</Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ marginRight: '1rem' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png" alt="Outlook" width="40" height="40" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Microsoft Outlook</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Connect your Outlook account</p>
                  <input
                    type="email"
                    placeholder="Outlook"
                    value={outlookEmail}
                    onChange={(e) => setOutlookEmail(e.target.value)}
                    style={{ width: '60%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <Button variant="primary" onClick={() => { 
                  console.log('Outlook OAuth clicked:', outlookEmail);
                  localStorage.setItem('pendingOutlookEmail', outlookEmail);
                  oauthService.initiateOutlookAuth();
                }} disabled={!outlookEmail}>Connect</Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                <div style={{ marginRight: '1rem' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                    <path d="M7 10l5 3 5-3" strokeDasharray="2,2"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>SMTP Server</h4>
                  <p style={{ margin: 0, color: '#666' }}>Connect using SMTP configuration</p>
                </div>
                <Button variant="outline" onClick={() => { setShowConnectModal(false); setShowSMTPModal(true); }}>Configure</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMTP Configuration Modal */}
      {showSMTPModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0 }}>Configure SMTP Server</h3>
              <Button variant="ghost" onClick={() => setShowSMTPModal(false)} style={{ fontSize: '24px', padding: '8px 16px' }}>×</Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address *</label>
                <input
                  type="email"
                  value={smtpConfig.email}
                  onChange={(e) => setSMTPConfig({...smtpConfig, email: e.target.value})}
                  placeholder="your@email.com"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>SMTP Host *</label>
                  <input
                    type="text"
                    value={smtpConfig.host}
                    onChange={(e) => setSMTPConfig({...smtpConfig, host: e.target.value})}
                    placeholder="smtp.gmail.com"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Port *</label>
                  <input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSMTPConfig({...smtpConfig, port: parseInt(e.target.value)})}
                    placeholder="587"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username *</label>
                <input
                  type="text"
                  value={smtpConfig.username}
                  onChange={(e) => setSMTPConfig({...smtpConfig, username: e.target.value})}
                  placeholder="Usually your email address"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password *</label>
                <input
                  type="password"
                  value={smtpConfig.password}
                  onChange={(e) => setSMTPConfig({...smtpConfig, password: e.target.value})}
                  placeholder="Your email password or app password"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={smtpConfig.secure}
                    onChange={(e) => setSMTPConfig({...smtpConfig, secure: e.target.checked})}
                  />
                  Use SSL/TLS (recommended for port 465)
                </label>
              </div>
              
              <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Common Settings:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div><strong>Gmail:</strong> smtp.gmail.com:587</div>
                  <div><strong>Outlook:</strong> smtp-mail.outlook.com:587</div>
                  <div><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Button variant="outline" onClick={() => setShowSMTPModal(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (!smtpConfig.email || !smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
                    showError('All SMTP fields are required');
                    return;
                  }
                  try {
                    const data = {
                      name: smtpConfig.username,
                      email: smtpConfig.email,
                      password: smtpConfig.password,
                      host: smtpConfig.host,
                      port: smtpConfig.port,
                      isVerified: smtpConfig.secure,
                    }
                    const response = await apiService.createSender(data);
                    if (response.success) {
                      showSuccess('SMTP account connected successfully');
                      setSenders(prev => [...prev, response.data]);
                      setSMTPConfig({ email: '', host: '', port: 587, username: '', password: '', secure: false });
                      setShowSMTPModal(false);
                      fetchSenders();
                    }
                  } catch (error) {
                    showError(error.message || 'Failed to connect SMTP account');
                  }
                }}
                disabled={!smtpConfig.email || !smtpConfig.host || !smtpConfig.username || !smtpConfig.password}
              >
                Connect SMTP
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: '#fee2e2', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem' 
              }}>
                <Trash2 size={24} color="#ef4444" />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Delete Sender</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Are you sure you want to delete <strong>{senderToDelete?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSenderToDelete(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteSender}
                disabled={loading}
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectSender;