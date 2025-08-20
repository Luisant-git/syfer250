import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Send, Calendar, Mail, Users, BarChart3, Eye, MousePointer, UserX } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import DeleteModal from '../../components/UI/Modal/DeleteModal';
import apiService from '../../services/api';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/UI/ToastContainer/ToastContainer';

const CampaignView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await apiService.getCampaign(id);
      if (response.success) {
        setCampaign(response.data);
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

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      await apiService.deleteCampaign(id);
      showSuccess('Campaign deleted successfully');
      setShowDeleteModal(false);
      navigate('/dashboard');
    } catch (error) {
      showError('Failed to delete campaign');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SENT: { color: '#28a745', bg: '#d4edda', text: 'Sent' },
      SENDING: { color: '#17a2b8', bg: '#d1ecf1', text: 'Sending' },
      DRAFT: { color: '#ffc107', bg: '#fff3cd', text: 'Draft' },
      SCHEDULED: { color: '#667eea', bg: '#e3f2fd', text: 'Scheduled' },
      PAUSED: { color: '#6c757d', bg: '#f8f9fa', text: 'Paused' },
      CANCELLED: { color: '#dc3545', bg: '#f8d7da', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span style={{
        color: config.color,
        backgroundColor: config.bg,
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500'
      }}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

  const analytics = campaign.analytics || {};

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{campaign.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              {getStatusBadge(campaign.status)}
              <span style={{ color: '#666', fontSize: '0.9rem' }}>
                Created {formatDate(campaign.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" onClick={() => navigate(`/campaigns/${id}/edit`)}>
            <Edit size={16} />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteModal(true)}
            style={{ color: '#dc3545', borderColor: '#dc3545' }}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          {/* Campaign Details */}
          <Card style={{ marginBottom: '2rem' }}>
            <Card.Header>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={20} />
                Campaign Details
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#374151' }}>Subject:</label>
                  <p style={{ margin: '0.25rem 0 0 0', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    {campaign.subject}
                  </p>
                </div>
                <div>
                  <label style={{ fontWeight: 'bold', color: '#374151' }}>Content:</label>
                  <div style={{ 
                    margin: '0.25rem 0 0 0', 
                    padding: '1rem', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {campaign.content}
                  </div>
                </div>
                {campaign.sender && (
                  <div>
                    <label style={{ fontWeight: 'bold', color: '#374151' }}>Sender:</label>
                    <p style={{ margin: '0.25rem 0 0 0' }}>
                      {campaign.sender.name} ({campaign.sender.email})
                    </p>
                  </div>
                )}
                {campaign.scheduledAt && (
                  <div>
                    <label style={{ fontWeight: 'bold', color: '#374151' }}>Scheduled:</label>
                    <p style={{ margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} />
                      {formatDate(campaign.scheduledAt)}
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Recipients */}
          <Card>
            <Card.Header>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} />
                Recipients ({campaign.recipients?.length || 0})
              </h3>
            </Card.Header>
            <Card.Body>
              {campaign.recipients && campaign.recipients.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {campaign.recipients.map((recipient, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderBottom: index < campaign.recipients.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                      <div>
                        <strong>{recipient.email}</strong>
                        {(recipient.firstName || recipient.lastName) && (
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            {recipient.firstName} {recipient.lastName}
                          </div>
                        )}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        backgroundColor: recipient.status === 'SENT' ? '#d4edda' : '#fff3cd',
                        color: recipient.status === 'SENT' ? '#28a745' : '#856404'
                      }}>
                        {recipient.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No recipients found</p>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Analytics */}
          <Card style={{ marginBottom: '2rem' }}>
            <Card.Header>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} />
                Analytics
              </h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                    {analytics.totalSent || 0}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <Send size={14} />
                    Total Sent
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                      {analytics.totalOpened || 0}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <Eye size={12} />
                      Opens
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#28a745' }}>
                      {analytics.openRate ? `${analytics.openRate.toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                      {analytics.totalClicked || 0}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <MousePointer size={12} />
                      Clicks
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#667eea' }}>
                      {analytics.clickRate ? `${analytics.clickRate.toFixed(1)}%` : '0%'}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                    {analytics.totalBounced || 0}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    <UserX size={12} />
                    Bounced
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#dc3545' }}>
                    {analytics.bounceRate ? `${analytics.bounceRate.toFixed(1)}%` : '0%'}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Campaign Info */}
          <Card>
            <Card.Header>
              <h3 style={{ margin: 0 }}>Campaign Info</h3>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Status:</span>
                  <span>{getStatusBadge(campaign.status)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Created:</span>
                  <span>{formatDate(campaign.createdAt)}</span>
                </div>
                {campaign.sentAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Sent:</span>
                    <span>{formatDate(campaign.sentAt)}</span>
                  </div>
                )}
                {campaign.scheduledAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Scheduled:</span>
                    <span>{formatDate(campaign.scheduledAt)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Recipients:</span>
                  <span>{campaign.recipients?.length || 0}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? All associated data including recipients and analytics will be permanently removed."
        itemName={campaign?.name}
        loading={actionLoading === 'delete'}
      />
      
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

export default CampaignView;