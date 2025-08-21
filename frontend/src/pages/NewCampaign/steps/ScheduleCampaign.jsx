import React, { useState } from 'react';
import { Clock, Calendar, Send, Save, Zap, Timer, Globe } from 'lucide-react';

const ScheduleCampaign = ({ data, onUpdate, campaignData }) => {
  const [scheduleType, setScheduleType] = useState((data && data.scheduleType) || 'now');
  const [scheduledAt, setScheduledAt] = useState((data && data.scheduledAt) || '');
  const [timezone, setTimezone] = useState((data && data.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [sendRate, setSendRate] = useState((data && data.sendRate) || { enabled: false, emailsPerHour: 100 });
  const [followUpEnabled, setFollowUpEnabled] = useState((data && data.followUpEnabled) || false);
  const [followUpDelay, setFollowUpDelay] = useState((data && data.followUpDelay) || { value: 3, unit: 'days' });

  // Initialize data if not provided
  React.useEffect(() => {
    if (!data) {
      onUpdate({ 
        scheduleType: 'now', 
        scheduledAt: null, 
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sendRate: { enabled: false, emailsPerHour: 100 },
        followUpEnabled: false,
        followUpDelay: { value: 3, unit: 'days' }
      });
    }
  }, []);

  const handleScheduleTypeChange = (type) => {
    setScheduleType(type);
    const updateData = { 
      scheduleType: type, 
      timezone, 
      sendRate, 
      followUpEnabled, 
      followUpDelay 
    };
    
    if (type === 'now') {
      updateData.scheduledAt = null;
      setScheduledAt('');
    } else {
      updateData.scheduledAt = scheduledAt;
    }
    
    onUpdate(updateData);
  };

  const handleDateTimeChange = (value) => {
    setScheduledAt(value);
    onUpdate({ scheduleType, scheduledAt: value, timezone, sendRate, followUpEnabled, followUpDelay });
  };

  const handleSendRateChange = (enabled, emailsPerHour) => {
    const newSendRate = { enabled, emailsPerHour };
    setSendRate(newSendRate);
    onUpdate({ scheduleType, scheduledAt, timezone, sendRate: newSendRate, followUpEnabled, followUpDelay });
  };

  const handleFollowUpChange = (enabled, delay) => {
    setFollowUpEnabled(enabled);
    if (delay) setFollowUpDelay(delay);
    onUpdate({ scheduleType, scheduledAt, timezone, sendRate, followUpEnabled: enabled, followUpDelay: delay || followUpDelay });
  };

  const handleTimezoneChange = (tz) => {
    setTimezone(tz);
    onUpdate({ scheduleType, scheduledAt, timezone: tz, sendRate, followUpEnabled, followUpDelay });
  };

  const getEstimatedDeliveryTime = () => {
    const recipientCount = campaignData?.import?.recipients?.length || 0;
    if (!recipientCount || !sendRate.enabled) return null;
    
    const hoursNeeded = Math.ceil(recipientCount / sendRate.emailsPerHour);
    const minutes = (hoursNeeded % 1) * 60;
    
    if (hoursNeeded < 1) {
      return `${Math.ceil(minutes)} minutes`;
    } else if (hoursNeeded < 24) {
      return `${Math.floor(hoursNeeded)} hours ${Math.ceil(minutes)} minutes`;
    } else {
      const days = Math.floor(hoursNeeded / 24);
      const remainingHours = hoursNeeded % 24;
      return `${days} days ${Math.floor(remainingHours)} hours`;
    }
  };

  const commonTimezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="schedule-campaign">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Schedule Campaign</h2>
        <p style={{ margin: 0 }}>Choose when to send your campaign</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '2rem' }}>
        {/* Main Schedule Options */}
        <div>
          {/* Send Now */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="schedule"
                value="now"
                checked={scheduleType === 'now'}
                onChange={() => handleScheduleTypeChange('now')}
                style={{ marginRight: '0.5rem' }}
              />
              <Zap size={20} style={{ marginRight: '0.5rem', color: '#28a745' }} />
              <div>
                <strong>Send Immediately</strong>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Campaign will be sent as soon as it's created</div>
              </div>
            </label>
          </div>

          {/* Schedule for Later */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="schedule"
                value="later"
                checked={scheduleType === 'later'}
                onChange={() => handleScheduleTypeChange('later')}
                style={{ marginRight: '0.5rem' }}
              />
              <Calendar size={20} style={{ marginRight: '0.5rem', color: '#667eea' }} />
              <div>
                <strong>Schedule for Later</strong>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Choose a specific date and time</div>
              </div>
            </label>
          </div>

          {/* Date/Time Picker */}
          {scheduleType === 'later' && (
            <div style={{ marginLeft: '2rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    <Clock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => handleDateTimeChange(e.target.value)}
                    min={minDateTimeString}
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
                    <Globe size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local Timezone</option>
                    {commonTimezones.map(tz => (
                      <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ color: '#666', fontSize: '0.8rem' }}>
                Campaign must be scheduled at least 5 minutes in the future
              </div>
            </div>
          )}

          {/* Save as Draft */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="schedule"
                value="draft"
                checked={scheduleType === 'draft'}
                onChange={() => handleScheduleTypeChange('draft')}
                style={{ marginRight: '0.5rem' }}
              />
              <Save size={20} style={{ marginRight: '0.5rem', color: '#6c757d' }} />
              <div>
                <strong>Save as Draft</strong>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Save campaign without sending</div>
              </div>
            </label>
          </div>

          {/* Advanced Options */}
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Timer size={16} />
              Advanced Sending Options
            </h4>
            
            {/* Send Rate Limiting */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={sendRate.enabled}
                  onChange={(e) => handleSendRateChange(e.target.checked, sendRate.emailsPerHour)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>Enable Send Rate Limiting</strong>
              </label>
              {sendRate.enabled && (
                <div style={{ marginLeft: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Emails per hour:</label>
                  <input
                    type="number"
                    value={sendRate.emailsPerHour}
                    onChange={(e) => handleSendRateChange(true, parseInt(e.target.value) || 100)}
                    min="1"
                    max="1000"
                    style={{ width: '100px', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    Recommended: 50-200 emails/hour for better deliverability
                  </div>
                  {getEstimatedDeliveryTime() && (
                    <div style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.25rem' }}>
                      Estimated delivery time: {getEstimatedDeliveryTime()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Follow-up Options */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={followUpEnabled}
                  onChange={(e) => handleFollowUpChange(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>Enable Automatic Follow-up</strong>
              </label>
              {followUpEnabled && (
                <div style={{ marginLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>Send follow-up after:</span>
                  <input
                    type="number"
                    value={followUpDelay.value}
                    onChange={(e) => handleFollowUpChange(true, { ...followUpDelay, value: parseInt(e.target.value) || 3 })}
                    min="1"
                    style={{ width: '60px', padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <select
                    value={followUpDelay.unit}
                    onChange={(e) => handleFollowUpChange(true, { ...followUpDelay, unit: e.target.value })}
                    style={{ padding: '0.25rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Summary Sidebar */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', height: 'fit-content' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Send size={16} />
            Schedule Summary
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Send Type:</strong>
              <div style={{ color: '#666', marginTop: '0.25rem' }}>
                {scheduleType === 'now' && 'Immediate delivery'}
                {scheduleType === 'later' && scheduledAt && `Scheduled for ${new Date(scheduledAt).toLocaleString()}`}
                {scheduleType === 'later' && !scheduledAt && 'Please select date and time'}
                {scheduleType === 'draft' && 'Save as draft'}
              </div>
            </div>
            
            {timezone && scheduleType === 'later' && (
              <div>
                <strong>Timezone:</strong>
                <div style={{ color: '#666', marginTop: '0.25rem' }}>{timezone}</div>
              </div>
            )}
            
            {campaignData?.import?.recipients && (
              <div>
                <strong>Recipients:</strong>
                <div style={{ color: '#666', marginTop: '0.25rem' }}>{campaignData.import.recipients.length} contacts</div>
              </div>
            )}
            
            {sendRate.enabled && (
              <div>
                <strong>Send Rate:</strong>
                <div style={{ color: '#666', marginTop: '0.25rem' }}>{sendRate.emailsPerHour} emails/hour</div>
                {getEstimatedDeliveryTime() && (
                  <div style={{ color: '#28a745', fontSize: '0.8rem', marginTop: '0.25rem' }}>~{getEstimatedDeliveryTime()}</div>
                )}
              </div>
            )}
            
            {followUpEnabled && (
              <div>
                <strong>Follow-up:</strong>
                <div style={{ color: '#666', marginTop: '0.25rem' }}>After {followUpDelay.value} {followUpDelay.unit}</div>
              </div>
            )}
          </div>
          
          {/* Best Practices */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '4px', border: '1px solid #c3e6c3' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#2d5a2d', fontSize: '0.9rem' }}>💡 Best Practices</h5>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: '#2d5a2d' }}>
              <li>Send emails during business hours (9 AM - 5 PM)</li>
              <li>Avoid Mondays and Fridays for better open rates</li>
              <li>Use rate limiting for large campaigns</li>
              <li>Test with a small group first</li>
            </ul>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ScheduleCampaign;