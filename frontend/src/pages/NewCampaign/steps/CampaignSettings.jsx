import React, { useState } from 'react';
import { Settings, BarChart3, Target, Mail, Users, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const CampaignSettings = ({ data, onUpdate, campaignData }) => {
  const [settings, setSettings] = useState(data || { 
    name: '', 
    description: '', 
    tags: [], 
    priority: 'medium',
    trackOpens: true,
    trackClicks: true,
    unsubscribeLink: true,
    customFields: {}
  });
  const [newTag, setNewTag] = useState('');

  // Initialize data if not provided
  React.useEffect(() => {
    if (!data) {
      onUpdate({ 
        name: '', 
        description: '', 
        tags: [], 
        priority: 'medium',
        trackOpens: true,
        trackClicks: true,
        unsubscribeLink: true,
        customFields: {}
      });
    }
  }, []);

  const updateSetting = (field, value) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    onUpdate(updatedSettings);
  };

  const addTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      const updatedTags = [...settings.tags, newTag.trim()];
      updateSetting('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = settings.tags.filter(tag => tag !== tagToRemove);
    updateSetting('tags', updatedTags);
  };

  const getEstimatedMetrics = () => {
    const recipientCount = campaignData?.import?.recipients?.length || 0;
    const industryAverages = {
      openRate: 0.22,
      clickRate: 0.035,
      unsubscribeRate: 0.002
    };
    
    return {
      expectedOpens: Math.round(recipientCount * industryAverages.openRate),
      expectedClicks: Math.round(recipientCount * industryAverages.clickRate),
      expectedUnsubscribes: Math.round(recipientCount * industryAverages.unsubscribeRate)
    };
  };

  const getValidationIssues = () => {
    const issues = [];
    if (!settings.name || !settings.name.trim()) issues.push('Campaign name is required');
    if (!campaignData?.import?.recipients || campaignData.import.recipients.length === 0) issues.push('At least one recipient is required');
    if (!campaignData?.sequences?.[0]?.subject) issues.push('Email subject is required');
    if (!campaignData?.sequences?.[0]?.content) issues.push('Email content is required');
    if (campaignData?.schedule?.scheduleType === 'later' && !campaignData?.schedule?.scheduledAt) issues.push('Schedule date and time is required');
    return issues;
  };

  const getReadinessScore = () => {
    const totalChecks = 8;
    let passedChecks = 0;
    
    if (settings.name && settings.name.trim()) passedChecks++;
    if (campaignData?.import?.recipients && campaignData.import.recipients.length > 0) passedChecks++;
    if (campaignData?.sequences?.[0]?.subject) passedChecks++;
    if (campaignData?.sequences?.[0]?.content) passedChecks++;
    if (campaignData?.schedule?.scheduleType !== 'later' || campaignData?.schedule?.scheduledAt) passedChecks++;
    if (campaignData?.sender) passedChecks++;
    if (settings.description) passedChecks++;
    if (settings.tags && settings.tags.length > 0) passedChecks++;
    
    return Math.round((passedChecks / totalChecks) * 100);
  };

  // Get summary data from other steps
  const recipientCount = campaignData.import?.recipients?.length || 0;
  const validRecipients = campaignData.import?.recipients?.filter(r => r.isValid !== false).length || 0;
  const emailSubject = campaignData.sequences?.[0]?.subject || 'No subject';
  const senderInfo = campaignData.sender || 'Default sender';
  const scheduleInfo = campaignData.schedule?.scheduleType === 'now' ? 'Send immediately' : 
                      campaignData.schedule?.scheduleType === 'later' ? `Scheduled for ${new Date(campaignData.schedule.scheduledAt).toLocaleString()}` :
                      'Save as draft';
  
  const estimatedMetrics = getEstimatedMetrics();
  const validationIssues = getValidationIssues();
  const readinessScore = getReadinessScore();

  return (
    <div className="campaign-settings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2>Campaign Settings</h2>
          <p>Final settings, validation, and campaign summary</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: readinessScore >= 80 ? '#28a745' : readinessScore >= 60 ? '#ffc107' : '#dc3545' }}>
            {readinessScore}%
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Campaign Readiness</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Main Settings */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Campaign Name *
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => updateSetting('name', e.target.value)}
                placeholder="Enter campaign name (e.g., Q4 Product Launch)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => updateSetting('description', e.target.value)}
                placeholder="Brief description of this campaign's purpose and goals"
                rows={3}
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
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {(settings.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1976d2',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.8rem'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tag (e.g., newsletter, promotion)"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Campaign Priority
              </label>
              <select
                value={settings.priority}
                onChange={(e) => updateSetting('priority', e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  width: '200px'
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Tracking Settings */}
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={16} />
              Tracking & Analytics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.trackOpens}
                  onChange={(e) => updateSetting('trackOpens', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Track Email Opens
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.trackClicks}
                  onChange={(e) => updateSetting('trackClicks', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Track Link Clicks
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.unsubscribeLink}
                  onChange={(e) => updateSetting('unsubscribeLink', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Include Unsubscribe Link
              </label>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div>
          {/* Validation Issues */}
          {validationIssues.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} color="#856404" />
                <strong style={{ color: '#856404' }}>Issues to Fix</strong>
              </div>
              {validationIssues.map((issue, index) => (
                <div key={index} style={{ color: '#856404', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  • {issue}
                </div>
              ))}
            </div>
          )}

          {/* Campaign Summary */}
          <div style={{ marginBottom: '1rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={16} />
              Campaign Summary
            </h4>
            
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold' }}>Campaign Name:</span>
                <span>{settings.name || 'Unnamed Campaign'}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold' }}>Email Subject:</span>
                <span>{emailSubject}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold' }}>Recipients:</span>
                <span>
                  {recipientCount} total
                  {validRecipients !== recipientCount && (
                    <span style={{ color: '#28a745' }}> ({validRecipients} valid)</span>
                  )}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold' }}>Sender:</span>
                <span>{senderInfo}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold' }}>Schedule:</span>
                <span>{scheduleInfo}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                <span style={{ fontWeight: 'bold' }}>Priority:</span>
                <span style={{ 
                  color: settings.priority === 'urgent' ? '#dc3545' : 
                         settings.priority === 'high' ? '#fd7e14' : 
                         settings.priority === 'medium' ? '#ffc107' : '#28a745',
                  textTransform: 'capitalize'
                }}>
                  {settings.priority}
                </span>
              </div>
              
              {settings.tags && settings.tags.length > 0 && (
                <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                  <span style={{ fontWeight: 'bold' }}>Tags:</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    {(settings.tags || []).map((tag, index) => (
                      <span key={index} style={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        marginRight: '0.25rem'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expected Performance */}
          <div style={{ padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #c3e6c3' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#2d5a2d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} />
              Expected Performance
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Opens:</span>
                <span style={{ fontWeight: 'bold', color: '#2d5a2d' }}>{estimatedMetrics.expectedOpens}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Clicks:</span>
                <span style={{ fontWeight: 'bold', color: '#2d5a2d' }}>{estimatedMetrics.expectedClicks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Unsubscribes:</span>
                <span style={{ fontWeight: 'bold', color: '#2d5a2d' }}>{estimatedMetrics.expectedUnsubscribes}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#2d5a2d', marginTop: '0.5rem', fontStyle: 'italic' }}>
              *Based on industry averages
            </div>
          </div>
        </div>
      </div>

      {/* Final Readiness Check */}
      {validationIssues.length === 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#155724' }}>
            <CheckCircle size={20} />
            <strong>Campaign is ready to launch!</strong>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#155724', marginTop: '0.5rem' }}>
            All requirements are met. You can proceed to create and launch your campaign.
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSettings;