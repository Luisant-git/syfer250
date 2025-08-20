import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Type, Mail, Users, Calendar, Settings } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import apiService from '../../services/api';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/UI/ToastContainer/ToastContainer';

const CampaignEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [senders, setSenders] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    senderId: '',
    scheduledAt: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    fetchCampaign();
    fetchSenders();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await apiService.getCampaign(id);
      if (response.success) {
        const campaignData = response.data;
        setCampaign(campaignData);
        setFormData({
          name: campaignData.name || '',
          subject: campaignData.subject || '',
          content: campaignData.content || '',
          senderId: campaignData.senderId || '',
          scheduledAt: campaignData.scheduledAt ? new Date(campaignData.scheduledAt).toISOString().slice(0, 16) : '',
          status: campaignData.status || 'DRAFT'
        });
      } else {
        showError('Campaign not found');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      showError('Failed to load campaign');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Campaign name is required');
      return;
    }
    if (!formData.subject.trim()) {
      showError('Email subject is required');
      return;
    }
    if (!formData.content.trim()) {
      showError('Email content is required');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        content: formData.content.trim(),
        senderId: formData.senderId || null,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
        status: formData.status
      };

      const response = await apiService.updateCampaign(id, updateData);
      if (response.success) {
        showSuccess('Campaign updated successfully');
        navigate(`/campaigns/${id}`);
      } else {
        showError('Failed to update campaign');
      }
    } catch (error) {
      console.error('Failed to update campaign:', error);
      showError('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('content-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      handleInputChange('content', before + variable + after);
    }
  };

  const variables = [
    { name: 'First Name', value: '{{firstName}}' },
    { name: 'Last Name', value: '{{lastName}}' },
    { name: 'Email', value: '{{email}}' },
    { name: 'Company', value: '{{company}}' },
    { name: 'Phone', value: '{{phone}}' }
  ];

  const renderPreviewContent = (content) => {
    return content
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john@example.com')
      .replace(/{{company}}/g, 'Acme Corp')
      .replace(/{{phone}}/g, '+1 (555) 123-4567');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Campaign not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate(`/campaigns/${id}`)}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Edit Campaign</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>
              Make changes to your campaign settings and content
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={16} />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Campaign Settings */}
          <Card style={{ marginBottom: '2rem' }}>
            <Card.Header>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} />
                Campaign Settings
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter campaign name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Sender
                    </label>
                    <select
                      value={formData.senderId}
                      onChange={(e) => handleInputChange('senderId', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Default Sender</option>
                      {senders.map((sender) => (
                        <option key={sender.id} value={sender.id}>
                          {sender.name} ({sender.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="SENT">Sent</option>
                      <option value="PAUSED">Paused</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                {formData.status === 'SCHEDULED' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Email Content */}
          <Card>
            <Card.Header>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={20} />
                Email Content
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter email subject line"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Email Content *
                  </label>
                  <textarea
                    id="content-textarea"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter your email content here..."
                    rows={12}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    Character count: {formData.content.length} | Word count: {formData.content.split(' ').filter(word => word.length > 0).length}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {showPreview ? (
            /* Email Preview */
            <Card style={{ marginBottom: '2rem' }}>
              <Card.Header>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={20} />
                  Email Preview
                </h3>
              </Card.Header>
              <Card.Body>
                <div style={{ backgroundColor: 'white', border: '1px solid #dee2e6', borderRadius: '4px', padding: '1rem' }}>
                  <div style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                    <strong>Subject:</strong> {formData.subject ? renderPreviewContent(formData.subject) : 'No subject'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {formData.content ? renderPreviewContent(formData.content) : 'No content'}
                  </div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                  Preview shows how the email will look with sample data
                </div>
              </Card.Body>
            </Card>
          ) : (
            /* Variables Panel */
            <Card style={{ marginBottom: '2rem' }}>
              <Card.Header>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Type size={20} />
                  Personalization Variables
                </h3>
              </Card.Header>
              <Card.Body>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  Click to insert variables into your email content:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {variables.map((variable, index) => (
                    <button
                      key={index}
                      onClick={() => insertVariable(variable.value)}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontWeight: 'bold' }}>{variable.name}</div>
                      <div style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {variable.value}
                      </div>
                    </button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Campaign Info */}
          <Card>
            <Card.Header>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} />
                Campaign Info
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Recipients:</span>
                  <span>{campaign.recipients?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Created:</span>
                  <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Last Modified:</span>
                  <span>{new Date(campaign.updatedAt || campaign.createdAt).toLocaleDateString()}</span>
                </div>
                {campaign.sentAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Sent:</span>
                    <span>{new Date(campaign.sentAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CampaignEdit;