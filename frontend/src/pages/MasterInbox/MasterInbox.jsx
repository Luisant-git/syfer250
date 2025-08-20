"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Mail,
  Search,
  Filter,
  Archive,
  Trash2,
  Reply,
  Forward,
  Star,
  List,
  Grid,
} from "lucide-react";
import Button from "../../components/UI/Button/Button";
import Card from "../../components/UI/Card/Card";
import apiService from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/UI/ToastContainer/ToastContainer";
import "./MasterInbox.scss";

const MasterInbox = () => {
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [emails, setEmails] = useState([]);
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [viewMode, setViewMode] = useState("unified");
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountProvider, setNewAccountProvider] = useState("Gmail");
  const [showSMTPModal, setShowSMTPModal] = useState(false);
  const [smtpConfig, setSMTPConfig] = useState({
    email: '',
    host: '',
    port: 587,
    username: '',
    password: '',
    secure: false
  });

  useEffect(() => {
    fetchInboxData();
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [selectedAccount, activeFolder, searchQuery]);

  const fetchInboxData = async () => {
    try {
      const [accountsResponse, foldersResponse] = await Promise.all([
        apiService.getEmailAccounts(),
        apiService.getFolders()
      ]);

      if (accountsResponse.success) {
        setEmailAccounts(accountsResponse.data);
      }

      if (foldersResponse.success) {
        setFolders(foldersResponse.data.map(folder => ({
          ...folder,
          icon: <Mail size={16} />
        })));
      }
    } catch (error) {
      console.error('Failed to fetch inbox data:', error);
      showError('Failed to load inbox data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setEmailLoading(true);
    try {
      const params = {
        accountId: selectedAccount,
        folder: activeFolder,
        search: searchQuery,
        limit: 50
      };

      const response = await apiService.getEmails(params);
      if (response.success) {
        setEmails(response.data.emails.map(email => ({
          ...email,
          time: formatTime(email.receivedAt),
          account: email.emailAccountId,
          labels: email.labels || []
        })));
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      showError('Failed to load emails');
    } finally {
      setEmailLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const handleAddEmailAccount = async () => {
    if (!newAccountEmail) {
      showError('Email address is required');
      return;
    }

    try {
      const response = await apiService.addEmailAccount(newAccountEmail, newAccountProvider);
      if (response.success) {
        showSuccess('Email account connected successfully');
        setNewAccountEmail('');
        setShowConnectModal(false);
        fetchInboxData();
        
        // Sync emails for new account
        await apiService.syncEmails(response.data.id);
        fetchEmails();
      }
    } catch (error) {
      console.error('Failed to add email account:', error);
      showError(error.message || 'Failed to connect email account');
    }
  };

  const handleEmailClick = async (email) => {
    setSelectedEmail(email);
    
    // Mark as read if not already
    if (!email.isRead) {
      try {
        await apiService.updateEmail(email.id, { isRead: true });
        setEmails(emails.map(e => 
          e.id === email.id ? { ...e, isRead: true } : e
        ));
      } catch (error) {
        console.error('Failed to mark email as read:', error);
      }
    }
  };

  const handleStarEmail = async (emailId, isStarred) => {
    try {
      await apiService.updateEmail(emailId, { isStarred: !isStarred });
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, isStarred: !isStarred } : e
      ));
      showSuccess(isStarred ? 'Email unstarred' : 'Email starred');
    } catch (error) {
      console.error('Failed to update email:', error);
      showError('Failed to update email');
    }
  };

  const handleArchiveEmail = async (emailId) => {
    try {
      await apiService.updateEmail(emailId, { folder: 'archived' });
      setEmails(emails.filter(e => e.id !== emailId));
      setSelectedEmail(null);
      showSuccess('Email archived');
    } catch (error) {
      console.error('Failed to archive email:', error);
      showError('Failed to archive email');
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (!confirm('Are you sure you want to delete this email?')) return;
    
    try {
      await apiService.deleteEmails([emailId]);
      setEmails(emails.filter(e => e.id !== emailId));
      setSelectedEmail(null);
      showSuccess('Email deleted');
    } catch (error) {
      console.error('Failed to delete email:', error);
      showError('Failed to delete email');
    }
  };

  const getAccountById = (id) => emailAccounts.find((acc) => acc.id === id);

  const getTotalUnreadCount = () => {
    return emailAccounts.reduce((sum, acc) => sum + (acc.unreadCount || 0), 0);
  };

  if (loading) {
    return (
      <div className="master-inbox">
        <div className="inbox-header">
          <h1>Master Inbox</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading inbox data...
        </div>
      </div>
    );
  }

  const filteredEmails = emails;



  return (
    <div className="master-inbox">
      <div className="inbox-header">
        <h1>Master Inbox</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <Button
              variant={viewMode === "unified" ? "primary" : "outline"}
              size="small"
              onClick={() => setViewMode("unified")}
            >
              <Grid size={16} />
              <span>Unified</span>
            </Button>
            <Button
              variant={viewMode === "separate" ? "primary" : "outline"}
              size="small"
              onClick={() => setViewMode("separate")}
            >
              <List size={16} />
              <span>Separate</span>
            </Button>
          </div>
          <Button variant="primary" onClick={() => setShowConnectModal(true)}>
            <Plus size={16} />
            Connect Email Account
          </Button>
        </div>
      </div>

      <div className="inbox-layout">
        {/* Sidebar - Folders and Email Accounts */}
        <div className="inbox-sidebar">
          {/* Folders Card - Now at the top */}
          <Card className="folders-card">
            <Card.Header>
              <h3>Folders</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="folder-list">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`folder-item ${
                      activeFolder === folder.id ? "folder-item--active" : ""
                    }`}
                    onClick={() => setActiveFolder(folder.id)}
                  >
                    <div className="folder-item__icon">{folder.icon}</div>
                    <div className="folder-item__name">{folder.name}</div>
                    {folder.count > 0 && (
                      <div className="folder-item__count">{folder.count}</div>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Email Accounts Card */}
          <Card>
            <Card.Header>
              <h3>Email Accounts</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="account-list">
                <div
                  className={`account-item ${
                    selectedAccount === "all" ? "account-item--active" : ""
                  }`}
                  onClick={() => setSelectedAccount("all")}
                >
                  <div className="account-item__avatar">
                    <Mail size={16} />
                  </div>
                  <div className="account-item__info">
                    <div className="account-item__name">All Accounts</div>
                    <div className="account-item__count">
                      {emailAccounts.reduce(
                        (sum, acc) => sum + acc.unreadCount,
                        0
                      )}{" "}
                      unread
                    </div>
                  </div>
                </div>

                {emailAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`account-item ${
                      selectedAccount === account.id
                        ? "account-item--active"
                        : ""
                    }`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <div className="account-item__avatar">{account.avatar}</div>
                    <div className="account-item__info">
                      <div className="account-item__name">{account.email}</div>
                      <div className="account-item__provider">
                        {account.provider}
                      </div>
                    </div>
                    {account.unreadCount > 0 && (
                      <div className="account-item__badge">
                        {account.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Main Content */}
        <div className="inbox-main">
          {/* Search and Filters */}
          <Card className="inbox-controls">
            <Card.Body>
              <div className="controls-row">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="control-buttons">
                  <Button variant="outline" size="small">
                    <Filter size={16} />
                    Filters
                  </Button>
                  <Button variant="outline" size="small">
                    <Archive size={16} />
                    Archive
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Email List */}
          <Card className="email-list-card">
            <Card.Body className="p-0">
              <div className="email-list">
                {filteredEmails.length === 0 ? (
                  <div className="empty-state">
                    <Mail size={48} />
                    <h3>No emails found</h3>
                    <p>
                      {viewMode === "unified"
                        ? "Your unified inbox is empty"
                        : "No emails in this folder"}
                    </p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`email-item ${
                        !email.isRead ? "email-item--unread" : ""
                      } ${
                        selectedEmail?.id === email.id
                          ? "email-item--selected"
                          : ""
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="email-item__avatar">
                        {email.fromName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="email-item__content">
                        <div className="email-item__header">
                          <div className="email-item__from">
                            <span className="email-item__name">
                              {email.fromName}
                            </span>
                            <span className="email-item__email">
                              {email.from}
                            </span>
                          </div>
                          <div className="email-item__meta">
                            {email.isStarred && (
                              <Star size={14} className="star-icon" />
                            )}
                            <span className="email-item__time">
                              {email.time}
                            </span>
                          </div>
                        </div>
                        <div className="email-item__subject">
                          {email.subject}
                        </div>
                        <div className="email-item__preview">
                          {email.preview}
                        </div>
                        <div className="email-item__labels">
                          {email.labels.map((label) => (
                            <span key={label} className="email-label">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Email Detail Panel */}
        {selectedEmail && (
          <div className="inbox-detail">
            <Card className="email-detail">
              <Card.Header>
                <div className="email-detail__header">
                  <div className="email-detail__info">
                    <h3>{selectedEmail.subject}</h3>
                    <div className="email-detail__meta">
                      <span>
                        {selectedEmail.fromName} &lt;{selectedEmail.from}&gt;
                      </span>
                      <span>
                        to {getAccountById(selectedEmail.account)?.email}
                      </span>
                      <span>{selectedEmail.time}</span>
                    </div>
                  </div>
                  <div className="email-detail__actions">
                    <Button variant="ghost" size="small">
                      <Reply size={16} />
                    </Button>
                    <Button variant="ghost" size="small">
                      <Forward size={16} />
                    </Button>
                    <Button variant="ghost" size="small">
                      <Archive size={16} />
                    </Button>
                    <Button variant="ghost" size="small">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="email-content">
                  <p>Hi there,</p>
                  <p>{selectedEmail.preview}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris.
                  </p>
                  <p>
                    Best regards,
                    <br />
                    {selectedEmail.fromName}
                  </p>
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="reply-actions">
                  <Button variant="primary">
                    <Reply size={16} />
                    Reply
                  </Button>
                  <Button variant="outline">
                    <Forward size={16} />
                    Forward
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </div>
        )}
      </div>

      {/* Connect Email Modal */}
      {showConnectModal && (
        <div className="connect-modal">
          <div
            className="connect-modal__backdrop"
            onClick={() => setShowConnectModal(false)}
          />
          <div className="connect-modal__content">
            <div className="connect-modal__header">
              <h3>Connect Your Email Account</h3>
              <Button
                variant="ghost"
                onClick={() => setShowConnectModal(false)}
                style={{
                  fontSize: "24px", // Increase text size
                  padding: "8px 16px", // Increase padding
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
              >
                ×
              </Button>
            </div>
            <div className="connect-modal__body">
              <div className="connect-options">
                <div className="connect-option">
                  <div className="connect-option__icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div className="connect-option__info">
                    <h4>Google / Gmail</h4>
                    <p>Connect your Gmail account</p>
                    <input
                      type="email"
                      placeholder="Enter Gmail address"
                      value={newAccountEmail}
                      onChange={(e) => setNewAccountEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <Button variant="primary" onClick={() => { setNewAccountProvider('Gmail'); handleAddEmailAccount(); }} disabled={!newAccountEmail}>Connect</Button>
                </div>

                <div className="connect-option">
                  <div className="connect-option__icon">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png" 
                      alt="Microsoft Outlook" 
                      width="40" 
                      height="40" 
                    />
                  </div>
                  <div className="connect-option__info">
                    <h4>Microsoft Outlook</h4>
                    <p>Connect your Outlook account</p>
                    <input
                      type="email"
                      placeholder="Enter Outlook address"
                      value={newAccountEmail}
                      onChange={(e) => setNewAccountEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <Button variant="primary" onClick={() => { setNewAccountProvider('Outlook'); handleAddEmailAccount(); }} disabled={!newAccountEmail}>Connect</Button>
                </div>

                <div className="connect-option">
                  <div className="connect-option__icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                      <path d="M7 10l5 3 5-3" strokeDasharray="2,2"/>
                    </svg>
                  </div>
                  <div className="connect-option__info">
                    <h4>SMTP Server</h4>
                    <p>Connect using SMTP configuration</p>
                  </div>
                  <Button variant="outline" onClick={() => { setShowConnectModal(false); setShowSMTPModal(true); }}>Configure</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SMTP Configuration Modal */}
      {showSMTPModal && (
        <div className="connect-modal">
          <div className="connect-modal__backdrop" onClick={() => setShowSMTPModal(false)} />
          <div className="connect-modal__content">
            <div className="connect-modal__header">
              <h3>Configure SMTP Server</h3>
              <Button variant="ghost" onClick={() => setShowSMTPModal(false)} style={{ fontSize: "24px", padding: "8px 16px" }}>×</Button>
            </div>
            <div className="connect-modal__body">
              <div className="smtp-form">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" value={smtpConfig.email} onChange={(e) => setSMTPConfig({...smtpConfig, email: e.target.value})} placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }} />
                </div>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>SMTP Host *</label>
                    <input type="text" value={smtpConfig.host} onChange={(e) => setSMTPConfig({...smtpConfig, host: e.target.value})} placeholder="smtp.gmail.com" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div className="form-group">
                    <label>Port *</label>
                    <input type="number" value={smtpConfig.port} onChange={(e) => setSMTPConfig({...smtpConfig, port: parseInt(e.target.value)})} placeholder="587" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input type="text" value={smtpConfig.username} onChange={(e) => setSMTPConfig({...smtpConfig, username: e.target.value})} placeholder="Usually your email address" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }} />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={smtpConfig.password} onChange={(e) => setSMTPConfig({...smtpConfig, password: e.target.value})} placeholder="Your email password or app password" style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={smtpConfig.secure} onChange={(e) => setSMTPConfig({...smtpConfig, secure: e.target.checked})} />
                    Use SSL/TLS (recommended for port 465)
                  </label>
                </div>
                <div className="smtp-presets" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>Common Settings:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div><strong>Gmail:</strong> smtp.gmail.com:587</div>
                    <div><strong>Outlook:</strong> smtp-mail.outlook.com:587</div>
                    <div><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="connect-modal__footer">
              <Button variant="outline" onClick={() => setShowSMTPModal(false)} style={{ padding: '24px 24px', backgroundColor: '#f8f9fa' }}>Cancel</Button>
              <Button variant="primary" onClick={async () => {
                if (!smtpConfig.email || !smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
                  showError('All SMTP fields are required');
                  return;
                }
                try {
                  const response = await apiService.addEmailAccount(smtpConfig.email, 'SMTP', smtpConfig);
                  if (response.success) {
                    showSuccess('SMTP account connected successfully');
                    setSMTPConfig({ email: '', host: '', port: 587, username: '', password: '', secure: false });
                    setShowSMTPModal(false);
                    fetchInboxData();
                    await apiService.syncEmails(response.data.id);
                    fetchEmails();
                  }
                } catch (error) {
                  showError(error.message || 'Failed to connect SMTP account');
                }
              }} disabled={!smtpConfig.email || !smtpConfig.host || !smtpConfig.username || !smtpConfig.password}>
                Connect SMTP
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default MasterInbox;
