import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, User, Calendar, Eye } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import apiService from '../../services/api';
import useToast from '../../hooks/useToast';

const ReceivedEmails = () => {
  const { showSuccess, showError } = useToast();
  const [emails, setEmails] = useState([]);
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 10;

  useEffect(() => {
    fetchSenders();
  }, []);

  const fetchSenders = async () => {
    try {
      const response = await apiService.getSenders();
      if (response.success) {
        const imapSenders = response.data.filter(s => s.provider === 'IMAP' || s.provider === 'POP3');
        setSenders(imapSenders);
        if (imapSenders.length > 0) {
          setSelectedSender(imapSenders[0].id);
        }
      }
    } catch (error) {
      showError('Failed to fetch senders');
    }
  };

  const checkEmails = async () => {
    if (!selectedSender) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://campaign.shoppingsto.com/api/emails/check/${selectedSender}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Raw emails from backend:', data.emails?.map(e => ({ from: e.from, date: e.date })));
        const sortedEmails = (data.emails || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setEmails(sortedEmails);
        setCurrentPage(1);
        showSuccess(`Found ${data.emails?.length || 0} emails`);
      } else {
        showError(data.error || 'Failed to check emails');
      }
    } catch (error) {
      showError('Failed to check emails');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(emails.length / emailsPerPage);
  const startIndex = (currentPage - 1) * emailsPerPage;
  const currentEmails = emails.slice(startIndex, startIndex + emailsPerPage);

  return (
    <div style={{ 
      padding: window.innerWidth > 768 ? '2rem' : '1rem', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={24} />
          Received Emails
        </h1>
        <p style={{ color: '#666', margin: 0 }}>Check and view emails received in your IMAP/POP3 accounts</p>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        gap: '1rem', 
        marginBottom: '2rem', 
        alignItems: window.innerWidth > 768 ? 'center' : 'stretch'
      }}>
        <select
          value={selectedSender}
          onChange={(e) => setSelectedSender(e.target.value)}
          style={{ 
            padding: '0.75rem', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            minWidth: window.innerWidth > 768 ? '200px' : '100%'
          }}
        >
          <option value="">Select Email Account</option>
          {senders.map(sender => (
            <option key={sender.id} value={sender.id}>
              {sender.name} ({sender.email})
            </option>
          ))}
        </select>
        
        <Button 
          variant="primary" 
          onClick={checkEmails}
          disabled={loading || !selectedSender}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} />
          {loading ? 'Checking...' : 'Check Emails'}
        </Button>
      </div>

      {!showFullPreview && emails.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Inbox ({emails.length})</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {currentEmails.map((email, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedEmail(email);
                  setShowFullPreview(true);
                }}
                style={{
                  padding: window.innerWidth > 768 ? '1rem' : '0.75rem',
                  borderBottom: index < currentEmails.length - 1 ? '1px solid #eee' : 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedEmail === email ? '#f0f8ff' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <User size={14} />
                  <strong style={{ fontSize: '0.9rem' }}>{email.from}</strong>
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                  {email.subject}
                </div>
                <div style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} />
                  {formatDate(email.date)}
                </div>
                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.text?.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span style={{ padding: '0 1rem' }}>Page {currentPage} of {totalPages}</span>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {emails.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: '#666', padding: '3rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
          No emails found. Select an IMAP account and click "Check Emails" to fetch received emails.
        </div>
      )}

      {/* Full Page Email Preview */}
      {showFullPreview && selectedEmail && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Email</h2>
            <Button
              variant="primary"
              size="medium"
              onClick={() => setShowFullPreview(false)}
            >
              ← Back to Inbox
            </Button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {selectedEmail.subject}
            </div>
            <div style={{ marginBottom: '0.5rem', color: '#666' }}>
              <strong>From:</strong> {selectedEmail.from}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              <strong>Date:</strong> {formatDate(selectedEmail.date)}
            </div>
          </div>
          
          <div style={{ 
            lineHeight: '1.6',
            padding: '1rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            minHeight: '60vh'
          }}>
            {selectedEmail.html ? (
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedEmail.text}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivedEmails;