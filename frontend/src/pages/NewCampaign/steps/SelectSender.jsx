import React, { useState, useEffect } from 'react';
import { Plus, Mail, Shield, AlertCircle, CheckCircle, Settings, User, Building } from 'lucide-react';
import Button from '../../../components/UI/Button/Button';
import apiService from '../../../services/api';

const SelectSender = ({ data, onUpdate, campaignData }) => {
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(data || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSender, setNewSender] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  return (
    <div className="select-sender">
      <h2>Select Sender</h2>
      <p>Choose who the email will be sent from with advanced sender management</p>

      {/* Sender Recommendation */}
      {recommendation && (
        <div style={{ 
          marginBottom: '1rem', 
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
      <div style={{ marginBottom: '1rem' }}>
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
        <div key={sender.id} style={{ marginBottom: '1rem' }}>
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
          </label>
        </div>
      ))}

      {/* Add New Sender */}
      {!showAddForm ? (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            Add New Sender
          </Button>
        </div>
      ) : (
        <div style={{ padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', marginTop: '1rem', backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={16} />
              Add New Sender
            </h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: showAdvanced ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sender Name *</label>
                <input
                  type="text"
                  value={newSender.name}
                  onChange={(e) => setNewSender({ ...newSender, name: e.target.value })}
                  placeholder="John Doe"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address *</label>
                <input
                  type="email"
                  value={newSender.email}
                  onChange={(e) => setNewSender({ ...newSender, email: e.target.value })}
                  placeholder="john@company.com"
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: `1px solid ${newSender.email && !validateEmail(newSender.email) ? '#dc3545' : '#ccc'}`, 
                    borderRadius: '4px' 
                  }}
                />
                {newSender.email && !validateEmail(newSender.email) && (
                  <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>Invalid email format</div>
                )}
              </div>
            </div>
            
            {showAdvanced && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Reply-To Email</label>
                  <input
                    type="email"
                    value={newSender.replyTo}
                    onChange={(e) => setNewSender({ ...newSender, replyTo: e.target.value })}
                    placeholder="replies@company.com (optional)"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organization</label>
                  <input
                    type="text"
                    value={newSender.organization}
                    onChange={(e) => setNewSender({ ...newSender, organization: e.target.value })}
                    placeholder="Company Name (optional)"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {showAdvanced && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Signature</label>
              <textarea
                value={newSender.signature}
                onChange={(e) => setNewSender({ ...newSender, signature: e.target.value })}
                placeholder="Best regards,\nJohn Doe\nCompany Name"
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={addNewSender} 
              disabled={loading || !newSender.name || !newSender.email || (newSender.email && !validateEmail(newSender.email))}
            >
              {loading ? 'Adding...' : 'Add Sender'}
            </Button>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#d1ecf1', borderRadius: '4px', border: '1px solid #bee5eb' }}>
            <div style={{ fontSize: '0.9rem', color: '#0c5460' }}>
              <strong>💡 Tip:</strong> Verify your sender email address to improve deliverability and avoid spam filters.
            </div>
          </div>
        </div>
      )}
      
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
    </div>
  );
};

export default SelectSender;